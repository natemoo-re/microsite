import {
  defineDocument,
  Html,
  Head,
  Main,
  MicrositeScript,
} from "microsite/document";
import { setup, extractCss } from 'goober';
setup(h);

const Document = ({ css }) => (
  <Html>
    <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />

        <style type="text/css" id="_goober" dangerouslySetInnerHTML={{ __html: css }} />
    </Head>
    <body>
      <Main />
      <MicrositeScript />
    </body>
  </Html>
);

export default defineDocument(Document, {
  async prepare({ renderPage }) {
    const page = await renderPage();
    const css = extractCss();
    return { ...page, css };
  },
});
