import { promises as fsp } from 'fs';

async function run() {
    // const ents = await fsp.readdir('../', { withFileTypes: true });
    // let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && name !== 'root')

    await fsp.writeFile('src/examples.json', JSON.stringify(['partial-hydration']));
}

run();
