import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

import Idle from "@/components/Idle";
import Interaction from "@/components/Interaction";
import Visible from "@/components/Visible";
import Static from "@/components/Static";
import Clock from "@/components/Clock";
import LinkedCounters from "@/components/LinkedCounters";

const Index: FunctionalComponent<any> = ({ renderedAt }) => {
  return (
    <>
      <Head>
        <seo.title>Microsite Demo</seo.title>
      </Head>

      <main>
        <Static renderedAt={renderedAt}>
          <Clock initialDate={renderedAt} />
        </Static>
        <Idle />
        <Interaction />
        <Visible />

        <LinkedCounters />

        <Interaction initialCount={10} />
        <Visible initialCount={10} />
      </main>
    </>
  );
};

export default definePage(Index, {
  async getStaticProps() {
    return {
      props: {
        renderedAt: new Date().toLocaleString().replace(", ", " at "),
      },
    };
  },
});
