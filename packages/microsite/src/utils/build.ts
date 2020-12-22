import crypto from "crypto";
import { resolve, join } from "path";
import { writeFile, copyFile } from "./fs.js";

import module from "module";
const { createRequire } = module;
const require = createRequire(import.meta.url);

import { Document } from "../document.js";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import prettier from "prettier";
import { generateStaticPropsContext } from "./router.js";
// import { createPrefetch, getCacheEntry, getPreviousKey } from "./prefetch.js";

export const CACHE_DIR = ".microsite/cache";
export const STAGING_DIR = ".microsite/staging";
export const SSR_DIR = ".microsite/ssr";
export const OUT_DIR_NO_BASE = "./dist";
export let OUT_DIR = "./dist";

export const setBasePath = (p: string) => OUT_DIR = join(OUT_DIR, p);

export interface ManifestEntry {
  name: string;
  hydrateStyleBindings: string[] | null;
  hydrateBindings: Record<string, string[]> | null;
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

const PREACT_IMPORT_REGEX = /^.*preact([\/\w]+)?\.js$/gm;
export const preactImportTransformer = {
  filter: (source: string) => PREACT_IMPORT_REGEX.test(source),
  transform: (source: string) =>
    source.replace(PREACT_IMPORT_REGEX, (_match, subpath) => {
      return subpath ? `preact${subpath}` : `preact`;
    }),
};

const FULL_PREACT_IMPORT_REGEX = /import.*['"]preact([\/\w]+)?['"]/gm;
const PREACT_VERSION = require("preact/package.json").version;

const PREACT_CDN_SOURCES = {
  preact: `https://cdn.skypack.dev/preact@${PREACT_VERSION}`,
  "preact/hooks": `https://cdn.skypack.dev/preact@${PREACT_VERSION}/hooks`,
};
export const preactToCDN = (code: string) => {
  if (!FULL_PREACT_IMPORT_REGEX.test(code)) return code;
  return code.replace(FULL_PREACT_IMPORT_REGEX, (fullMatch, subpath) => {
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
export const renderPage = async (
  data: RouteDataEntry | null,
  manifest: ManifestEntry,
  { basePath = '/', debug = false, hasGlobalScript = false } = {}
): Promise<{ name: string; contents: string }> => {
  let Page = await importPage(manifest.name);
  Page = unwrapPage(Page);
  const props = data.props;

  let contents = renderToString(
    h(
      Document,
      {
        manifest,
        preload: manifest.hydrateBindings
          ? Object.values(PREACT_CDN_SOURCES)
          : [],
        debug,
        basePath,
        hasGlobalScript,
      },
      h(Page, props, null)
    )
  );
  contents = prettier.format(contents, {
    parser: "html",
    embeddedLanguageFormatting: "off",
  });

  return {
    name: `${data.route.replace(/\.js$/, '')}.html`,
    contents,
  };
};

const unwrapPage = (Page: any) => {
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
