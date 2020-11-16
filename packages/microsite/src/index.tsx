#!/usr/bin/env node --experimental-modules --experimental-specifier-resolution=node
import { build } from "./scripts/build";
async function run() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "build") {
    await build(args);
    return;
  }
}
run();
