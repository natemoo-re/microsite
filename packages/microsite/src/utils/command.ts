import { resolve, relative } from "path";
import module from "module";
const { createRequire } = module;
const require = createRequire(import.meta.url);

import { fileExists } from "./fs.js";
import { loadConfiguration as loadUserConfiguration } from "snowpack";

const pkg = require(resolve(process.cwd(), "package.json"));
const DEFAULT_BASE_PATH = pkg.homepage || "/";
const _config = require("microsite/assets/snowpack.config.cjs");

export function resolveNormalizedBasePath(args: {
  ["--base-path"]?: string;
  [key: string]: any;
}) {
  let basePath = args["--base-path"] ?? DEFAULT_BASE_PATH;
  return basePath === "/"
    ? basePath
    : `/${basePath.replace(/^\//, "").replace(/\/$/, "")}/`;
}

export async function loadConfiguration(mode: "dev" | "build") {
  const overrides = await getOverrides(mode);
  return loadUserConfiguration(overrides);
}

export async function getOverrides(mode: "dev" | "build") {
  const [tsconfigPath] = await Promise.all([findTsOrJsConfig()]);
  const aliases = tsconfigPath
    ? resolveTsconfigPathsToAlias({ tsconfigPath })
    : {};

  switch (mode) {
    case "dev":
      return {
        ..._config,
        buildOptions: {
          ..._config.buildOptions,
          ssr: true,
        },
        packageOptions: {
          ..._config.packageOptions,
          external: [..._config.packageOptions.external].filter(
            (v) => !v.startsWith("microsite")
          ),
        },
        plugins: [..._config.plugins],
        alias: {
          ...aliases,
          ...(_config.alias ?? {}),
          "microsite/hydrate": "microsite/client/hydrate",
        },
      };
    case "build":
      return {
        ..._config,
        devOptions: {
          ..._config.devOptions,
          hmr: false,
          port: 0,
          hmrPort: 0,
        },
        buildOptions: {
          ..._config.buildOptions,
          ssr: true,
        },
        plugins: [..._config.plugins],
        alias: {
          ...aliases,
          ...(_config.alias ?? {}),
        },
        packageOptions: {
          ..._config.packageOptions,
          external: [..._config.packageOptions.external].filter(
            (v) => v !== "preact"
          ),
          rollup: {
            ...(_config.installOptions?.rollup ?? {}),
            plugins: [
              {
                name: "@microsite/auto-external",
                options(opts) {
                  return Object.assign({}, opts, {
                    external: (source: string) => source.startsWith("preact"),
                  });
                },
              },
            ],
          },
        },
      };
  }
}

const findTsOrJsConfig = async () => {
  const cwd = process.cwd();
  const tsconfig = resolve(cwd, "./tsconfig.json");
  if (await fileExists(tsconfig)) return tsconfig;
  const jsconfig = resolve(cwd, "./jsconfig.json");
  if (await fileExists(jsconfig)) return jsconfig;
  return null;
};

function resolveTsconfigPathsToAlias({
  tsconfigPath = "./tsconfig.json",
} = {}) {
  let { baseUrl, paths } = require(tsconfigPath)?.compilerOptions ?? {};
  if (!(baseUrl && paths)) return {};

  baseUrl = resolve(process.cwd(), baseUrl);

  const aliases = {};

  Object.keys(paths).forEach((item) => {
    const key = item.replace("/*", "");
    const value =
      "./" +
      relative(
        process.cwd(),
        resolve(baseUrl, paths[item][0].replace("/*", "").replace("*", ""))
      );

    aliases[key] = value;
  });

  return aliases;
}
