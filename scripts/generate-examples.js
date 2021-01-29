import { promises as fsp } from 'fs';
import { resolve } from 'path'

async function run() {
    const ents = await fsp.readdir('./examples', { withFileTypes: true });
    let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && !['dist', '.microsite', 'root'].includes(name))

    await fsp.writeFile(resolve(process.cwd(), './examples/examples.json'), JSON.stringify(results));
}

run();
