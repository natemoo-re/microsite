import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';

import Providers from '../components/Providers';
import Box from '../components/Box';

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <Providers>
      <Head>
        <seo.title>With Fela</seo.title>
      </Head>

      <main>
        <h1>Welcome to Microsite + Fela!</h1>

        <Box />
      </main>
    </Providers>
  );
};

export default definePage(Index);
