import { h, createContext, Fragment, FunctionalComponent, JSX, ComponentType, ComponentProps } from "preact";
import { useContext } from "preact/hooks";
import { generateHydrateScript } from "./utils/hydration.js";

export const __HeadContext = createContext({
  head: { current: [] },
});

/** @internal */
export const __InternalDocContext = createContext<any>({});


const _Document = () => {
  return (
    <Html>
      <Head/>
      <body>
        <Main />
        <MicrositeScript />
      </body>
    </Html>
  );
};

interface RenderPageResult {
  __renderPageResult: any;
  [key: string]: any;
}

export const defineDocument = <T extends ComponentType<any>>(Document: T, ctx: {
  prepare: (ctx: { renderPage: () => Promise<RenderPageResult> }) => Promise<Omit<ComponentProps<T>, 'children'> & RenderPageResult>;
}) => {
  return Object.assign(Document, ctx);
}

export const Document = defineDocument(_Document, {
  async prepare({ renderPage }) {
    const page = await renderPage();
    return { ...page };
  }
})

export const Html: FunctionalComponent<JSX.HTMLAttributes<HTMLHtmlElement>> = ({
  lang = "en",
  dir = "ltr",
  ...props
}) => <html lang={lang} dir={dir} {...props} />;

export const Main: FunctionalComponent<
  Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "id" | "dangerouslySetInnerHTML" | "children"
  >
> = (props) => {
  const { __renderPageResult } = useContext(__InternalDocContext);
  return <div {...props} id="__microsite" dangerouslySetInnerHTML={{ __html: __renderPageResult }} />;
}

export const Head: FunctionalComponent<JSX.HTMLAttributes<HTMLHeadElement>> = ({
  children,
  ...props
}) => {
  const { dev = false, preconnect = [], basePath = '/', hasGlobalScript = false, preload = [], styles = [], __renderPageHead } = useContext(
    __InternalDocContext
  );
  const shouldIncludeBasePath = basePath !== '/';
  const prefix = shouldIncludeBasePath
    ? './'
    : '/';

  return (
    <head {...props}>
      <meta {...({ charset: "utf-8" } as any)} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
      />

      { shouldIncludeBasePath && <base href={basePath} /> }

      {preconnect.map((href) => (
        <link rel="preconnect" href={href} />
      ))}
      {hasGlobalScript && (
        <link rel="modulepreload" href={`${prefix}_hydrate/chunks/_global.js`} />
      )}
      {preload.map((href) => (
        <link rel="modulepreload" href={href} />
      ))}
      {styles && styles.map((href) => (
        <link rel="preload" href={`${prefix}${href}`} as="style" />
      ))}
      {styles && styles.map((href) => <link rel="stylesheet" href={`${prefix}${href}`} />)}

      {children}

      {dev && <meta name="microsite:start" />}
      <Fragment>{__renderPageHead}</Fragment>
      {dev && <meta name="microsite:end" />}
    </head>
  );
};

export const MicrositeScript: FunctionalComponent = () => {
  const { debug, hasGlobalScript, basePath, scripts, dev, devProps } = useContext(
    __InternalDocContext
  );

  return (
    <Fragment>
      { dev && (
        <Fragment>
          <script data-csr="true" dangerouslySetInnerHTML={{__html: `window.HMR_WEBSOCKET_URL = 'ws://localhost:3333';` }} />
          <script type="module" src="/_snowpack/hmr-client.js" />
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: `import csr from '/_snowpack/pkg/microsite/client/csr.js';
import Page from '${dev}';
csr(Page, ${JSON.stringify(devProps)});`
            }}
          />
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: `(async () => {
\ttry { await import('/src/global/index.css.proxy.js'); } catch (e) {}
\ttry {
\t\tconst global = await import('/src/global/index.js').then(mod => mod.default);
\t\tif (global) global();
\t} catch (e) {}
})()`,
            }}
          />
        </Fragment>
      )}
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
            __html: `import global from '${basePath}_hydrate/chunks/_global.js';\nglobal();`,
          }}
        />
      )}
      {scripts && (
        <script
          type="module"
          async
          dangerouslySetInnerHTML={{
            __html: generateHydrateScript(scripts, { basePath }),
          }}
        />
      )}
    </Fragment>
  );
};
