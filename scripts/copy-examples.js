import { promises as fsp } from 'fs';
import fse from 'fs-extra';
import { resolve } from 'path'

const { copy } = fse;

async function run() {
    const ents = await fsp.readdir('../', { withFileTypes: true });
    let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && name !== 'root')

    await Promise.all(results.map((example) => copy(resolve(process.cwd(), `./examples/${example}/dist`), resolve(process.cwd(), `./examples/dist`), { recursive: true })));
}

run();
