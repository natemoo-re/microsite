import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

import css from './index.module.css';
import Logo from '@/components/Logo';

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

      <main class={css.main}>
        <Logo />
        <h1>This site is under construction.</h1>
      </main>
    </>
  );
};

export default definePage(Index);
