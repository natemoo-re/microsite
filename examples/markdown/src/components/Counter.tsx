import { useState } from "preact/hooks";
import { withHydrate } from "microsite/hydrate";

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount((v) => v - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount((v) => v + 1)}>+</button>
    </>
  );
};

export default withHydrate(Counter, { method: "idle" });
