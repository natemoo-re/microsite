import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';
import title from 'title';

interface IndexProps {
  examples: string[]
}

const Index: FunctionalComponent<IndexProps> = ({ examples }) => {
  return (
    <>
      <Head>
        <seo.title>Microsite Examples</seo.title>

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Microsite!</h1>

        <ul>
          {examples.map(example => (
            <li>
              <a href={`/${example}`}>{title(example.replace(/-/g, ' '))}</a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default definePage(Index, {
  async getStaticProps() {
    let examples = await fetch('./root/src/examples.json').then(res => res.json());
    console.log(examples)

    return { props: { examples } }
  }
});
