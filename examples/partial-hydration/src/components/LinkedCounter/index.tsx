import { h, FunctionalComponent } from "preact";
import css from "./index.module.css";

import { state } from "../../utils/linked-state";
import { withHydrate } from "microsite/hydrate";
import { useGlobalState } from "microsite/global";

const LinkedCounter: FunctionalComponent<{ name: string }> = ({ name }) => {
  const value = useGlobalState(state);

  return (
    <>
      <div class={css.root}>
        <div class={css.counter}>
          <button onClick={() => state.count--}>-</button>
          <p>{value.count}</p>
          <button onClick={() => state.count++}>+</button>
        </div>

        <span>
          I'm rendererd by <code>{name}</code>
        </span>
      </div>
    </>
  );
};

export default withHydrate(LinkedCounter, { method: "visible" });
