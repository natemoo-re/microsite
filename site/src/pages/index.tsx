import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

import { resolve, join } from 'path';
import { promises as fsp } from 'fs';
import remark from "remark";
import html from "remark-html";

const Index: FunctionalComponent<{ content?: string }> = ({ content }) => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>
      </Head>

      <main>
        <article dangerouslySetInnerHTML={{ __html: content }}></article>
      </main>
    </>
  );
};

async function markdownToHtml(markdown) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export default definePage(Index, {
  async getStaticProps() {
    const readme = resolve(join('..', `README.md`));
    const content = await fsp.readFile(readme, "utf8");
    const html = await markdownToHtml(content);

    return {
      props: {
        content: html
      }
    }
  }
});
