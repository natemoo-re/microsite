import { h, createContext, FunctionalComponent, Fragment } from 'preact';
import { useRef } from 'preact/hooks';
import render from 'preact-render-to-string';

export const __DocContext = createContext({ head: { current: [] }});

export const Document: FunctionalComponent<{ styles?: string[], hasScripts?: boolean }> = ({ styles = [], hasScripts = false, children }) => {
    const head = useRef([]);
    const subtree = render(<__DocContext.Provider value={{ head }}>{children}</__DocContext.Provider>, {}, {});

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width" />

                <Fragment>{head.current}</Fragment>
                {styles.map(style => <style dangerouslySetInnerHTML={{ __html: style }} />)}
            </head>
            <body>
                <div id="__microsite" dangerouslySetInnerHTML={{ __html: subtree }} />

                {hasScripts ? (
                    <>
                        <script type="module" src="/index.js" />
                        <script { ...{ nomodule: '' }} src="https://unpkg.com/systemjs@2.0.0/dist/s.min.js" />
                        <script { ...{ nomodule: '' }} src="/index.legacy.js" />
                    </>
                ) : null}
            </body>
        </html>
    )
}
