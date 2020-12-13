import { dirExists } from "../utils/fs.js";
import { openInBrowser } from "../utils/open.js";
import { OUT_DIR } from "../utils/build.js";
import { green } from "kleur/colors";
import polka from "polka";
import sirv from "sirv";
import arg from "arg";

function parseArgs(argv: string[]) {
  return arg(
    {
      "--port": Number,

      // Aliases
      "-p": "--port",
    },
    { permissive: true, argv }
  );
}

export default async function start(argv: string[]) {
  const args = parseArgs(argv);
  const PORT = args["--port"] ?? 8888;

  if (await dirExists(OUT_DIR)) {
    const assets = sirv("dist", {
      maxAge: 31536000, // 1Y
      immutable: true,
    });
    const server = polka().use(assets);

    await new Promise<void>((resolve) =>
      server.listen(PORT, (err) => {
        if (err) throw err;
        resolve();
      })
    );

    let protocol = "http:";
    let hostname = "localhost";
    await openInBrowser(protocol, hostname, PORT, "chrome");
    console.log(
      `${green("✔")} Microsite started on ${green(
        `${protocol}//${hostname}:${PORT}`
      )}\n`
    );
  } else {
    console.log(``);
  }
}
