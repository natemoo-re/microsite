import fs from 'fs-extra';
const { readdir, copy } = fs;
import path from 'path';
const { resolve } = path;

async function run() {
    const examples = (await readdir('./examples')).filter(v => v.indexOf('.') === -1);
    await Promise.all(examples.map(example => copy(resolve(process.cwd(), `./examples/${example}/dist`), resolve(process.cwd(), './examples/dist'), { recursive: true })));
}

run();
