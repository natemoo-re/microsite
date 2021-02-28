import {
  defineDocument,
  Html,
  Head,
  Main,
  MicrositeScript,
} from "microsite/document";
import getRenderer from '../utils/fela';
import { renderToSheetList } from 'fela-dom';

const Document = ({ sheetList }) => (
  <Html>
    <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />

        {sheetList.map((sheet: any) => (
          <style type="text/css" data-fela-type={sheet.type} data-fela-rehydration={sheet.rehydration} {...sheet.attributes} dangerouslySetInnerHTML={{ __html: sheet.css }} />
        ))}
    </Head>
    <body>
      <Main />
      <MicrositeScript />
    </body>
  </Html>
);

export default defineDocument(Document, {
  async prepare({ renderPage }) {
    const renderer = getRenderer();
    const page = await renderPage();
    const sheetList = renderToSheetList(renderer);
    return { ...page, sheetList };
  },
});
