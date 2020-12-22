import type { ManifestEntry } from "./build";

// This is an esbuild (?) bug where default exports are rewritten with a number appended
// so we'll just remove any trailing numbers
const cleanComponentName = (cmp: string) => cmp.replace(/[0-9]+$/, "");

export function generateHydrateScript(
  hydrateBindings: ManifestEntry["hydrateBindings"],
  opts: { basePath?: string } = {}
) {
  const { basePath = '/' } = opts;
  const entries = Object.fromEntries(
    Object.entries(hydrateBindings)
      .map(([file, exports]) =>
        exports.map((cmp) => [cleanComponentName(cmp), [cmp, `${basePath}${file}`]])
      )
      .flat(1)
  );
  return `import init from '${basePath}_hydrate/init.js';\ninit(${JSON.stringify(
    entries
  )})`;
}
