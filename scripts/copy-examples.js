import { promises as fsp } from 'fs';
import fse from 'fs-extra';
import { resolve } from 'path'

const { copy } = fse;

async function run() {
    const ents = await fsp.readdir('./examples', { withFileTypes: true });
    let results = ents.map((ent) => ent.isDirectory() ? ent.name : null).filter(name => name && !['dist', '.microsite', 'root'].includes(name))

    await copy(resolve(process.cwd(), `./examples/root/dist`), resolve(process.cwd(), `./examples/dist`), { recursive: true });
    await Promise.all(results.map((example) => copy(resolve(process.cwd(), `./examples/${example}/dist/${example}`), resolve(process.cwd(), `./examples/dist/${example}`), { recursive: true })));
}

run();
