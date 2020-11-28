import { FunctionalComponent } from "preact";
import { withHydrate } from "microsite/hydrate";
import css from "./Prompt.module.css";

const Prompt: FunctionalComponent = () => {
  const handleClick = async () => {
    console.log("Click!");
    const res = await navigator.clipboard.writeText(
      `npm init microsite :project`
    );
    console.log(res);
  };

  return (
    <button class={css.prompt} click={handleClick}>
      <code>
        <span>
          npm init microsite <i class={css.project}>:project</i>
        </span>
      </code>
    </button>
  );
};

export default withHydrate(Prompt, { method: "interaction" });
