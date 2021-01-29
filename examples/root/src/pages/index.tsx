import { FunctionalComponent } from 'preact';
import { definePage } from 'microsite/page';
import { Head, seo } from 'microsite/head';
import title from 'title';
import { promises as fsp } from 'fs';

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
        <h1>Microsite Examples</h1>

        <p>These examples are a work in progress, but more are on the way now that microsite@1.0.0 is out!</p>
        <p>See the <a href="https://github.com/natemoo-re/microsite">GitHub</a> repo for the example source code.</p>

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
    const examples = await fsp.readFile('../examples.json').then(res => JSON.parse(res.toString()));
    console.log(examples);

    return { props: { examples } }
  }
});
