import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

import Counter from '../components/Counter';

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>

      <main>
        <div class="stack">
          <h1>Custom SSR Fallback</h1>
          <p>Disable JavaScript on this page and reload to see the custom SSR placeholder, which is defined in <code>fallback</code> to <code>withHydrate</code>.</p>
        </div>

        <Counter />
      </main>
    </>
  );
};

export default definePage(Index);
