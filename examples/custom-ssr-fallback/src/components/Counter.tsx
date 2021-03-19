import { useState } from "preact/hooks";
import { withHydrate } from "microsite/hydrate";

const DummyCounter = () => (
  <div>
      <button disabled>-</button>
      <h4><span style={{ background: '#eee', color: 'transparent', userSelect: 'none'}}>0</span></h4>
      <button disabled>+</button>
  </div>
)

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((v) => v - 1)}>-</button>
      <h4><span>{count}</span></h4>
      <button onClick={() => setCount((v) => v + 1)}>+</button>
    </div>
  );
};

export default withHydrate(Counter, { method: "idle", fallback: <DummyCounter/> });
