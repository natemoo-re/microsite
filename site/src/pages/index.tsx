import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

import Layout from "@/components/Layout";

const Index: FunctionalComponent = () => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>
        <seo.description>
          Microsite is a next-generation static site generator built on top of Snowpack,
          including features like Automatic Partial Hydration.
        </seo.description>
      </Head>

      <Layout>
        <header class="full-width">
          <h1>Do more with less JavaScript.</h1>
          <p style={{ fontSize: '1.5em' }}>Microsite is a smarter, performance-obsessed static site generator powered by Preact and Snowpack.</p>
        </header>
      </Layout>
      {/* <main class={css.main}>
        <Logo />
        <h1>This site is under construction.</h1>
      </main> */}
    </>
  );
};

export default definePage(Index);
