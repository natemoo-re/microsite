import { h, FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import css from "./index.module.css";

const Counter: FunctionalComponent<any> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div class={css.counter}>
      <button onClick={() => setCount((v) => v - 1)}>-</button>
      <p>{count}</p>
      <button onClick={() => setCount((v) => v + 1)}>+</button>
    </div>
  );
};

export default Counter;
