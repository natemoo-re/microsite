import crypto from "crypto";
import { resolve, join } from "path";
import { writeFile, copyFile, fileExists } from "./fs.js";

import module from "module";
const { createRequire } = module;
const require = createRequire(import.meta.url);

import {
  Document as InternalDocument,
  __HeadContext,
  __PageContext,
  __InternalDocContext,
} from "../document.js";
import { FunctionalComponent, h } from "preact";
import { renderToString } from "preact-render-to-string";
import { generateStaticPropsContext } from "./router.js";
import fetch from "node-fetch";

export const CACHE_DIR = ".microsite/cache";
export const STAGING_DIR = ".microsite/staging";
export const SSR_DIR = ".microsite/ssr";
export const OUT_DIR_NO_BASE = "./dist";
export let OUT_DIR = "./dist";

export const setBasePath = (p: string) =>
  (OUT_DIR =
    p === "/"
      ? OUT_DIR
      : join(OUT_DIR, ...p.replace(/^\//, "").replace(/\/$/, "").split("/")));

export interface ManifestEntry {
  name: string;
  hydrateStyleBindings: string[] | null;
  hydrateBindings: Record<string, Record<string, string>> | null;
}

export interface RouteDataEntry {
  name: string;
  route: string;
  props: Record<string, object>;
}

export const getFileNameFromPath = (path: string) => {
  return path
    .split(STAGING_DIR)[1]
    .replace(/^\/src\//, "")
    .replace(/([\[\]])/gi, "_")
    .replace(/\..*$/, "");
};

const PROXY_IMPORT_REGEX = /^.*\.(\w+)\.proxy\.js$/g;
export const proxyImportTransformer = {
  filter: (source: string) => PROXY_IMPORT_REGEX.test(source),
  transform: (source: string) =>
    source.replace(PROXY_IMPORT_REGEX, (fullMatch, originalExt) => {
      if (originalExt === "json") {
        return fullMatch;
      }

      return fullMatch.replace(".proxy.js", "");
    }),
};

const PREACT_IMPORT_REGEX = /^.*_snowpack\/pkg\/preact([\/\w]+)?\.js$/gm;
export const preactImportTransformer = {
  filter: (source: string) => PREACT_IMPORT_REGEX.test(source),
  transform: (source: string) =>
    source.replace(PREACT_IMPORT_REGEX, (_match, subpath) => {
      return subpath ? `preact${subpath}` : `preact`;
    }),
};

const PREACT_PKG = require("preact/package.json");
const PREACT_VERSION = PREACT_PKG.version;

const PREACT_CDN_LOOKUP = Object.keys(PREACT_PKG.exports).reduce((acc, key) => {
  if (key !== "./package.json" && key !== "./") {
    const sub = key.replace(/^\./, "");
    return {
      ...acc,
      [`preact${sub}`]: `https://cdn.skypack.dev/preact@${PREACT_VERSION}${sub}`,
    };
  }
  return acc;
}, {});
let PREACT_CDN_SOURCES = null;

const resolvePreactCdnSources = async () => {
  if (PREACT_CDN_SOURCES) return;

  const mdls = Object.keys(PREACT_CDN_LOOKUP);
  const pinnedUrls = await Promise.all(
    mdls.map((mdl) => {
      const lookupUrl = PREACT_CDN_LOOKUP[mdl];
      return fetch(lookupUrl).then(
        (res) => `https://cdn.skypack.dev${res.headers.get("x-pinned-url")}`
      );
    })
  );

  PREACT_CDN_SOURCES = mdls.reduce((acc, curr, i) => {
    return { ...acc, [curr]: pinnedUrls[i] };
  }, {});

  return;
};

const PREACT_REGEX = /['"]preact([\/\w]+)?['"]/gm;

export const preactToCDN = async (code: string) => {
  if (!/preact/gm.test(code)) {
    return code;
  }

  await resolvePreactCdnSources();

  return code.replace(PREACT_REGEX, (fullMatch, subpath) => {
    if (subpath === "/hooks") {
      return fullMatch.replace(
        "preact/hooks",
        PREACT_CDN_SOURCES["preact/hooks"]
      );
    }

    return fullMatch.replace("preact", PREACT_CDN_SOURCES["preact"]);
  });
};

const WITH_HYDRATE_REGEX = /import\s+\{\s*withHydrate\s*(?:as (\w+))?\}\s+from\s+['"]microsite\/hydrate(?:\.js)?['"];?/gim;
export const withHydrateTransformer = {
  filter: (source: string) => WITH_HYDRATE_REGEX.test(source),
  transform: (source: string) =>
    source.replace(WITH_HYDRATE_REGEX, (_match, name = "withHydrate") => {
      return `const ${name} = i=>i;`;
    }),
};

/**
 * For the final browser code, we need to strip out withHydrate
 * by replacing it with an identity function which can be
 * completely stripped by a minifier
 */
export const stripWithHydrate = (source: string) => {
  if (!withHydrateTransformer.filter(source)) return source;
  return withHydrateTransformer.transform(source);
};

export const hashContentSync = (content: string, len?: number) => {
  const hash = crypto.createHash("sha256");
  hash.update(Buffer.from(content));
  let res = hash.digest("hex");
  if (typeof len === "number") res = res.slice(0, len);
  return res;
};

export const emitFile = (filename: string, content: string | Uint8Array) =>
  writeFile(
    resolve(process.cwd(), join(SSR_DIR, filename)),
    content.toString()
  );
export const emitFinalAsset = (
  filename: string,
  content: string | Uint8Array
) =>
  writeFile(
    resolve(process.cwd(), join(OUT_DIR, filename)),
    content.toString()
  );
export const copyAssetToFinal = async (
  path: string,
  transform?: (source: string) => Promise<string>
) =>
  copyFile(
    path,
    resolve(process.cwd(), join(OUT_DIR, path.slice(resolve(SSR_DIR).length))),
    { transform }
  );

const importPage = (filename: string) =>
  import(resolve(process.cwd(), join(SSR_DIR, filename))).then(
    (mod) => mod.default
  );

let UserDocument = null;
const getDocument = async (): Promise<typeof InternalDocument> => {
  if (UserDocument) return UserDocument;
  else if (UserDocument === false) return InternalDocument;
  else if (
    await fileExists(
      resolve(process.cwd(), join(SSR_DIR, "pages", "_document.js"))
    )
  ) {
    UserDocument = await importPage(join("pages", "_document.js"));
    return UserDocument;
  }
  UserDocument = false;
  return InternalDocument;
};

export const renderPage = async (
  data: RouteDataEntry | null,
  manifest: ManifestEntry,
  { basePath = "/", debug = false, hasGlobalScript = false } = {}
): Promise<{ name: string; contents: string }> => {
  let [Document, Page] = await Promise.all([
    getDocument(),
    importPage(manifest.name),
    resolvePreactCdnSources(),
  ]);
  Page = unwrapPage(Page);
  const pageProps = data.props;

  const headContext = {
    head: {
      current: [],
    },
  };

  const pageContext = {
    props: {
      current: {},
    },
  };

  const PageProvider: FunctionalComponent = ({ children }) => {
    return (
      <__PageContext.Provider value={pageContext}>
        {children}
      </__PageContext.Provider>
    );
  };

  const HeadProvider: FunctionalComponent = ({ children }) => {
    return (
      <__HeadContext.Provider value={headContext}>
        {children}
      </__HeadContext.Provider>
    );
  };

  const { __renderPageResult, ...docProps } = await Document.prepare({
    renderPage: async () => ({
      __renderPageResult: renderToString(
        <PageProvider>
          <HeadProvider>
            <Page {...pageProps} />
          </HeadProvider>
        </PageProvider>
      ),
    }),
  });

  const docContext = {
    dev: false,
    manifest,
    styles: manifest.hydrateStyleBindings,
    scripts: manifest.hydrateBindings,
    preload: manifest.hydrateBindings ? Object.values(PREACT_CDN_SOURCES) : [],
    preconnect: [],
    debug,
    hasGlobalScript,
    basePath,
    __renderPageResult,
    __renderPageHead: headContext.head.current,
    __renderPageProps: pageContext.props.current,
  };

  let contents = renderToString(
    <__InternalDocContext.Provider value={docContext}>
      <Document {...(docProps as any)} />
    </__InternalDocContext.Provider>
  );
  contents = contents.replace(
    /<hydrate-marker>(\?h[\s\S]*?\?)<\/hydrate-marker>/g,
    "<$1>\n"
  );
  contents = "<!DOCTYPE html>\n<!-- Generated by microsite -->\n" + contents;

  return {
    name: `${data.route.replace(/\.js$/, "")}.html`,
    contents,
  };
};

export const unwrapPage = (Page: any) => {
  return Page.Component ? Page.Component : Page;
};

let noop: any = () => Promise.resolve();

export const importDataMethods = (path: string): Promise<DataHandlers> =>
  import(path).then((mod) => {
    const Page = mod.default;
    let getStaticPaths = noop;
    let getStaticProps = noop;

    if (Page.Component) {
      getStaticPaths = Page.getStaticPaths ?? noop;
      getStaticProps = Page.getStaticProps ?? noop;
    }

    return { getStaticPaths, getStaticProps };
  });

interface DataHandlers {
  getStaticPaths?: (ctx?: any) => any;
  getStaticProps?: (ctx?: any) => any;
}

// const hashFn = (s: (...args: any[]) => any) => s.toString().split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

export async function applyDataMethods(
  fileName: string,
  handlers: DataHandlers
): Promise<RouteDataEntry[]> {
  const { getStaticPaths, getStaticProps } = handlers;

  // TODO: prefetch
  let staticPaths = [];
  staticPaths = await getStaticPaths({}).then((res) => res?.paths ?? []);

  if (staticPaths.length === 0) {
    const ctx = generateStaticPropsContext(fileName, fileName);
    const staticProps = await getStaticProps(ctx).then(
      (res: any) => res?.props ?? {}
    );
    return [{ name: fileName, route: ctx.path, props: staticProps }];
  }

  return Promise.all(
    staticPaths.map((pathOrParams) => {
      const ctx = generateStaticPropsContext(fileName, pathOrParams);

      return getStaticProps(ctx).then((res: any) => {
        let staticProps = res?.props ?? {};
        return { name: fileName, route: ctx.path, props: staticProps };
      });
    })
  );
}

// export async function printManifest(manifest: ManifestEntry[]) {
//   let tree = [];

//   manifest.forEach(entry => {

//     entry.name
//   })

// }
