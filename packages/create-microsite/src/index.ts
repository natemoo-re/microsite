#!/usr/bin/env node --experimental-modules --experimental-specifier-resolution=node
import degit from "degit";
import arg from "arg";
import { bold, green, cyan, underline, red, white } from "kleur/colors";
import { join, resolve } from "path";
import { exec } from "child_process";

const REPO = `natemoo-re/microsite-templates`;
const TEMPLATES = ["default"];

type Args = arg.Result<{
  "--force": BooleanConstructor;
}>;

async function clone(
  template: typeof TEMPLATES[number],
  dir: string,
  args: Args
) {
  return new Promise<void>((resolve, reject) => {
    const emitter = degit(`${REPO}/${template}#main`, {
      cache: true,
      force: args["--force"] ?? false,
      verbose: true,
    });

    emitter
      .clone(dir)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function run() {
  console.log();
  const cwd = process.cwd();
  const [name, ...argv] = process.argv.slice(2);
  const args = arg(
    {
      "--force": Boolean,
    },
    { argv }
  );
  try {
    await clone("default", join(cwd, name), args);
  } catch (err) {
    if (err.code === "DEST_NOT_EMPTY") {
      console.log(
        `${bold(red("✗"))} ${cyan("/" + name)} is not empty. Use ${bold(
          white("--force")
        )} to override.`
      );
      return;
    }
  }
  console.log(
    `${bold(green("✓"))} Created ${underline(
      green("/" + name)
    )} from template ${underline(cyan("default"))}`
  );
}

run().then(() => console.log());
