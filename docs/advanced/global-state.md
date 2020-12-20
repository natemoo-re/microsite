---
title: Global State
description: Sharing state across components with Microsite
---

Microsite's partial hydration method manages each component as a seperate Preact tree, meaning standard `Context` doesn't work across components. By using `microsite/global`, state can be easily shared across component trees.

**`createGlobalState`** creates a [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which acts as a mutable data source. Mutating this object notifies any consuming components that they should rerender.

> If you're a fan of Vue, this is very similar to `reactive` from the Composition API.

Components can consume this global state object via **`useGlobalState(state)`**.

```tsx
// utils/state.tsx
import { createGlobalState } from "microsite/global";

export const state = createGlobalState({
  count: 0,
});

// components/Counter.tsx
import { withHydrate } from "microsite/hydrate";
import { useGlobalState } from "microsite/global";
import { state } from "@/utils/state";

const Counter = () => {
  const localState = useGlobalState(state);
  // `localState` is a readonly snapshot of global `state`
  // Updates can be written to global `state` by direct mutation

  return (
    <>
      <button onClick={() => state.count--}>-</button>
      <span>{localState.count}</span>
      <button onClick={() => state.count++}>+</button>
    </>
  );
};

export default withHydrate(Counter);
```
