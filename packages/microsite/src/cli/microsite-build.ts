import { build as buildProject } from "snowpack";
import { dirname, resolve } from "path";
import glob from "globby";
import arg from "arg";
import { rollup } from "rollup";
import { performance } from "perf_hooks";
import { green, dim } from "kleur/colors";
import styles from "rollup-plugin-styles";
import esbuild from "esbuild";
import module from "module";
const { createRequire, builtinModules: builtins } = module;
const require = createRequire(import.meta.url);
import {
  STAGING_DIR,
  SSR_DIR,
  OUT_DIR_NO_BASE,
  OUT_DIR,
  importDataMethods,
  applyDataMethods,
  preactImportTransformer,
  proxyImportTransformer,
  getFileNameFromPath,
  hashContentSync,
  emitFile,
  renderPage,
  emitFinalAsset,
  copyAssetToFinal,
  stripWithHydrate,
  preactToCDN,
  setBasePath,
  CACHE_DIR,
} from "../utils/build.js";
import type { ManifestEntry, RouteDataEntry } from "../utils/build";
import { rmdir, mkdir, copyDir, copyFile } from "../utils/fs.js";
import { statSync } from "fs";
import {
  resolveNormalizedBasePath,
  loadConfiguration,
} from "../utils/command.js";

function parseArgs(argv: string[]) {
  return arg(
    {
      "--debug-hydration": Boolean,
      "--no-clean": Boolean,
      "--no-open": Boolean,

      "--serve": Boolean,
      "--base-path": String,
    },
    { permissive: true, argv }
  );
}

export default async function build(
  argvOrParsedArgs: string[] | ReturnType<typeof parseArgs>
) {
  const args = Array.isArray(argvOrParsedArgs)
    ? parseArgs(argvOrParsedArgs)
    : argvOrParsedArgs;
  let basePath = resolveNormalizedBasePath(args);
  setBasePath(basePath);

  const config = await loadConfiguration("build");
  const buildStart = performance.now();
  await Promise.all([
    prepare(),
    buildProject({ config, lockfile: null }),
  ]);

  let pages = await glob(resolve(STAGING_DIR, "src/pages/**/*.js"));
  let globalEntryPoint = resolve(STAGING_DIR, "src/global/index.js");
  let globalStyle = resolve(STAGING_DIR, "src/global/index.css");
  try {
    globalEntryPoint = statSync(globalEntryPoint) ? globalEntryPoint : null;
  } catch (e) {
    globalEntryPoint = null;
  }
  try {
    globalStyle = statSync(globalStyle) ? globalStyle : null;
  } catch (e) {
    globalStyle = null;
  }

  pages = pages.filter((page) => !page.endsWith(".proxy.js"));

  let [manifest, routeData] = await Promise.all([
    bundlePagesForSSR(globalEntryPoint ? [...pages, globalEntryPoint] : pages),
    fetchRouteData(pages.filter((page) => !page.endsWith("_document.js"))),
  ]);
  if (globalStyle) {
    manifest = manifest.map((entry) => ({
      ...entry,
      hydrateStyleBindings: [
        "_hydrate/styles/_global.css",
        ...(entry.hydrateStyleBindings || []),
      ],
    }));
  }
  await Promise.all([
    ssr(manifest, routeData, {
      basePath,
      debug: args["--debug-hydration"],
      hasGlobalScript: globalEntryPoint !== null,
    }),
    copyHydrateAssets(manifest, globalStyle),
  ]);

  const buildEnd = performance.now();
  console.log(
    `${green("✔")} build complete ${dim(
      `[${((buildEnd - buildStart) / 1000).toFixed(2)}s]`
    )}`
  );

  // TODO: print tree of generated files
  if (!args["--no-clean"]) await cleanup();

  if (args["--serve"]) {
    const toForward = ["--base-path", "--no-open"];
    let forwardArgs = {} as any;
    for (const arg of toForward) {
      forwardArgs[arg] = args[arg];
    }
    return import("./microsite-serve.js").then(({ default: serve }) =>
      serve(forwardArgs)
    );
  }

  process.exit(0);
}

