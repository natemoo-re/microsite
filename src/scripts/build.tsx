import { join, resolve, extname, dirname, basename } from "path";
import { AcornNode, OutputOptions, rollup, RollupOptions } from "rollup";
import { walk } from "estree-walker";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const multi = require("rollup-plugin-multi-input").default;
import styles from "rollup-plugin-styles";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import cjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import inject from "@rollup/plugin-inject";
import { terser } from "rollup-plugin-terser";

import { Document, __DocContext, __hydratedComponents } from "../document";
import React from "preact/compat";
import render from "preact-render-to-string";
import { promises as fsp } from "fs";
import { rm } from "fs/promises";
const { readdir, readFile, writeFile, mkdir, copyFile, stat } = fsp;

const BASE_DIR = process.cwd();
const ROOT_DIR = join(BASE_DIR, "src");

const createHydrateInitScript = () => {
  return `import { h, hydrate } from 'https://unpkg.com/preact@latest?module';

export default (Components) => {
  const $cmps = Array.from(document.querySelectorAll('[data-hydrate]'));
  for (const $cmp of $cmps) {
    const Component = Components[$cmp.dataset.hydrate];
    const props = $cmp.dataset.props ? JSON.parse(atob($cmp.dataset.props)) : {};
    hydrate(h(Component, props, null), $cmp);
    delete $cmp.dataset.props;
    $cmp.dataset.hydrate = '';
  }
}`;
};

const createHydrateScript = (components: string[], manifest: any) => {
  if (components.length === 0) return null;

  const imports = manifest
    .map(({ name, exports }) => ({
      name,
      exports: exports.filter(
        (name: string) => components.findIndex((n) => n === name) > -1
      ),
    }))
    .filter(({ exports }) => exports.length > 0)
    .map(
      ({ name, exports }) =>
        `import { ${exports.join(", ")} } from '/_hydrate/chunks/${name}';`
    )
    .join("\n");

  return `import hydrate from '/_hydrate/index.js';
${imports}

hydrate({ ${components.join(", ")} });`;
};

const requiredPlugins = [
  inject({
    fetch: "node-fetch",
    React: "preact/compat",
  }),
  alias({
    entries: [
      { find: /^@\/(.*)/, replacement: join(ROOT_DIR, "$1.js") },
      { find: "react", replacement: "preact/compat" },
      { find: "react-dom", replacement: "preact/compat" },
    ],
  }),
  nodeResolve({
    mainFields: ["module", "main"],
    dedupe: ["preact/compat"],
  }),
  cjs(),
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

const OUTPUT_DIR = "./.tmp/microsite";

const outputOptions: OutputOptions = {
  format: "esm",
  sourcemap: false,
  hoistTransitiveImports: false,
  minifyInternalExports: false,
};

/**
 * Catch all identifiers that begin with "use" followed by an uppercase Latin
 * character to exclude identifiers like "user".
 */

function isHookName(s) {
  return /^use[A-Z0-9].*$/.test(s);
}

/**
 * We consider hooks to be a hook name identifier or a member expression
 * containing a hook name.
 */
function isHook(node) {
  if (node.type === "Identifier") {
    return isHookName(node.name);
  } else if (
    node.type === "MemberExpression" &&
    !node.computed &&
    isHook(node.property)
  ) {
    const obj = node.object;
    const isPascalCaseNameSpace = /^[A-Z].*/;
    return obj.type === "Identifier" && isPascalCaseNameSpace.test(obj.name);
  } else {
    return false;
  }
}

function hasHooks(rootNode: AcornNode) {
  let found = false;
  walk(rootNode, {
    enter(node) {
      if (node.type === "MemberExpression" || node.type === "Identifier") {
        if (!found) found = isHook(node);
      }
    },
  });
  return found;
}

const internalRollupConfig: RollupOptions = {
  context: "globalThis",
  external: [
    "node-fetch",
    "microsite/head",
    "microsite/document",
    "microsite/hydrate",
    "preact",
    "preact/compat",
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
    if (
      info.importedIds.includes("preact/compat") ||
      info.importedIds.includes("preact/jsx-runtime")
    ) {
      const idsToHandle = new Set([
        ...info.importers,
        ...info.dynamicImporters,
      ]);
      const hooks = hasHooks(info.ast);

      if (hooks) {
        for (const moduleId of idsToHandle) {
          const { isEntry, dynamicImporters, importers } = getModuleInfo(
            moduleId
          );
          if (isEntry || [...importers, ...dynamicImporters].length > 0)
            dependentEntryPoints.push(moduleId);

          for (const importerId of importers) idsToHandle.add(importerId);
        }
      }
    }

    if (dependentEntryPoints.length === 1) {
      return `hydrate/${info.id.split("/").slice(-1)[0].split(".")[0]}`;
    } else if (dependentEntryPoints.length > 1) {
      return `hydrate/shared`;
    }
  },
};

async function writeGlobal() {
  const global = await rollup({
    ...internalRollupConfig,
    plugins: [
      ...requiredPlugins,
      typescript({ target: "ES2018" }),
      ...globalPlugins,
    ],
    input: "src/global.ts",
  });
  const legacy = await rollup({
    ...internalRollupConfig,
    plugins: [
      ...requiredPlugins,
      typescript({ target: "ES5" }),
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
    const bundle = await rollup({
      ...internalRollupConfig,
      plugins: [
        multi(),
        ...requiredPlugins,
        typescript({ target: "ES2018" }),
        ...createPagePlugins(),
      ],
      input: "src/pages/**/*.tsx",
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
  const entries = await readdir(dir, { withFileTypes: true });
  return Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? readDir(join(dir, entry.name))
        : join(dir, entry.name)
    )
  ).then((arr) => arr.flat(Infinity));
}

async function prepare() {
  const paths = ["./dist", "./.tmp/microsite"];
  await Promise.all(paths.map((p) => rm(p, { recursive: true, force: true })));
  await Promise.all(paths.map((p) => mkdir(p, { recursive: true })));

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
}

async function cleanup({ err = false }: { err?: boolean } = {}) {
  const paths = ["./.tmp/microsite"];
  await Promise.all(paths.map((p) => rm(p, { recursive: true, force: true })));
  if ((await readDir("./.tmp")).length === 0) {
    await rm("./.tmp", { recursive: true });
  }
  if (err) {
    await rm("./dist", { recursive: true, force: true });
  }
}

async function renderPage(
  page: any,
  { styles, hydrateExportManifest, hasGlobalScript, globalStyle }: any
) {
  let baseHydrate = false;
  const output = [];
  const { default: Page, getStaticProps = () => {}, __name } = page;
  const { content: style = null } =
    styles.find((style) => style.__name === __name) || {};

  let props = {};
  try {
    const res = await getStaticProps();
    props = res?.props ?? {};
  } catch (e) {
    console.error(`Error getting static props for "${__name}"`);
    console.error(e);
  }

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
          content: createHydrateInitScript(),
        });
        baseHydrate = true;
      }
      output.push({
        name: `_hydrate/pages/${__name}.js`,
        content: createHydrateScript(components, hydrateExportManifest),
      });
    }

    output.push({
      name: `${__name}.html`,
      content,
    });
  } catch (e) {
    console.log(`Error building /${__name}.html`);
    console.error(e);
    await cleanup({ err: true });
    return;
  }
  return output;
}

