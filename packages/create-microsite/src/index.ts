#!/usr/bin/env node
import degit from "degit";
import prompts from "prompts";
import fs from "fs";
import arg from "arg";
import { dim, bold, green, cyan, underline, red, white } from "kleur/colors";
import { resolve } from "path";

const REPO = `natemoo-re/microsite`;
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
    const emitter = degit(`${REPO}/packages/templates/${template}#main`, {
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
  let [name, ...argv] = process.argv.slice(2);
  const args = arg(
    {
      "--force": Boolean,
      "--next": Boolean,
    },
    { argv }
  );
  let template = args["--next"] ? "next" : "default";

  if (!name) {
    const response = await prompts({
      type: "text",
      name: "name",
      message: `Project name:`,
      initial: "microsite-project",
      validate: (value) => (!value?.trim() ? "Please enter a value" : true),
    });

    let normalizedName = response.name?.trim().replace(/\s+/g, "-");
    if (!normalizedName) {
      console.log(
        `${bold(red("✖"))} Cancelled. Please enter a project name to continue.`
      );
      return;
    }

    name = normalizedName;
  }

  try {
    let root = resolve(name);

    if (fs.existsSync(root) && !args["--force"]) {
      const existing = fs.readdirSync(root);
      if (existing.length) {
        const { yes } = await prompts({
          type: "confirm",
          name: "yes",
          initial: "Y",
          message:
            `Target directory "./${name}" is not empty.\n  ` +
            `Remove existing files and continue?`,
        });
        if (yes) {
          args["--force"] = true;
        } else {
          return;
        }
      }
    }
    await clone(template, root, args);
  } catch (err) {
    if (err.code === "DEST_NOT_EMPTY") {
      console.log(
        `${bold(red("✖"))} ${cyan("./" + name)} is not empty. Use ${bold(
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

  const pkgManager = /yarn/.test(process.env.npm_execpath) ? 'yarn' : 'npm';

  console.log();
  console.log(dim(`  Next steps:`));
  console.log()
  console.log(`  cd ./${name}`);
  console.log(`  ${pkgManager === 'yarn' ? `yarn` : `npm install`}`)
  console.log(`  ${pkgManager === 'yarn' ? `yarn start` : `npm start`}`)
}

run().then(() => console.log());
