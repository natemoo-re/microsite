import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { withHydrate } from "microsite/hydrate";

const Counter: FunctionComponent<{ initialCount?: number }> = ({
  initialCount = 0,
}) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <button onClick={() => setCount((v) => v - 1)}>-</button>
      <p>{count}</p>
      <button onClick={() => setCount((v) => v + 1)}>+</button>
    </div>
  );
};

export default withHydrate(Counter);
