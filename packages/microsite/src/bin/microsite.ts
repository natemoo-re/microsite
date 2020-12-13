#!/usr/bin/env node
import arg from "arg";

const parseArgs = (argv: string[]) =>
  arg(
    {
      "--version": Boolean,
      "--help": Boolean,

      // Aliases
      "-v": "--version",
      "-h": "--help",
    },
    {
      permissive: true,
      argv,
    }
  );

const commands = {
  dev: () => import("../cli/microsite-dev").then(({ default: cmd }) => cmd),
  build: () => import("../cli/microsite-build").then(({ default: cmd }) => cmd),
  serve: () => import("../cli/microsite-serve").then(({ default: cmd }) => cmd),
};

async function run() {
  let [command = "dev", ...argv] = process.argv.slice(2);

  if (command.startsWith("-")) argv = [command, ...argv];
  if (argv[0] === "--") argv = argv.slice(1);

  const args = parseArgs(argv);

  if (args["--help"]) {
    console.log(`
  Usage
    $ microsite <command>

  Available commands
    ${Object.keys(commands).join(", ")}
  Options
    --version, -v   Version number
    --help, -h      Displays this message
  For more information run a command with the --help flag
    $ microsite build --help
`);
  } else if (args["--version"]) {
    console.log(`Microsite v${process.env.npm_package_version}`);
  } else {
    switch (command) {
      case "dev":
        return import("../cli/microsite-dev.js").then(({ default: cmd }) =>
          cmd(argv)
        );
      case "serve":
        return import("../cli/microsite-serve.js").then(({ default: cmd }) =>
          cmd(argv)
        );
      case "build":
        return import("../cli/microsite-build.js").then(({ default: cmd }) =>
          cmd(argv)
        );
    }
  }
}

run();
