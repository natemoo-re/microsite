import { join, resolve, sep, extname, dirname } from 'path';
import { OutputOptions, rollup } from 'rollup';
import glob from 'globby';

import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

import { Document } from '../document';
import { h } from 'preact';
import render from 'preact-render-to-string';
import { readdir, readFile, rmdir, writeFile, mkdir, copyFile, stat } from 'fs/promises';

const globalPlugins = [
    postcss({
        plugins: [],
        inject: false,
        extract: true,
        minimize: true,
        sourceMap: false
    }),
]

const createPagePlugins = () => [
    postcss({
        plugins: [],
        inject: false,
        extract: true,
        minimize: true,
        modules: {
            generateScopedName: '[hash:base64:5]'
        },
        sourceMap: false
    }),
]

const OUTPUT_DIR = './.tmp/crooked';

const outputOptions: OutputOptions = {
    format: 'esm',
    sourcemap: false
}

const internalRollupConfig = {
    treeshake: true,
    onwarn(message) {
        if (/empty chunk/.test(message)) return;
        console.error(message);
    }
}

async function writeGlobal() {
    const global = await rollup({ ...internalRollupConfig, plugins: [typescript({ target: 'ES2018' }), ...globalPlugins], input: 'src/global.ts' });
    const legacy = await rollup({ ...internalRollupConfig, plugins: [typescript({ target: 'ES5' }), ...globalPlugins], input: 'src/global.ts' });

    try {
        return Promise.all([
            global.write({ format: 'esm', sourcemap: false, dir: OUTPUT_DIR, name: 'global' }),
            legacy.write({ format: 'system', sourcemap: false, file: join(OUTPUT_DIR, 'global.legacy.js') }),
        ])
    } catch (e) {
        console.log(e);
    }
}

async function writePages() {
    try {
        const pages = await glob(['src/pages/**/*.tsx']);
        const bundles = await Promise.all(pages.map(input => rollup({ ...internalRollupConfig, external: 'preact', plugins: [typescript({ target: 'ES2018' }), ...createPagePlugins()], input })));

        const result = Promise.all(bundles.map((bundle, i) => bundle.write({ ...outputOptions, dir: pages[i].replace(/^src/, OUTPUT_DIR).split(sep).slice(0, -1).join(sep) })))
        return result;
    } catch (e) {
        console.log(e);
    }
}

async function readDir(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    return Promise.all(entries.map(entry => entry.isDirectory() ? readDir(join(dir, entry.name)) : join(dir, entry.name))).then(arr => arr.flat(Infinity));
}

async function prepare() {
    const paths = ['./dist', './.tmp/crooked'];
    await Promise.all(paths.map(p => rmdir(p, { recursive: true })));
    await Promise.all(paths.map(p => mkdir(p)));

    if ((await stat('./src/public')).isDirectory()) {
        const files = await readDir('./src/public');
        await Promise.all(files.map(file => copyFile(resolve(process.cwd(), file), resolve(process.cwd(), './dist/' + file.slice('src/public/'.length)))));
    }
}

async function cleanup() {
    const paths = ['./.tmp/crooked'];
    await Promise.all(paths.map(p => rmdir(p, { recursive: true })));
}

export async function build() {
    await prepare();
    await Promise.all([writeGlobal(), writePages()]);

    const globalStyle = await readFile('./.tmp/crooked/global.css').then(v => v.toString());
    const hasGlobalScript = await readFile('./.tmp/crooked/global.js').then(v => !!v.toString().trim());

    if (hasGlobalScript) {
        await Promise.all([
            copyFile(resolve('./.tmp/crooked/global.js'), 'dist/index.js'),
            copyFile(resolve('./.tmp/crooked/global.legacy.js'), 'dist/index.legacy.js'),
        ])
    }

    const files = await readDir('./.tmp/crooked/pages');
    const getName = f => f.slice(f.indexOf('pages/') + 'pages/'.length - 1, extname(f).length * -1);
    const styles: any[] = await Promise.all(files.filter(f => f.endsWith('.css')).map(f => readFile(f).then(buff => ({ __name: getName(f), content: buff.toString() }) )));
    const pages: any[] = await Promise.all(files.filter(f => f.endsWith('.js')).map(f => import(`../${f}`).then(mod => ({ ...mod, __name: getName(f) }))));

    const output = [];
    for (const page of pages) {
        const { Page, __name } = page;
        const { content: style = null } = styles.find(style => style.__name === __name) || {};
        output.push({ name: __name, content: '<!DOCTYPE html>\n' + render(<Document hasScripts={hasGlobalScript} styles={[globalStyle, style].filter(v => v)}><Page /></Document>, {}, { pretty: true }) });
    }

    await Promise.all(output.map(({ name, content }) => mkdir(resolve(`./dist/${dirname(name)}`), { recursive: true }).then(() => writeFile(resolve(`./dist/${name}.html`), content))));
    await cleanup();
}
