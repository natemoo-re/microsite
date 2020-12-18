import { resolve, relative } from 'path';
import module from 'module';
const { createRequire } = module;
const require = createRequire(import.meta.url);

import { fileExists } from './fs.js';
import { createConfiguration } from 'snowpack';
const _config = require("microsite/assets/snowpack.config.cjs");

const deps = Object.keys(require(resolve(process.cwd(), 'package.json')).dependencies || {});

export async function loadConfiguration(mode: 'dev' | 'build') {
  const tsconfigPath = await findTsOrJsConfig();
  const aliases = (tsconfigPath) ? resolveTsconfigPathsToAlias({ tsconfigPath }) : {};

  switch (mode) {
    case 'dev': return createConfiguration({ ..._config, alias: { ...aliases, ...(_config.alias ?? {}), "microsite/hydrate": "microsite/client/hydrate" }, installOptions: { ..._config.installOptions, externalPackage: ["/web_modules/microsite/_error.js"]} });
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
