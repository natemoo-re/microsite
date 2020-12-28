import { promises as fsp } from 'fs';
import { resolve } from 'path'

async function run() {
    const ents = await fsp.readdir('../', { withFileTypes: true });
    let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && name !== 'root')

    await fsp.writeFile(resolve(process.cwd(), './examples.json'), JSON.stringify(results));
}

run();
