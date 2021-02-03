import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

import Box from '../components/Box';
import GlobalStyle from '../components/GlobalStyle';

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <>
      <Head>
        <seo.title>With Goober</seo.title>
      </Head>

      <GlobalStyle/>

      <main>
        <h1>Welcome to Microsite + Goober!</h1>

        <Box />
      </main>
    </>
  );
};

export default definePage(Index);
