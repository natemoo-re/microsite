import esbuild from 'esbuild';
import path from 'path';
import { promises as fsp } from 'fs';

const SRC_DIR = './src';
const OUT_DIR = './dist';
const ENTRY_DIRS = ['bin', 'client', 'server'];

async function build() {
    const [pkgManifest, entryPoints] = await Promise.all([getPkgManifest(), resolveEntryPoints()]);
    await esbuild.build({
        entryPoints,
        outdir: OUT_DIR,
        external: Object.keys(pkgManifest.dependencies),
        format: 'esm',
        platform: 'node',
        target: 'node12',
        bundle: true,
        minify: true,
        treeShaking: true,
        splitting: true,
        sourcemap: 'inline',
        chunkNames: 'chunks/[name]-[hash]',
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
    })
}

async function getPkgManifest() {
    return fsp.readFile('./package.json').then(res => JSON.parse(res.toString()));
}

/** @returns {Promise<string[]>} */
async function resolveEntryPoints() {
    const files = (await fsp.readdir(SRC_DIR, { withFileTypes: true }))
        .map(async (ent) => {
            if (ent.isFile()) {
                return path.resolve(path.join(SRC_DIR, ent.name));
            }
            if (ent.isDirectory() && ENTRY_DIRS.includes(ent.name)) {
                return await fsp.readdir(path.join(SRC_DIR, ent.name), { withFileTypes: true })
                    .then(res => {
                        return res.map(dirent => {
                            if (dirent.isFile()) return path.resolve(path.join(SRC_DIR, ent.name, dirent.name));
                        })
                    })
            }
            return null;
        });
    const entryPoints = (await Promise.all(files))
        .filter(i => i)
        .reduce((acc, ent) => {
            return [].concat(...acc, (Array.isArray(ent) ? ent : [ent]))
        }, []);

    return entryPoints;
}

build();
