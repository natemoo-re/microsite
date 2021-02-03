import { useFela } from "preact-fela";

const Box = () => {
  const { css } = useFela();

  return (
    <div
      class={css({
        width: "128px",
        height: "128px",
        background: "red",
        "&:hover": {
          background: "blue",
        },
      })}
    />
  );
};

export default Box;
