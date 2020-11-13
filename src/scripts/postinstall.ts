import { promises as fsp } from "fs";
import { resolve, dirname, join } from "path";
import escalade from "escalade";
const { readFile, writeFile, stat } = fsp;

async function postinstall() {
  let content = "";
  let root = await escalade(resolve("../"), (_dir, names) => {
    if (names.includes("package.json")) return "package.json";
  });
  if (!root) return;
  root = dirname(root);

  try {
    if ((await stat(join(root, ".gitignore"))).isFile()) {
      content = await readFile(join(root, ".gitignore")).then((buff) =>
        buff.toString()
      );
      if (/.microsite/g.test(content)) return;
    }
  } catch (e) {}

  const trailing = content.slice(content.trimEnd().length);

  await writeFile(
    join(root, ".gitignore"),
    `${content.trimEnd()}\n.microsite${trailing}`
  );
}

postinstall();
