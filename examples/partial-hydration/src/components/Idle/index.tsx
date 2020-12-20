import { FunctionalComponent } from "preact";
import { withHydrate } from "microsite/hydrate";
import Counter from "../Counter";

import css from "./index.module.css";

const Idle: FunctionalComponent<any> = (props: any) => {
  return (
    <section class={css.idle}>
      <Counter {...props} />
      <p>Hydrated as soon as possible (on idle)</p>
    </section>
  );
};

export default withHydrate(Idle, { method: "idle" });
