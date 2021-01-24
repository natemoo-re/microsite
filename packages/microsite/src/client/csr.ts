import "preact/debug";
import { h, render } from "preact";
import { generateStaticPropsContext } from "../utils/router.js";

const noop = () => Promise.resolve();

async function csr(fileName: string, Page: any, initialProps: any = {}) {
  let Component = null;
  let getStaticProps: any = noop;
  let getStaticPaths: any = noop;
  if (typeof Page === "function") Component = Page;

  const root = document.getElementById("__microsite");
  let props = {};
  let paths = [];
  if (Page.Component) {
    Component = Page.Component;
    getStaticProps = Page.getStaticProps ?? noop;
    getStaticPaths = Page.getStaticPaths ?? noop;
  }

  paths = await getStaticPaths({}).then((res) => res && res.paths);
  paths =
    paths &&
    paths.map((pathOrParams) =>
      generateStaticPropsContext(fileName, pathOrParams)
    );
  const match =
    paths &&
    paths.find(
      (ctx) =>
        ctx.path === window.location.pathname ||
        ctx.path === `${window.location.pathname}/index`
    );

  if (paths && !match) {
    /// @ts-expect-error
    const ErrorPage = await import("/_snowpack/pkg/microsite/_error.js").then(
      (mod) => mod.default
    );
    render(h(ErrorPage, { statusCode: 404 }, null), root);
  } else {
    let ctx = paths
      ? match
      : generateStaticPropsContext(fileName, window.location.pathname);
    props = await getStaticProps(ctx).then((res) => res && res.props);
    if (!props) props = initialProps;
    render(h(Component, props, null), root);
  }
}

export { csr };
