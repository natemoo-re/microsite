import { join, resolve, extname, dirname, basename } from "path";
import { OutputOptions, rollup, RollupOptions } from "rollup";
import globby from "globby";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const typescriptPaths = require("rollup-plugin-typescript-paths")
  .typescriptPaths;
const multi = require("rollup-plugin-multi-input").default;
import styles from "rollup-plugin-styles";
import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import autoExternal from "rollup-plugin-auto-external";
import cjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import inject from "@rollup/plugin-inject";
import { terser } from "rollup-plugin-terser";

import { Document, __DocContext, __hydratedComponents } from "../document";
import { h } from "preact";
import render from "preact-render-to-string";
import { promises as fsp } from "fs";
const { readdir, readFile, writeFile, mkdir, copyFile, stat, rmdir } = fsp;

const createHydrateInitScript = ({
  isDebug = false,
}: { isDebug?: boolean } = {}) => {
  return `import { h, hydrate as mount } from 'https://unpkg.com/preact@latest?module';

const createObserver = (hydrate) => {
  if (!('IntersectionObserver') in window) return null;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0;
      if (!isIntersecting) return;
      hydrate();
      io.disconnect();
    })
  });

  return io;
}

function attach($cmp, { key, name, source }) {
  const method = $cmp.dataset.method;

  const hydrate = async () => {
    if ($cmp.dataset.hydrate === '') return;
    ${
      isDebug
        ? 'console.log(`[Hydrate] <${key} /> hydrated via "${method}"`);'
        : ""
    }
    const { [name]: Component } = await import(source); 
    const props = $cmp.dataset.props ? JSON.parse(atob($cmp.dataset.props)) : {};
    mount(h(Component, props, null), $cmp);
    delete $cmp.dataset.props;
    delete $cmp.dataset.method;
    $cmp.dataset.hydrate = '';
  }

  switch (method) {
    case 'idle': {
      if (!('requestIdleCallback' in window) || !('requestAnimationFrame' in window)) return hydrate();

      requestIdleCallback(() => {
        requestAnimationFrame(hydrate);
      }, { timeout: 2000 });
      break;
    }
    case 'interaction': {
      const events = ['focus', 'click', 'touchstart', 'pointerenter'];
      function handleEvent(event) {
        hydrate().then(() => {
          if (event.type === 'focus') event.target.focus();
          for (const e of events) {
            event.target.removeEventListener(e, handleEvent);
          }
        })
      }

      for (const e of events) {
        $cmp.addEventListener(e, handleEvent, { once: true, passive: true, capture: true });
      }
      break;
    }
    case 'visible': {
      if (!('IntersectionObserver') in window) return hydrate();

      const observer = createObserver(hydrate);
      Array.from($cmp.children).forEach(child => observer.observe(child))
      break;
    }
  }
}

export default (manifest) => {
  const $cmps = Array.from(document.querySelectorAll('[data-hydrate]'));
  
  for (const $cmp of $cmps) {
    const key = $cmp.dataset.hydrate;
    const [name, source] = manifest[key];
    attach($cmp, { key, name, source });
  }
}`;
};

const createHydrateScript = (components: string[], manifest: any) => {
  if (components.length === 0) return null;

  const imports = manifest
    .map(({ name, exports }) => {
      return {
        name,
        exports: exports.filter(
          ([_key, name]: [string, string]) =>
            components.findIndex((n) => n === name) > -1
        ),
      };
    })
    .filter(({ exports }) => exports.length > 0)
    .map(({ name, exports }) =>
      exports
        .map(
          ([key, comp]) =>
            `  '${comp}': ['${key}', '/_hydrate/chunks/${name}'],`
        )
        .join("\n")
    )
    .join("\n");

  return `import hydrate from '/_hydrate/index.js';
hydrate({
${imports.slice(0, -1)}
});`;
};

const requiredPlugins = [
  nodeResolve({
    preferBuiltins: true,
    mainFields: ["module", "main"],
    dedupe: ["preact/compat"],
    extensions: [".mjs", ".js", ".json", ".node", ".jsx", ".ts", ".tsx"],
  }),
  cjs({
    extensions: [".mjs", ".js", ".json", ".node", ".jsx", ".ts", ".tsx"],
  }),
  typescriptPaths({
    transform(filename: string) {
      return filename.replace(/\.js$/i, ".tsx");
    },
  }),
  inject({
    fetch: "node-fetch",
    h: ["preact", "h"],
    Fragment: ["preact", "Fragment"],
  }),
];

