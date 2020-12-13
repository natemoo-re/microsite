import { h, createContext, Fragment, FunctionalComponent } from "preact";
import { useContext, useRef } from "preact/hooks";
import render from "preact-render-to-string";

import { generateHydrateScript } from "./utils/common.js";
import type { ManifestEntry } from "./utils/build";

export const __DocContext = createContext({
  head: { current: [] },
});

export const Document: FunctionalComponent<{
  manifest?: ManifestEntry;
  preload?: string[];
  debug?: boolean;
}> = ({ manifest, preload = [], debug = false, children }) => {
  const head = useRef([]);
  const subtree = render(
    <__DocContext.Provider value={{ head }}>{children}</__DocContext.Provider>,
    {}
  );

  const styles = manifest.hydrateStyleBindings;
  const scripts = manifest.hydrateBindings;

  return (
    <html lang="en" dir="ltr">
      <head>
        <meta {...({ charset: "utf-8" } as any)} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
        />

        <Fragment>{head.current}</Fragment>

        {styles &&
          styles.map((href) => <link rel="stylesheet" href={`/${href}`} />)}

        {scripts && (
          <style
            dangerouslySetInnerHTML={{
              __html: "[data-hydrate]{display:contents;}",
            }}
          />
        )}

        {preload.length > 0 &&
          preload.map((href) => <link rel="modulepreload" href={href} />)}
      </head>
      <body>
        <div id="__microsite" dangerouslySetInnerHTML={{ __html: subtree }} />

        {debug && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__MICROSITE_DEBUG = true;`,
            }}
          />
        )}
        {scripts && (
          <script
            type="module"
            dangerouslySetInnerHTML={{ __html: generateHydrateScript(scripts) }}
          />
        )}
      </body>
    </html>
  );
};

export const Head = () => {
  const { head } = useContext(__DocContext);
  return (
    <head>
      <meta {...({ charset: "utf-8" } as any)} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
      />

      <Fragment>{head.current}</Fragment>
    </head>
  );
};
