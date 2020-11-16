import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

const Index: FunctionalComponent<any> = () => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>
      </Head>

      <main>
        <h1>Microsite</h1>
        
        <a href="https://github.com/natemoo-re/microsite">See Github</a>
      </main>
    </>
  );
};

export default definePage(Index);
