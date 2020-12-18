import { h, createContext, Fragment, FunctionalComponent } from "preact";
import { useContext, useRef } from "preact/hooks";
import render from "preact-render-to-string";

import { generateHydrateScript } from "./utils/hydration.js";
import type { ManifestEntry } from "./utils/build";

export const __DocContext = createContext({
  head: { current: [] },
});

export const Document: FunctionalComponent<{
  manifest?: ManifestEntry;
  preload?: string[];
  preconnect?: string[];
  debug?: boolean;
  hasGlobalScript?: boolean;
}> = ({
  manifest,
  preload = [],
  preconnect = [],
  debug = false,
  hasGlobalScript = false,
  children,
}) => {
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

        {preconnect.map((href) => (
          <link rel="preconnect" href={href} />
        ))}
        {hasGlobalScript && (
          <link rel="modulepreload" href="/_hydrate/chunks/_global.js" />
        )}
        {preload.map((href) => (
          <link rel="modulepreload" href={href} />
        ))}
        {styles &&
          styles.map((href) => (
            <link rel="preload" href={`/${href}`} as="style" />
          ))}

        {styles &&
          styles.map((href) => <link rel="stylesheet" href={`/${href}`} />)}

        {scripts && (
          <Fragment>
            <style
              dangerouslySetInnerHTML={{
                __html: "[data-hydrate]{display:contents;}",
              }}
            />
          </Fragment>
        )}
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
        {hasGlobalScript && (
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: `import global from '/_hydrate/chunks/_global.js';\nglobal();`,
            }}
          />
        )}
        {scripts && (
          <script
            type="module"
            defer
            async
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
