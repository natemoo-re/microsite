import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import { Head, seo } from "microsite/head";

import Idle from "@/components/Idle";
import Visible from "@/components/Visible";
import Static from "@/components/Static";
import Clock from "@/components/Clock";
import LinkedCounter from "@/components/LinkedCounter";
import LinkedCounters from "@/components/LinkedCounters";

const Index: FunctionalComponent<any> = ({ renderedAt }) => {
  return (
    <>
      <Head>
        <seo.title>Microsite Demo</seo.title>
      </Head>

      <main>
        <Static renderedAt={renderedAt}>
          <Clock
            initialDate={renderedAt}
            xss={"</script><script>alert();</script>"}
            {...{ ["</script><script>alert();</script>"]: true }}
            autoplay
            playsinline
            sources={[
              {
                src: "/home/background-desktop.webm",
                type: "video/webm",
              },
              {
                src: "/home/background-desktop.mp4",
                type: "video/mp4",
              },
            ]}
          />
        </Static>
        <Idle />
        <Visible />

        <LinkedCounters />

        <Visible initialCount={10} />

        <LinkedCounter name="omega" />
      </main>
    </>
  );
};

export default definePage(Index, {
  async getStaticProps() {
    return {
      props: {
        renderedAt: new Date(),
      },
    };
  },
});
