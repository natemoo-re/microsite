import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

const Index: FunctionalComponent<any> = ({ num }) => {
  const nextPage = num === 5 ? 1 : num + 1;
  return (
    <>
      <Head>
        <seo.title>{num} | Dynamic Page</seo.title>
      </Head>

      <main>
        <h1>
          I'm generated with <code>getStaticPaths</code>!
        </h1>

        <p>
          Head to{" "}
          <a href={`/posts/${nextPage}`}>
            <code>/posts/{nextPage}</code>
          </a>
        </p>
      </main>
    </>
  );
};

export default definePage(Index, {
  path: "/posts/[id]",
  async getStaticPaths() {
    return {
      paths: Array.from({ length: 5 }, (_, i) => `/posts/${i + 1}`),
    };
  },
  async getStaticProps(ctx) {
    return {
      props: {
        num: Number(ctx.params.id),
      },
    };
  },
});
