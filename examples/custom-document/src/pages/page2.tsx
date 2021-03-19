import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <>
      <Head>
        <seo.title>Page 2</seo.title>

        <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
        <link rel="alternate icon" href="./favicon.ico" />
      </Head>

      <main>
        <h1>This is just validating that both pages get different titles!</h1>
      </main>
    </>
  );
};

export default definePage(Index);
