import 'preact/debug';
import { h, render } from "preact";
/// @ts-expect-error
import { Head } from "microsite/document";

const noop = () => Promise.resolve();
async function csr(Page: any) {
    let Component = null;
    let getStaticProps: any = noop;
    // let getStaticPaths: any = noop;
    if (typeof Page === 'function') Component = Page;

    let props = {};
    if (Page.Component) {
        Component = Page.Component;
        getStaticProps = Page.getStaticProps ?? noop;
        // getStaticPaths = Page.getStaticPaths ?? noop;
    }

    const root = document.getElementById('__microsite');
    props = await getStaticProps().then(res => res && res.props);
    if (!props) props = {};

    render(h(Component, props, null), root);
}

export { csr }
