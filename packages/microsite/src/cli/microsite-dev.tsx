import { ServerRuntime, SnowpackDevServer, startServer } from "snowpack";
import arg from "arg";
import { join, resolve, extname } from "path";
import type { IncomingMessage, ServerResponse } from "http";
import { green, dim } from "kleur/colors";
import polka from "polka";
import { openInBrowser } from "../utils/open.js";
import { readDir } from "../utils/fs.js";
import { promises as fsp } from "fs";
import { ErrorProps } from "error.js";
import { loadConfiguration } from "../utils/command.js";
import { h, FunctionalComponent } from "preact";
import {
  generateStaticPropsContext,
  normalizePathName,
} from "../utils/router.js";

const noop = () => Promise.resolve();

let devServer: SnowpackDevServer;
let runtime: ServerRuntime;
let renderToString: any;
let csrSrc: string;
let Document: any;
let __HeadContext: any;
let __InternalDocContext: any;
let ErrorPage: any;
let errorSrc: string;

const loadErrorPage = async () => {
  if (!ErrorPage) {
    try {
      const {
        exports: { default: UserErrorPage },
      } = await runtime.importModule("/src/pages/_error.js");
      ErrorPage = UserErrorPage;
      errorSrc = "/src/pages/_error.js";
    } catch (e) {
      errorSrc = await devServer.getUrlForPackage("microsite/error");
      const {
        exports: { default: InternalErrorPage },
      } = await runtime.importModule(errorSrc);
      ErrorPage = InternalErrorPage;
    }
  }
  return [ErrorPage, errorSrc];
};

const renderPage = async (
  componentPath: string,
  absoluteUrl: string,
  initialProps?: any
) => {
  if (!renderToString) {
    const preactRenderToStringSrc = await devServer.getUrlForPackage(
      "preact-render-to-string"
    );
    renderToString = await runtime
      .importModule(preactRenderToStringSrc)
      .then(({ exports: { default: mod } }) => mod);
  }
  if (!Document) {
    const [documentSrc, csrUrl] = await Promise.all([
      devServer.getUrlForPackage("microsite/document"),
      devServer.getUrlForPackage("microsite/client/csr"),
    ]);
    csrSrc = csrUrl;
    const {
      exports: {
        Document: InternalDocument,
        __HeadContext: __Head,
        __InternalDocContext: __Doc,
      },
    } = await runtime.importModule(documentSrc);
    __HeadContext = __Head;
    __InternalDocContext = __Doc;
    try {
      const {
        exports: { default: UserDocument },
      } = await runtime.importModule("/src/pages/_document.js");
      Document = UserDocument;
    } catch (e) {
      Document = InternalDocument;
    }
  }

  try {
    let pathname = componentPath.replace("/src/pages/", "");
    let Component = null;
    let getStaticProps: any = noop;
    let getStaticPaths: any = noop;
    let pageProps = initialProps ?? {};
    let paths = [];

    try {
      let {
        exports: { default: Page },
      } = await runtime.importModule(componentPath);
      if (typeof Page === "function") Component = Page;

      if (Page.Component) {
        Component = Page.Component;
        getStaticProps = Page.getStaticProps ?? noop;
        getStaticPaths = Page.getStaticPaths ?? noop;
      }
    } catch (e) {
      const [Page, errorSrc] = await loadErrorPage();
      Component = ErrorPage;
      pageProps = initialProps?.statusCode ? initialProps : { statusCode: 404 };
      componentPath = errorSrc;
      pathname = "/_error";

      if (typeof Page === "function") Component = Page;

      if (Page.Component) {
        Component = Page.Component;
        getStaticProps = Page.getStaticProps ?? noop;
        getStaticPaths = Page.getStaticPaths ?? noop;
      }
    }

    paths = await getStaticPaths({}).then((res) => res && res.paths);
    paths =
      paths &&
      paths.map((pathOrParams) =>
        generateStaticPropsContext(pathname, pathOrParams)
      );

    const match =
      paths &&
      paths.find(
        (ctx) =>
          ctx.path === pathname ||
          ctx.path === `${pathname}/index` ||
          ctx.path === normalizePathName(absoluteUrl)
      );

    if (paths && !match) {
      const [ErrorPage, errorSrc] = await loadErrorPage();
      Component = ErrorPage;
      pageProps = { statusCode: 404 };
      componentPath = errorSrc;
    } else {
      let ctx = paths ? match : generateStaticPropsContext(pathname, pathname);
      pageProps = await getStaticProps(ctx).then((res) => res && res.props);
      if (!pageProps) pageProps = initialProps;
    }

    const headContext = {
      head: {
        current: [],
      },
    };

    const HeadProvider: FunctionalComponent = ({ children }) => {
      return <__HeadContext.Provider value={headContext} {...{ children }} />;
    };

    const { __renderPageResult, ...docProps } = await Document.prepare({
      renderPage: async () => ({
        __renderPageResult: renderToString(
          <HeadProvider>
            <Component {...pageProps} />
          </HeadProvider>
        ),
      }),
    });

    const docContext = {
      dev: componentPath,
      devProps: pageProps ?? {},
      __csrUrl: csrSrc,
      __renderPageHead: headContext.head.current,
      __renderPageResult,
    };

    let contents = renderToString(
      <__InternalDocContext.Provider
        value={docContext}
        children={<Document {...(docProps as any)} />}
      />
    );
    return `<!DOCTYPE html>\n<!-- Generated by microsite -->\n${contents}`;
  } catch (e) {
    console.error(e);
    return;
  }
};

