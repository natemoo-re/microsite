import { h, createContext, FunctionalComponent } from 'preact';
import { useRef } from 'preact/hooks';

export const __DocContext = createContext({ head: { current: [] }});

export const Document: FunctionalComponent<{ styles?: string[], hasScripts?: boolean }> = ({ styles = [], hasScripts = false, children }) => {
    const head = useRef([]);
    console.log(head.current);

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width" />

                {styles.map(style => <style dangerouslySetInnerHTML={{ __html: style }} />)}
            </head>
            <body>
                <div id="__crooked">
                    <__DocContext.Provider value={{ head }} children={children} />
                </div>

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