const globalPlugins = [
  styles({
    config: true,
    mode: "extract",
    autoModules: true,
    minimize: true,
    sourceMap: false,
  }),
];

const createPagePlugins = () => [
  styles({
    config: true,
    mode: "extract",
    minimize: true,
    autoModules: true,
    modules: {
      generateScopedName: "[hash:6]",
    },
    sourceMap: false,
  }),
];

const OUTDIR = "./.microsite";
const OUTPUT_DIR = join(OUTDIR, "build");

const outputOptions: OutputOptions = {
  format: "esm",
  sourcemap: false,
  hoistTransitiveImports: false,
  minifyInternalExports: false,
};

const internalRollupConfig: RollupOptions = {
  context: "globalThis",
  external: [
    "node-fetch",
    "microsite/head",
    "microsite/document",
    "microsite/page",
    "microsite/hydrate",
    "preact",
    "preact/hooks",
    "preact/jsx-runtime",
    "preact-render-to-string",
  ],

  treeshake: true,

  onwarn(message) {
    if (/empty chunk/.test(`${message}`)) return;
    if (message.pluginCode === "TS2686") return;
    console.error(message);
  },

  manualChunks(id, { getModuleInfo }) {
    const info = getModuleInfo(id);

    const dependentEntryPoints = [];
    if (info.importedIds.includes("microsite/hydrate")) {
      const idsToHandle = new Set([
        ...info.importers,
        ...info.dynamicImporters,
      ]);

      for (const moduleId of idsToHandle) {
        const { isEntry, dynamicImporters, importers } = getModuleInfo(
          moduleId
        );

        // naive check to see if module is a "facade" to only export sub-modules
        // const isFacade = (basename(moduleId, extname(moduleId)) === 'index') && !isEntry && importedIds.every(m => dirname(m).startsWith(dirname(moduleId)));

        if (isEntry || [...importers, ...dynamicImporters].length > 0)
          dependentEntryPoints.push(moduleId);

        for (const importerId of importers) idsToHandle.add(importerId);
      }
    }

    if (dependentEntryPoints.length > 1) {
      return `hydrate/shared`;
    } else if (dependentEntryPoints.length === 1) {
      return `hydrate/${info.id.split("/").slice(-1)[0].split(".")[0]}`;
    }
  },
};

async function writeGlobal() {
  try {
    (await stat("./src/global.ts")).isFile();
  } catch (e) {
    return;
  }

  const global = await rollup({
    ...internalRollupConfig,
    plugins: [
      autoExternal(),
      esbuild({ target: "es2018", jsxFactory: "h", jsxFragment: "Fragment" }),
      ...requiredPlugins,
      ...globalPlugins,
    ],
    input: "src/global.ts",
  });
  const legacy = await rollup({
    ...internalRollupConfig,
    plugins: [
      autoExternal(),
      esbuild({ target: "es2015", jsxFactory: "h", jsxFragment: "Fragment" }),
      ...requiredPlugins,
      ...globalPlugins,
    ],
    input: "src/global.ts",
  });

  try {
    return Promise.all([
      global.write({
        format: "esm",
        sourcemap: false,
        assetFileNames: "global.css",
        dir: OUTPUT_DIR,
        name: "global",
      }),
      legacy.write({
        format: "system",
        sourcemap: false,
        file: join(OUTPUT_DIR, "global.legacy.js"),
      }),
    ]);
  } catch (e) {
    console.log(e);
  }
}

async function writePages() {
  try {
    const input = await globby("src/pages/**/*.tsx");

    const bundle = await rollup({
      ...internalRollupConfig,
      plugins: [
        autoExternal(),
        esbuild({ target: "es2018", jsxFactory: "h", jsxFragment: "Fragment" }),
        ...requiredPlugins,
        ...createPagePlugins(),
      ],
      input: input.reduce((acc, page) => {
        let entryName = page.split("pages")[1].slice(1);
        entryName = entryName.slice(0, extname(entryName).length * -1);
        return { ...acc, [`pages/${entryName}`]: page };
      }, {}),
    });

    const result = await bundle.write({
      ...outputOptions,
      assetFileNames: "[name][extname]",
      dir: OUTPUT_DIR,
    });
    return result;
  } catch (e) {
    console.log(e);
  }
}