const EXTS = [".js", ".jsx", ".ts", ".tsx", ".mjs"];

function parseArgs(argv: string[]) {
  return arg(
    {
      "--port": Number,
      "--no-open": Boolean,

      // Aliases
      "-p": "--port",
    },
    { permissive: true, argv }
  );
}

export default async function dev(
  argvOrParsedArgs: string[] | ReturnType<typeof parseArgs>
) {
  const cwd = process.cwd();
  const args = Array.isArray(argvOrParsedArgs)
    ? parseArgs(argvOrParsedArgs)
    : argvOrParsedArgs;
  let PORT = args["--port"] ?? 8888;

  const config = await loadConfiguration("dev");

  const snowpack = await startServer({
    config,
    lockfile: null,
  });
  devServer = snowpack;
  runtime = snowpack.getServerRuntime();

  snowpack.onFileChange(({ filePath }) => {
    const url = snowpack.getUrlForFile(filePath);
    if (url === "/src/pages/_document.js") {
      Document = null;
    }
    if (url === "/src/pages/_error.js") {
      ErrorPage = null;
    }
  });

  const sendErr = async (res: ServerResponse, props?: ErrorProps) => {
    // Calling `renderPage` with a component and path that do not exist
    // triggers rendering of an error page.
    const contents = await renderPage(`/_error`, `/_error`, props);
    res.writeHead(props?.statusCode ?? 500, {
      "Content-Type": "text/html",
    });
    res.end(contents);
  };

  const server = polka()
    .use(async (req: IncomingMessage, res: ServerResponse, next: any) => {
      if (req.url?.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      next();
    })
    .use(async (req: IncomingMessage, res: ServerResponse, next: any) => {
      if (req.url === "/") return next();
      const clean = /(\.html|index\.html|index|\/)$/;
      if (clean.test(req.url ?? "")) {
        res.writeHead(302, {
          Location: req.url?.replace(clean, ""),
        });
        res.end();
      }
      next();
    })
    .use(async (req: IncomingMessage, res: ServerResponse, next: any) => {
      if (
        req.url !== "/" &&
        !(req.url.endsWith(".html") || req.url.indexOf(".") === -1)
      )
        return next();

      let base = req.url.slice(1);
      if (base.endsWith(".html")) base = base.slice(0, ".html".length * -1);
      if (base === "") base = "index";

      const findPageComponentPathForBaseUrl = async (
        base: string
      ): Promise<string | null> => {
        const possiblePagePaths = [base, `${base}/index`].map(
          buildPageComponentPathForBaseUrl
        );
        for (const pagePath of possiblePagePaths) {
          if (await isPageComponentPresent(pagePath)) {
            return pagePath;
          }
        }
        const dynamicBaseUrl = await findPotentialMatch(base);
        if (!dynamicBaseUrl) {
          return null;
        }
        return buildPageComponentPathForBaseUrl(dynamicBaseUrl);
      };

      const buildPageComponentPathForBaseUrl = (base: string): string =>
        `/src/pages/${base}.js`;

      const isPageComponentPresent = async (path: string): Promise<boolean> => {
        try {
          await snowpack.loadUrl(path, { isSSR: true });
          return true;
        } catch {
          return false;
        }
      };

      const findPotentialMatch = async (base: string) => {
        const baseParts = [...base.split("/"), "index"];
        const pages = join(cwd, "src", "pages");
        let files = await readDir(pages);
        files = files
          .filter((file: string) => EXTS.includes(extname(file)))
          .map((file: string) =>
            file.slice(pages.length, extname(file).length * -1)
          )
          .filter((file: string) => {
            if (file.indexOf("[") === -1) return false;
            const parts = file.slice(1).split("/");
            if (parts.length === baseParts.length - 1)
              return parts.every((part, i) =>
                part.indexOf("[") > -1 ? true : part === baseParts[i]
              );
            if (parts.length === baseParts.length)
              return parts.every((part, i) =>
                part.indexOf("[") > -1 ? true : part === baseParts[i]
              );
            if (file.indexOf("[[") > -1)
              return parts.every((part, i) => {
                if (part.indexOf("[[")) return i === parts.length - 1;
                if (part.indexOf("[")) return true;
                return part === baseParts[i];
              });
          });
        if (files.length === 0) return null;
        if (files.length === 1) return files[0].slice(1);
        if (files.length > 1) {
          // TODO: rank direct matches above catch-all routes
          // console.log(files);
          return files[0];
        }
      };

      const pagePath = await findPageComponentPathForBaseUrl(base);
      if (!pagePath) {
        return next();
      }
      const absoluteUrl = `/${base}`;
      res.setHeader("Content-Type", "text/html");
      res.end(await renderPage(pagePath, absoluteUrl));
    })
    .use(async (req: IncomingMessage, res: ServerResponse, next: any) => {
      try {
        // Respond directly if asset is found
        const result = await snowpack.loadUrl(req.url);
        if (result.contentType)
          res.setHeader("Content-Type", result.contentType);

        const MIME_EXCLUDE = ["image", "font"];
        if (
          req.url.indexOf("/_snowpack/pkg/microsite") === -1 &&
          result.contentType &&
          !MIME_EXCLUDE.includes(result.contentType.split("/")[0])
        ) {
          result.contents = result.contents
            .toString()
            .replace(/preact\/hooks/, "microsite/client/hooks");
        }

        return res.end(result.contents);
      } catch (err) {}
      next();
    })
    .use(async (req: IncomingMessage, res: ServerResponse, next: any) => {
      try {
        let localPath = resolve(cwd, `.${req.url}`);
        const stats = await fsp.stat(localPath);
        if (stats.isDirectory()) {
          let contents = await readDir(localPath);
          contents = contents.map((path) => path.slice(localPath.length));
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify(contents));
        }
      } catch (err) {}
      next();
    })
    .get("*", (_req: IncomingMessage, res: ServerResponse) =>
      sendErr(res, { statusCode: 404 })
    );

  await new Promise<void>((resolve) =>
    server.listen(PORT, (err) => {
      if (err) throw err;
      resolve();
    })
  );

  let protocol = "http:";
  let hostname = "localhost";

  if (!args["--no-open"]) {
    await openInBrowser(protocol, hostname, PORT, "/", "chrome");
  }

  console.log(
    `${dim("[microsite]")} ${green("✔")} Microsite started on ${green(
      `${protocol}//${hostname}:${PORT}`
    )}\n`
  );
}
