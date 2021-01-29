import { promises as fsp } from 'fs';
import { join } from 'path'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function run() {
    const base = join(require.resolve('lerna').split('/node_modules')[0], 'examples');
    const ents = await fsp.readdir('./examples', { withFileTypes: true });
    let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && !['dist', '.microsite', 'root'].includes(name))

    await fsp.writeFile(join(base, 'examples.json'), JSON.stringify(results));
}

run();
