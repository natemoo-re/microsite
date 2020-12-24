import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

interface BProps {}

const B: FunctionalComponent<BProps> = () => {
  return (
    <>
      <Head>
        <seo.title>Page B</seo.title>

        <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
        <link rel="alternate icon" href="./favicon.ico" />
      </Head>

      <main>
        <a href="./">Go to <code>/</code></a>
      </main>
    </>
  );
};

export default definePage(B);