async function readDir(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? readDir(join(dir, entry.name))
          : join(dir, entry.name)
      )
    ).then((arr) => arr.flat(Infinity));
  } catch (e) {
    return [];
  }
}

async function prepare() {
  const paths = [resolve("./dist"), resolve(OUTPUT_DIR)];
  await Promise.all(paths.map((p) => rmdir(p, { recursive: true })));
  await Promise.all([...paths].map((p) => mkdir(p, { recursive: true })));

  try {
    if ((await stat("./src/public")).isDirectory()) {
      const files = await readDir("./src/public");
      await Promise.all(
        files.map((file) =>
          copyFile(
            resolve(process.cwd(), file),
            resolve(process.cwd(), "./dist/" + file.slice("src/public/".length))
          )
        )
      );
    }
  } catch (e) {}
}

async function cleanup({ err = false }: { err?: boolean } = {}) {
  const paths = [OUTDIR];
  await Promise.all(paths.map((p) => rmdir(p, { recursive: true })));
  if (err) {
    await rmdir("./dist", { recursive: true });
  }
}

const DYNAMIC_ROUTE = /\[[^/]+?\](?=\/|$)/;
function isDynamicRoute(route: string): boolean {
  return DYNAMIC_ROUTE.test(route);
}
const routeToSegments = (route: string) =>
  route.split("/").map((text) => {
    const isDynamic = isDynamicRoute(text);
    const isCatchAll = isDynamic && text.slice(1, -1).startsWith("...");
    return { text, isDynamic, isCatchAll };
  });

export interface Params {
  [param: string]: string | string[];
}

interface RouteInfo {
  segments: ReturnType<typeof routeToSegments>;
  params: Params;
}
export type StaticPath<P extends Params = Params> = string | { params: P };
export interface StaticPropsContext<P extends Params = Params> {
  path: string;
  params: P;
}

