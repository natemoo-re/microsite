import type { ManifestEntry } from "./build";

export function generateHydrateScript(
  hydrateBindings: ManifestEntry["hydrateBindings"],
  opts: { basePath?: string } = {}
) {
  const { basePath = "/" } = opts;
  const entries = Object.fromEntries(
    Object.entries(hydrateBindings)
      .map(([file, exports]) =>
        Object.entries(exports).map(([key, exportName]) => [
          key,
          [exportName, `${basePath}${file}`],
        ])
      )
      .flat(1)
  );

  return `import init from "${basePath}_static/vendor/microsite.js";\ninit(${JSON.stringify(
    entries
  )})`;
}