async function prepare() {
  const paths = [SSR_DIR];

  await Promise.all([...paths, OUT_DIR_NO_BASE].map((p) => rmdir(p)));
  await Promise.all([...paths].map((p) => mkdir(p)));
  await copyDir(
    resolve(process.cwd(), "./public"),
    resolve(process.cwd(), `./${OUT_DIR}`)
  );
}

async function copyHydrateAssets(
  manifest: ManifestEntry[],
  globalStyle?: string | null
) {
  const service = await esbuild.startService();
  let tasks: any = [];
  const transform = async (source: string) => {
    source = stripWithHydrate(source);
    source = preactToCDN(source);
    const result = await service.transform(source, {
      minify: true,
      minifyIdentifiers: false,
    });
    return result.code;
  };

  if (globalStyle) {
    tasks.push(
      copyFile(globalStyle, resolve(OUT_DIR, "_hydrate/styles/_global.css"))
    );
  }

  if (
    manifest.some(
      (entry) =>
        entry.hydrateBindings && Object.keys(entry.hydrateBindings).length > 0
    )
  ) {
    const transformInit = async (source: string) => {
      source = preactToCDN(source);
      const result = await service.transform(source, {
        minify: true,
      });
      return result.code;
    };

    tasks.push(
      copyFile(
        require.resolve("microsite/assets/microsite-runtime.js"),
        resolve(OUT_DIR, "_hydrate/microsite-runtime.js"),
        { transform: transformInit }
      )
    );
  }

  const jsAssets = await glob(resolve(SSR_DIR, "_hydrate/**/*.js"));
  const hydrateStyleAssets = await glob(resolve(SSR_DIR, "_hydrate/**/*.css"));
  await Promise.all([
    ...tasks,
    ...jsAssets.map((asset) => copyAssetToFinal(asset, transform)),
    ...hydrateStyleAssets.map((asset) => copyAssetToFinal(asset)),
  ]);
  service.stop();
  return;
}

async function fetchRouteData(paths: string[]) {
  let routeData: RouteDataEntry[] = [];
  await Promise.all(
    paths.map((path) =>
      importDataMethods(path)
        .then((handlers) =>
          applyDataMethods(
            path.replace(
              resolve(process.cwd(), `./${STAGING_DIR}/src/pages`),
              ""
            ),
            handlers
          )
        )
        .then((entry) => {
          routeData = routeData.concat(...entry);
        })
    )
  );
  return routeData;
}

/**
 * This function runs rollup on Snowpack's output to
 * extract the hydrated chunks and prepare the pages to be
 * server-side rendered.
 */
