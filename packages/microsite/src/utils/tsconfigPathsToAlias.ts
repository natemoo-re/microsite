import { resolve, relative } from 'path';
import module from 'module';
const { createRequire } = module;
const require = createRequire(import.meta.url);

export default function resolveTsconfigPathsToAlias({
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
