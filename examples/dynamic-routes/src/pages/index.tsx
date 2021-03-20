import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

const Index: FunctionalComponent<any> = ({ renderedAt }) => {
  return (
    <>
      <Head>
        <seo.title>Dynamic Pages</seo.title>
      </Head>

      <main>
        <h1>Check out all these dynamic pages!</h1>

        <ul>
          {Array.from({ length: 5 }, (_, i) => (
            <li>
              <a href={`/posts/${i}`}>Page {i}</a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default definePage(Index);