async function bundlePagesForSSR(paths: string[]) {
  const bundle = await rollup({
    input: paths.reduce((acc, page) => {
        if (/pages\//.test(page)) {
          return {
            ...acc,
            [page.slice(page.indexOf("pages/"), -3)]: page,
          }
        }
        if (/global\/index\.js/.test(page)) {
          return {
            ...acc,
            '_hydrate/chunks/_global': page,
          }
        }
      }, {}
    ),
    external: (source: string) => {
      return (
        builtins.includes(source) ||
        source.startsWith("microsite") ||
        source.startsWith("preact")
      );
    },
    plugins: [
      rewriteCssProxies(),
      rewritePreact(),
      styles({
        config: true,
        mode: "extract",
        minimize: true,
        autoModules: true,
        modules: {
          generateScopedName: `[local]_[hash:5]`,
        },
        sourceMap: false,
      }),
    ],
    onwarn(warning, handler) {
      // unresolved import happens for anything just called server-side
      if (warning.code === "UNRESOLVED_IMPORT") return;

      handler(warning);
    },
  });

  const { output } = await bundle.generate({
    dir: SSR_DIR,
    format: "esm",
    sourcemap: false,
    hoistTransitiveImports: false,
    minifyInternalExports: false,
    chunkFileNames: "[name].js",
    assetFileNames: "[name][extname]",
    /**
     * This is where most of the magic happens...
     * We loop through all the modules and group any hydrated components
     * based on the entryPoint which imported them.
     *
     * Components reused for multiple routes are placed in a shared chunk.
     *
     * All code from '_snowpack/pkg' is placed in a vendor chunk.
     */
    manualChunks(id, { getModuleInfo }) {
      const info = getModuleInfo(id);
      const isStyle = id.endsWith(".css");
      if (isStyle) return;

      if (info.importers.length === 1) {
        // If we only import this module in global/index.js, inline to _global chunk
        if (/global\/index\.js$/.test(info.importers[0])) return `_hydrate/chunks/_vendor/global`;
      }
      if (/_snowpack\/pkg/.test(info.id)) return `_hydrate/chunks/_vendor/index`;

      const dependentStaticEntryPoints = [];
      const dependentHydrateEntryPoints = [];
      const target = info.importedIds.includes("microsite/hydrate")
        ? dependentHydrateEntryPoints
        : dependentStaticEntryPoints;
      const idsToHandle = new Set([
        ...info.importers,
        ...info.dynamicImporters,
      ]);

      for (const moduleId of idsToHandle) {
        const { isEntry, dynamicImporters, importers } = getModuleInfo(
          moduleId
        );

        // TODO: naive check to see if module is a "facade" to only export sub-modules (something like `/components/index.ts`)
        // const isFacade = (basename(moduleId, extname(moduleId)) === 'index') && !isEntry && importedIds.every(m => dirname(m).startsWith(dirname(moduleId)));

        if (isEntry || [...importers, ...dynamicImporters].length > 0)
          target.push(moduleId);

        for (const importerId of importers) idsToHandle.add(importerId);
      }

      if (dependentHydrateEntryPoints.length > 1) {
        // All shared components should go in the same chunk (for now)
        // Eventually this could be optimized to split into a few chunks based on how many entry points rely on them
        return `_hydrate/chunks/_shared`;
      }

      if (dependentStaticEntryPoints.length > 1) {
        return '_hydrate/chunks/_static_shared';
      }

      if (dependentHydrateEntryPoints.length === 1) {
        const { code } = getModuleInfo(dependentHydrateEntryPoints[0]);
        const hash = hashContentSync(code, 8);
        const filename = `${getFileNameFromPath(
          dependentHydrateEntryPoints[0]
        ).replace(/^pages\//, "")}-${hash}`;

        return `_hydrate/chunks/${filename}`;
      }
    },
  });

  const manifest: ManifestEntry[] = [];

  /**
   * Here we're manually emitting the files so we have a chance
   * to generate a manifest detailing any dependent styles or
   * hydrated chunks per entry-point.
   *
   * Later, we'll pass the manifest to the SSR function.
   */
  await Promise.all(
    output.map((chunkOrAsset) => {
      if (chunkOrAsset.type === "asset") {
        if (chunkOrAsset.name.startsWith("_hydrate")) {
          const finalAssetName = chunkOrAsset.name.replace(
            /\bchunks\b/,
            "styles"
          );
          manifest.forEach((entry) => {
            let binding = chunkOrAsset.name.replace(/\.css$/, ".js");
            if (entry.hydrateBindings && entry.hydrateBindings[binding]) {
              entry.hydrateStyleBindings = Array.from(
                new Set([...entry.hydrateStyleBindings, finalAssetName])
              );
            }
          });
          return emitFile(finalAssetName, chunkOrAsset.source);
        } else {
          const entryName = chunkOrAsset.name.replace(/\.css$/, ".js");
          const inManifest = manifest.find((entry) => entry.name === entryName);
          const finalAssetName = chunkOrAsset.name.replace(
            /^pages/,
            "_hydrate/styles"
          );

          if (inManifest) {
            manifest.forEach((entry) => {
              if (entry.name === entryName) {
                entry.hydrateStyleBindings = Array.from(
                  new Set([
                    ...entry.hydrateStyleBindings,
                    `${finalAssetName}?m=${hashContentSync(
                      chunkOrAsset.source.toString(),
                      8
                    )}`,
                  ])
                );
              }
            });
          } else {
            manifest.push({
              name: entryName,
              hydrateStyleBindings: [],
              hydrateBindings: {},
            });
          }
          return emitFile(finalAssetName, chunkOrAsset.source);
        }
      } else {
        if (chunkOrAsset.name.startsWith("_hydrate/")) {
          return emitFile(`${chunkOrAsset.name}.js`, chunkOrAsset.code);
        } else if (chunkOrAsset.isEntry) {
          let hydrateBindings = {};
          for (const [file, exports] of Object.entries(
            chunkOrAsset.importedBindings
          )) {
            if (
              file.startsWith("_hydrate/") &&
              !(file.endsWith("_vendor.js") || file.endsWith("_static_shared.js"))
            ) {
              hydrateBindings = Object.assign(hydrateBindings, {
                [file]: exports,
              });
            }
          }

          const entryName = `${chunkOrAsset.name}.js`;
          const inManifest = manifest.find((entry) => entry.name === entryName);

          if (inManifest) {
            manifest.forEach((entry) => {
              if (entry.name === entryName) {
                entry.hydrateBindings = Object.assign(
                  entry.hydrateBindings || {},
                  hydrateBindings
                );
              }
            });
          } else {
            manifest.push({
              name: entryName,
              hydrateStyleBindings: [],
              hydrateBindings,
            });
          }

          emitFile(entryName, chunkOrAsset.code);
        } else {
          console.log(
            `Unexpected chunk: ${chunkOrAsset.name}`,
            chunkOrAsset.code
          );
        }
      }
    })
  );

  return manifest
    .filter(({ name }) => name !== "pages/_document.js")
    .map((entry) => {
      if (Object.keys(entry.hydrateBindings).length === 0)
        entry.hydrateBindings = null;
      if (entry.hydrateStyleBindings.length === 0)
        entry.hydrateStyleBindings = null;
      return entry;
    });
}

