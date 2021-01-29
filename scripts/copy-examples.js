import { promises as fsp } from 'fs';
import fse from 'fs-extra';
import { join } from 'path'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { copy } = fse;

async function run() {
    const base = join(require.resolve('lerna').split('/node_modules')[0], 'examples');
    const ents = await fsp.readdir(base, { withFileTypes: true });
    let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && !['dist', '.microsite', 'root'].includes(name))

    await copy(join(base, 'root/dist'), join(base, 'dist'), { recursive: true });
    await Promise.all(results.map((example) => copy(join(base, `${example}/dist/${example}`), join(base, `dist/${example}`), { recursive: true })));
}

run();
