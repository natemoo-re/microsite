import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

interface AProps {}

const A: FunctionalComponent<AProps> = () => {
  return (
    <>
      <Head>
        <seo.title>Page A</seo.title>

        <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
        <link rel="alternate icon" href="./favicon.ico" />
      </Head>

      <main>
        <a href="./b">Go to <code>/b</code></a>
      </main>
    </>
  );
};

export default definePage(A);
