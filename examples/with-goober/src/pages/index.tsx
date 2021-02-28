import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

import GlobalStyle from '../components/GlobalStyle';
import Logo from '../components/Logo';

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <>
      <Head>
        <seo.title>With Goober</seo.title>
      </Head>

      <GlobalStyle/>

      <main>
        <h1>Microsite ✕ Goober</h1>
        <p>Name a more iconic duo</p>

        <Logo />
      </main>
    </>
  );
};

export default definePage(Index);
