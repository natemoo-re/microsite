import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

import DefaultComponentA from "../components/default";
import { NamedComponent as NamedComponentA } from "../components/named";
import DefaultComponentB, {
  NamedComponent as NamedComponentB,
} from "../components/default-and-named";

const Index: FunctionalComponent = () => {
  return (
    <>
      <Head>
        <seo.title>Named Exports</seo.title>
      </Head>

      <main>
        <DefaultComponentA />
        <DefaultComponentB />

        <NamedComponentA />
        <NamedComponentB />
      </main>
    </>
  );
};

export default definePage(Index);
