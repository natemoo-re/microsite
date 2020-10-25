#!/usr/bin/env node
import { build } from './scripts/build';

async function run() {
    const [command, ...args] = process.argv.slice(2);
    console.log(command, args);

    if (command === 'build') {
        await build();
        return;
    }
}

run();
