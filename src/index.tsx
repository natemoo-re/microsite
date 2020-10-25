#!/usr/bin/env node
import { build } from './scripts/build';

async function run() {
    const [command] = process.argv.slice(2);

    if (command === 'build') {
        await build();
        return;
    }
}

run();