export async function build() {
  await prepare();
  await Promise.all([writeGlobal(), writePages()]);

  const globalStyle = await readFile("./.tmp/microsite/global.css").then((v) =>
    v.toString()
  );
  const hasGlobalScript = await readFile("./.tmp/microsite/global.js").then(
    (v) => !!v.toString().trim()
  );

  if (hasGlobalScript) {
    await Promise.all([
      copyFile(resolve("./.tmp/microsite/global.js"), "dist/index.js"),
      copyFile(
        resolve("./.tmp/microsite/global.legacy.js"),
        "dist/index.legacy.js"
      ),
    ]);
  }

  const files = await readDir("./.tmp/microsite/pages");
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

  const hydrateFiles = await readDir("./.tmp/microsite/hydrate");
  const hydrateExportManifest = await Promise.all(
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
              exports: Object.keys(mod),
            }));
          });
      })
  );

  const hydrateBundle = await rollup({
    treeshake: true,
    input: resolve("./.tmp/microsite/hydrate/**/*.js"),
    external: [
      "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module",
      "https://unpkg.com/preact@latest?module",
    ],
    plugins: [
      multi(),
      replace({
        values: {
          "preact/compat":
            "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module",
          "React.Fragment": "Fragment",
          "React.createElement": "h",
          "import { withHydrate } from 'microsite/hydrate';":
            "const withHydrate = v => v;",
        },
        delimiters: ["", ""],
      }),
      inject({
        Fragment: ["https://unpkg.com/preact@latest?module", "Fragment"],
        h: ["https://unpkg.com/preact@latest?module", "h"],
      }),
      terser(),
    ],
    onwarn(warning, handler) {
      if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
      handler(warning);
    },
  });
  await hydrateBundle.write({
    minifyInternalExports: true,
    dir: resolve("dist/_hydrate/chunks"),
    entryFileNames: (info) => `${basename(info.name)}.js`,
  });

  const output = await Promise.all(
    pages.map((page) =>
      renderPage(page, {
        styles,
        hydrateExportManifest,
        hasGlobalScript,
        globalStyle,
      })
    )
  );
  await Promise.all([
    ...output
      .flat()
      .map(({ name, content }) =>
        mkdir(resolve(`./dist/${dirname(name)}`), {
          recursive: true,
        }).then(() => writeFile(resolve(`./dist/${name}`), content))
      ),
  ]);

  await cleanup();
}
