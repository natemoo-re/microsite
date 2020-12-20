import { FunctionalComponent } from "preact";
import { withHydrate } from "microsite/hydrate";
import Counter from "@/components/Counter";

import css from "./index.module.css";

const Interaction: FunctionalComponent<any> = (props: any) => {
  let message = "Hydrated on user interaction";
  if (Object.keys(props).length > 0) message += " (with props)";

  return (
    <section class={css.interaction}>
      <Counter {...props} />
      <p>{message}</p>
    </section>
  );
};

export default withHydrate(Interaction, { method: "interaction" });
