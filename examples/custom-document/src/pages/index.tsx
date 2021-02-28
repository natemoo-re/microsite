import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

interface IndexProps {
  a: string
}

const Index: FunctionalComponent<IndexProps> = (props) => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>

        <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
        <link rel="alternate icon" href="./favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Microsite!</h1>
        <pre>{JSON.stringify(props)}</pre>
      </main>
    </>
  );
};

export default definePage(Index, {
  async getStaticProps() {
    return { props: { a: 'a' } }
  }
});
