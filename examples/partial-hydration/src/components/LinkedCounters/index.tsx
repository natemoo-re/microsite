import { FunctionalComponent } from "preact";
import LinkedCounter from "../LinkedCounter";
import css from "./index.module.css";

const LinkedCounters: FunctionalComponent = () => {
  return (
    <section>
      <h3>But wait! What about *global* state?</h3>
      <p>
        Microsite renders each component in a separate tree, but{" "}
        <code>microsite/global</code> allows components to share state between
        trees.
      </p>

      <div class={css.flex}>
        <LinkedCounter name="alpha" />
        <LinkedCounter name="omega" />
      </div>
    </section>
  );
};

export default LinkedCounters;
