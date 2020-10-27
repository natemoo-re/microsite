require = require("esm")(module);

import { join, resolve, extname, dirname } from "path";
import { AcornNode, OutputOptions, rollup, RollupOptions } from "rollup";
import { walk } from "estree-walker";

import { default as multi } from "rollup-plugin-multi-input";
import { default as styles } from "rollup-plugin-styles";
import { default as typescript } from "@rollup/plugin-typescript";
import { default as nodeResolve } from "@rollup/plugin-node-resolve";
import { default as alias } from "@rollup/plugin-alias";

import { Document } from "../document";
import React from "preact/compat";
import render from "preact-render-to-string";
import { promises as fsp } from "fs";
import inject from "@rollup/plugin-inject";
const { readdir, readFile, rmdir, writeFile, mkdir, copyFile, stat } = fsp;

const ROOT_DIR = join(process.cwd(), "src");

// const _vnode = options.vnode;
// options.vnode = vnode => {
//   if (vnode.type && (vnode.type as any).hydrate) {
//   }

//   if (_vnode) {
//     _vnode(vnode);
//   }
// }

const requiredPlugins = [
  inject({
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
    "microsite/head",
    "microsite/document",
    "microsite",
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
  await Promise.all(paths.map((p) => rmdir(p, { recursive: true })));
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

async function cleanup() {
  const paths = ["./.tmp/microsite"];
  await Promise.all(paths.map((p) => rmdir(p, { recursive: true })));
  if ((await readDir("./.tmp")).length === 0) {
    await rmdir("./.tmp");
  }
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
  const getName = (f) =>
    f.slice(f.indexOf("pages/") + "pages/".length - 1, extname(f).length * -1);
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

  const output = [];
  for (const page of pages) {
    const { Page, __name } = page;
    const { content: style = null } =
      styles.find((style) => style.__name === __name) || {};

    try {
      output.push({
        name: __name,
        content:
          "<!DOCTYPE html>\n" +
          render(
            <Document
              render={render}
              hasScripts={hasGlobalScript}
              styles={[globalStyle, style].filter((v) => v)}
            >
              <Page />
            </Document>,
            {},
            { pretty: true }
          ),
      });
    } catch (e) {
      console.log(`Error building ${__name}`);
      console.error(e);
      return;
    }
  }

  await Promise.all(
    output.map(({ name, content }) =>
      mkdir(resolve(`./dist/${dirname(name)}`), { recursive: true }).then(() =>
        writeFile(resolve(`./dist/${name}.html`), content)
      )
    )
  );
  await cleanup();
}
