import { FunctionalComponent } from "preact";
import { Head, seo } from "microsite/head";
import {
  Fire,
  Docs,
  Puzzle,
  CloudDownload,
  Code,
  Bolt,
  Github,
} from "@/components/Icon";

import css from "./index.module.css";
import Header from "@/components/Header";
import Prompt from "@/components/Prompt";

const Index: FunctionalComponent = () => {
  return (
    <>
      <Head>
        <seo.title>Microsite</seo.title>
        <seo.description>
          Microsite is a Preact-based static site generator featuring
          next-generation features like Automatic Partial Hydration and
          intelligent build caches.
        </seo.description>

        <link
          rel="preload"
          as="style"
          href="https://use.typekit.net/ssd0uka.css"
        />
        <link rel="stylesheet" href="https://use.typekit.net/ssd0uka.css" />
      </Head>

      <Header />

      <div class={css.header}>
        <div class="container">
          <h2>Static sites made simple.</h2>

          <div class={css.cta}>
            <Prompt />
            <a class="button" href="/docs/getting-started">
              Read the docs
            </a>
            <a
              class={`${css.github} button`}
              href="https://github.com/natemoo-re/microsite"
              title="Github"
            >
              <Github width={32} height={32} />
            </a>
          </div>
        </div>
      </div>

      <main class={`${css.main} container`}>
        <article class={css.article} data-stack="md">
          <p class={css.lede}>
            React-based static site generators offer a world-class developer
            experience at the cost of large bundles and slow TTI.
          </p>
          <p class={css.lede}>
            Microsite offers the best of both worlds—a phenomenal, familiar
            developer experience and a straightforward build output with
            absolutely no bloat.
          </p>
        </article>
        <aside>
          <ul class={css.features} role="list" data-stack="sm">
            <li>
              <Fire width={24} height={24} />
              <div>
                Incredible build speeds, thanks to <em>esbuild</em> and
                intelligent caching
              </div>
            </li>
            <li>
              <Docs width={24} height={24} />
              <div>
                Familiar <em>JSX templates</em> written with <em>Preact</em> and{" "}
                <em>TypeScript</em>
              </div>
            </li>
            <li>
              <Puzzle width={24} height={24} />
              <div>
                Out of the box <em>CSS Modules</em> integration
              </div>
            </li>
            <li>
              <CloudDownload width={24} height={24} />
              <div>
                Simple <em>data fetching</em> from remote sources at
                compile-time
              </div>
            </li>
            <li>
              <Code width={24} height={24} />
              <div>
                <em>Zero client-side JavaScript</em> by default, with easy
                opt-in
              </div>
            </li>
            <li>
              <Bolt width={24} height={24} />
              <div>
                World class performance with{" "}
                <em>Automatic Partial Hydration</em>
              </div>
            </li>
          </ul>
        </aside>

        <article class={css.article} data-stack="md">
          <h3>Top-notch Performance</h3>
          <p>
            Static site generators (SSG) are a great opportunity to return to
            web development fundamentals—semantic HTML, well-structured CSS, and
            just as much JavaScript as you need. Unfortunately, many
            framework-based SSG ship far more JavaScript to the client than
            necessary, even for pages without a single interactive component.
          </p>
          <p>
            Microsite makes phenomenal performance fool-proof by leveraging{" "}
            <em>Automatic Partial Hydration</em>. By wrapping your interactive
            components in the <code>withHydrate</code> utility, Microsite
            automatically code-splits, lazyloads, and partially hydrates{" "}
            <em>just</em> the components needed to make your page interactive.
          </p>
        </article>
      </main>
    </>
  );
};

export default Index;

// export default definePage(Index, {
//   async getStaticProps({ prefetch }) {
//     const path = join('..', `README.md`);
//     if (prefetch) return prefetch(path);

//     const content = await fsp.readFile(path, "utf8");
//     const html = await markdownToHtml(content);

//     return {
//       props: {
//         content: html
//       }
//     }
//   }
// });
