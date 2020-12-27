import {
  defineDocument,
  Html,
  Head,
  Main,
  MicrositeScript,
} from "microsite/document";

const Document = () => (
  <Html>
    <Head data-test="SUCCESS" />
    <body>
      <Main />
      <MicrositeScript />
    </body>
  </Html>
);

export default defineDocument(Document, {
  async prepare({ renderPage }) {
    const page = await renderPage();
    return { ...page };
  },
});
