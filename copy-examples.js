import fs from 'fs-extra';
const { readdir, copy } = fs;

async function run() {
    const examples = (await readdir('./examples')).filter(v => v.indexOf('.') === -1);
    await Promise.all(examples.map(example => copy(`./examples/${example}/dist`, './examples/dist', { recursive: true })));
}

run();