/**
 * Snowpack rewrites CSS to a `.css.proxy.js` file.
 * Great for dev, but we need to revert to the actual CSS file
 */
const rewriteCssProxies = () => {
  return {
    name: "@microsite/rollup-rewrite-css-proxies",
    resolveId(source: string, importer: string) {
      if (!proxyImportTransformer.filter(source)) return null;
      return resolve(
        dirname(importer),
        proxyImportTransformer.transform(source)
      );
    },
  };
};

/**
 * Snowpack rewrites CSS to a `.css.proxy.js` file.
 * Great for dev, but we need to revert to the actual CSS file
 */
const rewritePreact = () => {
  return {
    name: "@microsite/rollup-rewrite-preact",
    resolveId(source: string) {
      if (!preactImportTransformer.filter(source)) return null;
      return preactImportTransformer.transform(source);
    },
  };
};

async function ssr(
  manifest: ManifestEntry[],
  routeData: RouteDataEntry[],
  { basePath = "/", debug = false, hasGlobalScript = false } = {}
) {
  return Promise.all(
    routeData.map((entry) =>
      renderPage(
        entry,
        manifest.find(
          (route) => route.name.replace(/^pages/, "") === entry.name
        ),
        { basePath, debug, hasGlobalScript }
      )
        .then(({ name, contents }) => {
          return { name, contents };
        })
        .then(({ name, contents }) => emitFinalAsset(name, contents))
    )
  );
}

async function cleanup() {
  const paths = [STAGING_DIR, SSR_DIR, CACHE_DIR];
  await Promise.all(paths.map((p) => rmdir(p)));
}
