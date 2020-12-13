import type { ManifestEntry } from "../utils/build";

// This is an esbuild (?) bug where default exports are rewritten with a number appended
// so we'll just remove any trailing numbers
const cleanComponentName = (cmp: string) => cmp.replace(/[0-9]+$/, "");

export function generateHydrateScript(
  hydrateBindings: ManifestEntry["hydrateBindings"]
) {
  const entries = Object.fromEntries(
    Object.entries(hydrateBindings)
      .map(([file, exports]) =>
        exports.map((cmp) => [cleanComponentName(cmp), [cmp, `/${file}`]])
      )
      .flat(1)
  );
  return `import init from '/_hydrate/init.js';\ninit(${JSON.stringify(
    entries
  )})`;
}
