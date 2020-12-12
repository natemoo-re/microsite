import 'preact/debug';
import { h, render } from "preact";

const noop = () => Promise.resolve();

// TODO: fix `ctx` params
async function csr(Page: any, initialProps: any = {}, ctx: any = {}) {
    let Component = null;
    let getStaticProps: any = noop;
    let getStaticPaths: any = noop;
    if (typeof Page === 'function') Component = Page;
    
    const root = document.getElementById('__microsite');
    let props = {};
    let paths = [];
    if (Page.Component) {
        Component = Page.Component;
        getStaticProps = Page.getStaticProps ?? noop;
        getStaticPaths = Page.getStaticPaths ?? noop;
    }
    
    // TODO: fix params-based routing
    paths = await getStaticPaths(ctx).then(res => res && res.paths);
    
    if (paths && !(paths.includes(window.location.pathname) || paths.includes(`${window.location.pathname}/index`))) {
        /// @ts-expect-error
        const ErrorPage = await import('/web_modules/microsite/_error.js').then(mod => mod.default);
        render(h(ErrorPage, { statusCode: 404 }, null), root);
    } else {
        props = await getStaticProps(ctx).then(res => res && res.props);
        if (!props) props = initialProps;
        render(h(Component, props, null), root);
    }
}

export { csr }
