import { h, createContext, Fragment, FunctionalComponent } from "preact";
import { useRef } from "preact/hooks";
import render from "preact-render-to-string";

export const __DocContext = createContext({
  head: { current: [] },
  hydrate: { current: [] },
});
export const __hydratedComponents = [];
const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;

export const Document: FunctionalComponent<{
  hydrateExportManifest?: any;
  page?: string;
  styles?: string[];
  globalStyle?: string;
  sharedStyle?: string;
  hasScripts?: boolean;
}> = ({
  hydrateExportManifest,
  page,
  styles = [],
  hasScripts = false,
  globalStyle,
  sharedStyle,
  children,
}) => {
  const head = useRef([]);
  const hydrate = useRef([]);
  const subtree = render(
    <__DocContext.Provider value={{ head, hydrate }}>
      {children}
    </__DocContext.Provider>,
    {},
    { pretty: true }
  );

  const components = hydrate.current.map(({ name }) => name).filter(unique);
  if (hydrate.current.length > 0)
    __hydratedComponents.push({ page, components });

  const componentStyles = components
    .map((name) => {
      const found = hydrateExportManifest.find((entry) =>
        entry.exports.find(([_key, n]) => n === name)
      );
      if (found) return found.styles;
      return null;
    })
    .filter((v) => v)
    .filter(unique) as string[];

  return (
    <html lang="en" dir="ltr">
      <head>
        <meta {...({ charset: "utf-8" } as any)} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
        />

        <Fragment>{head.current}</Fragment>

        {globalStyle && (
          <link rel="stylesheet" href={`/_hydrate/styles/${globalStyle}`} />
        )}
        {sharedStyle && (
          <link rel="stylesheet" href={`/_hydrate/styles/${sharedStyle}`} />
        )}
        {componentStyles &&
          componentStyles.map((href) => (
            <link rel="stylesheet" href={`/_hydrate/styles/${href}`} />
          ))}
        {styles.map((style) => (
          <style dangerouslySetInnerHTML={{ __html: style.trim() }} />
        ))}
        {hydrate.current.length > 0 && (
          <style
            dangerouslySetInnerHTML={{
              __html: "[data-hydrate]{display:contents;}",
            }}
          />
        )}
        {hydrate.current.length > 0 && (
          <Fragment>
            <link
              rel="modulepreload"
              href="https://unpkg.com/preact@latest?module"
            />
            <link
              rel="modulepreload"
              href="https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module"
            />
            <link rel="modulepreload" href={`/_hydrate/pages/${page}.js`} />
          </Fragment>
        )}
      </head>
      <body>
        <div id="__microsite" dangerouslySetInnerHTML={{ __html: subtree }} />

        {hydrate.current.length > 0 && (
          <script type="module" defer src={`/_hydrate/pages/${page}.js`} />
        )}
        {hasScripts ? (
          <Fragment>
            <script type="module" src="/index.js" />
            <script
              {...{ nomodule: "" }}
              src="https://unpkg.com/systemjs@2.0.0/dist/s.min.js"
            />
            <script {...{ nomodule: "" }} src="/index.legacy.js" />
          </Fragment>
        ) : null}
      </body>
    </html>
  );
};
