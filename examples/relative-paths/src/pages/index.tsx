import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <>
      <Head>
        <seo.title>Home</seo.title>

        <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
        <link rel="alternate icon" href="./favicon.ico" />
      </Head>

      <main>
        <a href="./a">Go to <code>/a</code></a>
      </main>
    </>
  );
};

export default definePage(Index);
