import * as React from "react";

const Counter: React.FC<{ initialCount?: number }> = ({ initialCount = 0 }) => {
  const [count, setCount] = React.useState(initialCount);

  return (
    <div>
      <button onClick={() => setCount((v) => v - 1)}>-</button>
      <p>{count}</p>
      <button onClick={() => setCount((v) => v + 1)}>+</button>
    </div>
  );
};

export default Counter;
