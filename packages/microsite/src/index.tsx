#!/usr/bin/env node
import { build } from "./scripts/build.js";
async function run() {
  const [command, ...args] = process.argv.slice(2);

  if (command === "build") {
    await build(args);
    return;
  }
}
run();
