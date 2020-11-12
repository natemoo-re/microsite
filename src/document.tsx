import React, { createContext, useRef, FC } from "preact/compat";
import render from "preact-render-to-string";

export const __DocContext = createContext({
  head: { current: [] },
  hydrate: { current: [] },
});
export const __hydratedComponents = [];
const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;

export const Document: FC<{
  hydrateExportManifest?: any;
  page?: string;
  styles?: string[];
  hasScripts?: boolean;
}> = ({
  hydrateExportManifest,
  page,
  styles = [],
  hasScripts = false,
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
        entry.exports.includes(name)
      );
      if (found) return found.styles;
      return null;
    })
    .filter((v) => v)
    .join("")
    .trim();

  return (
    <html>
      <head>
        <meta {...({ charset: "utf-8" } as any)} />
        <meta name="viewport" content="width=device-width" />
        <>{head.current}</>
        <style
          dangerouslySetInnerHTML={{
            __html: "[data-hydrate]{display:contents;}",
          }}
        />
        {styles.map((style) => (
          <style dangerouslySetInnerHTML={{ __html: style.trim() }} />
        ))}
        {componentStyles && (
          <style dangerouslySetInnerHTML={{ __html: componentStyles }} />
        )}
      </head>
      <body>
        <div id="__microsite" dangerouslySetInnerHTML={{ __html: subtree }} />

        {hydrate.current.length > 0 && (
          <script type="module" defer src={`/_hydrate/pages/${page}.js`} />
        )}
        {hasScripts ? (
          <>
            <script type="module" src="/index.js" />
            <script
              {...{ nomodule: "" }}
              src="https://unpkg.com/systemjs@2.0.0/dist/s.min.js"
            />
            <script {...{ nomodule: "" }} src="/index.legacy.js" />
          </>
        ) : null}
      </body>
    </html>
  );
};
