#!/usr/bin/env node
import degit from "degit";
import arg from "arg";
import { bold, green, cyan, underline, red, white } from "kleur/colors";
import { resolve } from "path";

const REPO = `natemoo-re/microsite-templates`;
const TEMPLATES = ["default", "next"];

type Args = arg.Result<{
  "--force": BooleanConstructor;
  "--next": BooleanConstructor;
}>;

async function clone(
  template: typeof TEMPLATES[number],
  dir: string,
  args: Args
) {
  return new Promise<void>((resolve, reject) => {
    const emitter = degit(`${REPO}/${template}#main`, {
      cache: false,
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
  const [name, ...argv] = process.argv.slice(2);
  const args = arg(
    {
      "--force": Boolean,
      "--next": Boolean,
    },
    { argv }
  );
  let template = args["--next"] ? "next" : "default";

  try {
    await clone(template, resolve(name), args);
  } catch (err) {
    if (err.code === "DEST_NOT_EMPTY") {
      console.log(
        `${bold(red("✗"))} ${cyan("./" + name)} is not empty. Use ${bold(
          white("--force")
        )} to override.`
      );
    } else {
      console.error(err);
    }
    return;
  }

  console.log(
    `${bold(green("✓"))} Created ${underline(
      green("./" + name)
    )} from template ${underline(cyan(template))}`
  );
}

run().then(() => console.log());
