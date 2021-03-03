import { FunctionComponent } from "preact";
import { useFela } from "preact-fela";

const Container: FunctionComponent = ({ children }) => {
  const { css } = useFela();
  return (
    <main
      class={css({
        display: "grid",
        minHeight: "100vh",
        width: "100vw",
        gridTemplateColumns:
          "minmax(12px, auto) minmax(auto, 1100px) minmax(12px, auto)",
      })}
    >
        <article>{children}</article>
    </main>
  );
};

export default Container;
