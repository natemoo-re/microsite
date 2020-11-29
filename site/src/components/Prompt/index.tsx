import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { withHydrate } from "microsite/hydrate";
import css from "./Prompt.module.css";
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Prompt: FunctionalComponent = () => {
  const [state, setState] = useState("idle");
  const handleClick = async () => {
    setState("copying");
    await Promise.all([
      navigator.clipboard.writeText(`npm init microsite :project`),
      sleep(1500),
    ]);
    setState("idle");
  };

  return (
    <button
      class={`${css.prompt} ${css[state] ?? ""}`.trim()}
      onClick={handleClick}
    >
      <code>
        <span>
          npm init microsite <i class={css.project}>:project</i>
        </span>
      </code>
    </button>
  );
};

export default withHydrate(Prompt, { method: "interaction" });