const validateStaticPath = (staticPath: unknown, { segments }: RouteInfo) => {
  if (typeof staticPath === "string") {
    if (segments.find((v) => v.isCatchAll)) {
      return staticPath.replace(/^\//, "").split("/").length >= segments.length;
    } else {
      return staticPath.replace(/^\//, "").split("/").length >= segments.length;
    }
  } else if (
    typeof staticPath === "object" &&
    typeof (staticPath as any).params === "object"
  ) {
    const { params } = staticPath as any;
    return (
      JSON.stringify(Object.keys(params)) ===
      JSON.stringify(Object.keys(params))
    );
  }
  return false;
};
const validateStaticPaths = (
  staticPaths: unknown,
  { segments, params }: RouteInfo
): staticPaths is StaticPath[] => {
  if (
    typeof staticPaths === "object" &&
    Array.isArray((staticPaths as any).paths)
  ) {
    const paths = (staticPaths as any).paths as any[];
    return paths.every((path) =>
      validateStaticPath(path, { segments, params })
    );
  }
  return false;
};
const getParamsFromRoute = (
  route: string,
  segments: ReturnType<typeof routeToSegments>
): Params => {
  const parts = route.replace(/^\//, "").split("/");
  return parts.reduce((acc, part, i) => {
    const segment = segments[i] ?? segments[segments.length - 1];
    if (segment.isCatchAll) {
      const key = segment.text.slice(4, -1);
      return { ...acc, [key]: [...(acc[key] ?? []), part] };
    }
    if (segment.isDynamic) {
      const key = segment.text.slice(1, -1);
      return { ...acc, [key]: part };
    }
    return acc;
  }, {});
};
const staticPathToStaticPropsContext = (
  staticPath: StaticPath<any>,
  { segments }: RouteInfo
): StaticPropsContext<any> => {
  if (typeof staticPath === "string")
    return {
      path: staticPath,
      params: getParamsFromRoute(staticPath, segments),
    };
  return {
    ...staticPath,
    path: segments
      .map((segment) => {
        const key = segment.text.slice(1, -1);
        return segment.isDynamic ? staticPath.params[key] : segment.text;
      })
      .join("/"),
  };
};

async function renderPage(
  page: any,
  { styles, hydrateExportManifest, hasGlobalScript, globalStyle, isDebug }: any
) {
  let baseHydrate = false;
  let routeHydrate = false;
  const output = [];
  let {
    default: Page,
    getStaticProps = () => {},
    getStaticPaths,
    __name,
  } = page;

  if (typeof Page === "object") {
    if (Page.path && Page.path.replace(/^\//, "") !== __name) {
      console.warn(
        `"/${__name}" uses \`definePage\` with a \`path\` value of \`${Page.path}\`.\n\nDid you mean to update your file structure?\nNote that \`path\` is used for type inference only and has no effect on the build process.`
      );
    }
    getStaticProps = Page.getStaticProps ?? (() => {});
    getStaticPaths = Page.getStaticPaths;
    Page = Page.Component;
  }

  const { content: style = null } =
    styles.find((style) => style.__name === __name) || {};

  let staticPaths: StaticPropsContext[] = [{ path: __name, params: {} }];

  if (typeof getStaticPaths === "function") {
    if (!isDynamicRoute(__name))
      throw new Error(
        `Error building /${__name}!\nExported \`getStaticPaths\`, but ${__name} is not a dynamic route`
      );
    const routeSegments = routeToSegments(__name);
    const baseParams = getParamsFromRoute(__name, routeSegments);
    const routeInfo: RouteInfo = {
      segments: routeSegments,
      params: baseParams,
    };

    const catchAllIndex = routeSegments.findIndex((v) => v.isCatchAll);
    if (catchAllIndex !== -1 && catchAllIndex < routeSegments.length - 1)
      throw new Error(
        `Error building /${__name}!\n\`${routeSegments[catchAllIndex].text}\` must be the final segment of the route`
      );
    staticPaths = await getStaticPaths();
    if (!staticPaths)
      throw new Error(
        `Error building /${__name}!\n\`getStaticPaths\` must return a value`
      );
    if (!validateStaticPaths(staticPaths, routeInfo))
      throw new Error(
        `Error building /${__name}!\nOne or more return values from \`getStaticPaths\` has an incorrect shape.\nEnsure that the returned values have the same number of segments as the route. Static path strings must begin from the site root.`
      );

    const { paths } = (staticPaths as unknown) as {
      paths: StaticPath[];
    };

    staticPaths = paths.map((staticPath) =>
      staticPathToStaticPropsContext(staticPath, routeInfo)
    );
  } else if (isDynamicRoute(__name)) {
    throw new Error(
      `Error building /${__name}!\n${__name} is a dynamic route, but \`getStaticPaths\` is missing. Did you forget to \`export\` it?`
    );
  }

  async function fetchSingle({ params, path }: StaticPropsContext) {
    let props = {};
    try {
      const res = await getStaticProps({
        path,
        params: JSON.parse(JSON.stringify(params)),
      });
      props = res?.props ?? {};
    } catch (e) {
      console.error(`Error getting static props for "${path}"`);
      console.error(e);
    }
    return { path, props };
  }

  async function renderSingle({ path, props }: { path: string; props: any }) {
    try {
      const content =
        "<!DOCTYPE html>\n<!-- Generated by microsite -->\n" +
        render(
          <Document
            hydrateExportManifest={hydrateExportManifest}
            page={__name}
            hasScripts={hasGlobalScript}
            styles={[globalStyle, style].filter((v) => v)}
          >
            <Page {...props} />
          </Document>,
          {},
          { pretty: true }
        );
      const { components } =
        __hydratedComponents.find((s) => s.page === __name) ?? {};

      if (components) {
        if (!baseHydrate) {
          output.push({
            name: `_hydrate/index.js`,
            content: createHydrateInitScript({ isDebug }),
          });
          baseHydrate = true;
        }

        if (!routeHydrate) {
          output.push({
            name: `_hydrate/pages/${__name}.js`,
            content: createHydrateScript(components, hydrateExportManifest),
          });
          routeHydrate = true;
        }
      }

      output.push({
        name: `${path === "/" ? "/index" : path}.html`,
        content: content.replace(/^\s+$/gm, "\n"),
      });
    } catch (e) {
      console.log(`Error building /${__name}.html`);
      console.error(e);
      await cleanup({ err: true });
      return;
    }
  }

  const pages = await Promise.all(staticPaths.map((ctx) => fetchSingle(ctx)));
  await Promise.all(
    pages.map(({ path, props }) => renderSingle({ path, props }))
  );

  return output;
}

export async function build(args: string[] = []) {
  const isDebug = args.includes("--debug-hydration");
  await prepare();
  await Promise.all([writeGlobal(), writePages()]);

  let globalStyle = null;
  let hasGlobalScript = false;
  try {
    globalStyle = await readFile(join(OUTPUT_DIR, "global.css")).then((v) =>
      v.toString()
    );
    hasGlobalScript = await readFile(join(OUTPUT_DIR, "global.js")).then(
      (v) => !!v.toString().trim()
    );
  } catch (e) {}

  if (hasGlobalScript) {
    await Promise.all([
      copyFile(resolve(join(OUTPUT_DIR, "global.js")), "dist/index.js"),
      copyFile(
        resolve(join(OUTPUT_DIR, "global.legacy.js")),
        "dist/index.legacy.js"
      ),
    ]);
  }

  const files = await readDir(join(OUTPUT_DIR, "pages"));
  const getName = (f: string, base = "pages") =>
    f.slice(f.indexOf(`${base}/`) + base.length + 1, extname(f).length * -1);
  const styles: any[] = await Promise.all(
    files
      .filter((f) => f.endsWith(".css"))
      .map((f) =>
        readFile(f).then((buff) => ({
          __name: getName(f),
          content: buff.toString(),
        }))
      )
  );
  const pages: any[] = await Promise.all(
    files
      .filter((f) => f.endsWith(".js"))
      .map((f) =>
        import(join(process.cwd(), f)).then((mod) => ({
          ...mod,
          __name: getName(f),
        }))
      )
  );

  let hydrateFiles = [];
  let hydrateExportManifest = [];
  try {
    hydrateFiles = await readDir(join(OUTPUT_DIR, "hydrate"));
    hydrateExportManifest = await Promise.all(
      hydrateFiles
        .filter((f) => extname(f) === ".js")
        .map((file) => {
          const style = basename(file).split("-")[0] + ".css";
          const styleFile = resolve(join(".", dirname(file), style));
          let styles = null;
          return stat(styleFile)
            .then((stats) => {
              if (stats.isFile()) {
                return readFile(styleFile).then((buff) => {
                  styles = buff.toString();
                });
              }
            })
            .then(() => {
              return import(join(process.cwd(), file)).then((mod) => ({
                name: basename(file),
                styles,
                exports: Object.keys(mod).map((key) => [key, mod[key].name]),
              }));
            });
        })
    );

    const input = await globby(join(OUTPUT_DIR, "hydrate", "**", "*.js"));
    if (input.length > 0) {
      const hydrateBundle = await rollup({
        treeshake: true,
        input,
        external: ["preact", "preact/hooks"],
        plugins: [
          multi(),
          replace({
            values: {
              "import { withHydrate } from 'microsite/hydrate';":
                "const withHydrate = v => v;",
            },
            delimiters: ["", ""],
          }),
          terser(),
        ],
        onwarn(warning, handler) {
          if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
          handler(warning);
        },
      });
      await hydrateBundle.write({
        paths: {
          preact: "https://unpkg.com/preact@latest?module",
          "preact/hooks":
            "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module",
        },
        minifyInternalExports: true,
        dir: resolve("dist/_hydrate/chunks"),
        entryFileNames: (info) => `${basename(info.name)}.js`,
      });
    }
  } catch (e) {}

  let output = [];
  try {
    output = await Promise.all(
      pages.map((page) =>
        renderPage(page, {
          styles,
          hydrateExportManifest,
          hasGlobalScript,
          globalStyle,
          isDebug,
        })
      )
    );
  } catch (e) {
    console.error(e);
  }

  await Promise.all([
    ...output.flat().map(({ name, content }) =>
      mkdir(resolve(`./dist/${dirname(name)}`), {
        recursive: true,
      }).then(() => writeFile(resolve(`./dist/${name}`), content))
    ),
  ]);

  await cleanup();
}
