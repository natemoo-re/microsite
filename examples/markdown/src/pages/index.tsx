import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";
import { readFileSync } from "fs";
import { renderToString, Article } from "@micrositejs/markdown";

interface IndexProps {
  content: any;
}

const Index: FunctionalComponent<IndexProps> = ({ content }) => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>

      <main>
        <Article content={content} />
      </main>
    </>
  );
};

export default definePage(Index, {
  async getStaticProps() {
    const mdx = readFileSync("./src/posts/index.md").toString();
    const { data, content } = await renderToString(mdx, { format: "md" });

    return {
      props: {
        data,
        content,
      },
    };
  },
});
