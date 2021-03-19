import { h, render } from 'preact';

export default (Page: any, props: any) => {
    const Component = Page.Component ? Page.Component : Page;
    render(<Component {...props} />, document.getElementById('__microsite'));
}
