#!/usr/bin/env node
import { build } from "./scripts/build.js";
import arg from "arg";

export type BuildArgs = ReturnType<typeof getBuildArgs>;

function getBuildArgs(argv: string[]) {
  return arg(
    {
      "--debug-hydration": Boolean,
      "--no-clean": Boolean,
      "--filter": String,

      "-f": "--filter",
    },
    { permissive: true, argv }
  );
}

async function run() {
  let [command, ...argv] = process.argv.slice(2);
  if (argv[0] === "--") argv = argv.slice(1);

  if (command === "build") {
    const args = getBuildArgs(argv);
    await build(args);
    return;
  }
}
run();
