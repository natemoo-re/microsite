import type { ManifestEntry } from "../utils/build";
import { resolve, relative } from 'path';
import module from 'module';
const { createRequire } = module;
const require = createRequire(import.meta.url);

import { fileExists } from './fs.js';
import { createConfiguration } from 'snowpack';
const _config = require("microsite/assets/snowpack.config.cjs");

// This is an esbuild (?) bug where default exports are rewritten with a number appended
// so we'll just remove any trailing numbers
const cleanComponentName = (cmp: string) => cmp.replace(/[0-9]+$/, "");

export function generateHydrateScript(
  hydrateBindings: ManifestEntry["hydrateBindings"]
) {
  const entries = Object.fromEntries(
    Object.entries(hydrateBindings)
      .map(([file, exports]) =>
        exports.map((cmp) => [cleanComponentName(cmp), [cmp, `/${file}`]])
      )
      .flat(1)
  );
  return `import init from '/_hydrate/init.js';\ninit(${JSON.stringify(
    entries
  )})`;
}

const deps = Object.keys(require(resolve(process.cwd(), 'package.json')).dependencies);

export async function loadConfiguration(mode: 'dev' | 'build') {
  const tsconfigPath = await findTsOrJsConfig();
  const aliases = (tsconfigPath) ? resolveTsconfigPathsToAlias({ tsconfigPath }) : {};

  switch (mode) {
    case 'dev': return createConfiguration({ ..._config, alias: { ...aliases, ...(_config.alias ?? {}), "microsite/hydrate": "microsite/client/hydrate" } });
    case 'build': return createConfiguration({ ..._config, alias: { ...aliases, ...(_config.alias ?? {}) }, installOptions: { ..._config.installOptions, externalPackage: [..._config.installOptions.externalPackage, ...deps]} });
  }
}

const findTsOrJsConfig = async () => {
  const cwd = process.cwd();
  const tsconfig = resolve(cwd, './tsconfig.json');
  if (await fileExists(tsconfig)) return tsconfig;
  const jsconfig = resolve(cwd, './jsconfig.json');
  if (await fileExists(jsconfig)) return jsconfig;
  return null;
}

function resolveTsconfigPathsToAlias({
    tsconfigPath = './tsconfig.json'
} = {}) {
    let { baseUrl, paths } = require(tsconfigPath).compilerOptions;
    baseUrl = resolve(process.cwd(), baseUrl);

    const aliases = {};

    Object.keys(paths).forEach((item) => {
        const key = item.replace('/*', '');
        const value = './' + relative(process.cwd(), resolve(baseUrl, paths[item][0].replace('/*', '').replace('*', '')));

        aliases[key] = value;
    });

    return aliases;
}
