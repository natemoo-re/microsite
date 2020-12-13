## Automatic Partial Hydration (APH)

The most exciting feature of Microsite is automatic partial hydration. Even if you're leveraging lazy-loading, most current hydration solutions send the entire component tree (which has likely already been rendered server-side) to the client for hydration.

Microsite, on the other hand, uses a hint from the author (the `withHydrate` HOC) to strip away any unnecessary code and ship highly optimized code to the client.

```tsx
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
```

There are a few rules to keep in mind when leveraging APH:

- Hydrated components cannot contain any other hydrated component, as hydration is controlled by the top-level component.

- Hydrated components should be placed as deep as possible in your app's tree for the most efficient bundles.

- Hydrated components can't accept _rich_ children, because it's non-trivial to serialize them, though I have some ideas to address this. For now, strings and numbers as children are fine.

#### `withHydrate` Options

**method**

As a developer, you know exactly how your site is structured, so Microsite allows you to tweak how hydration occurs, optimizing for your specific use cases.

- `idle` (default) hydrates the component as soon as possible, when the browser executes [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) code.

- `visible` hydrates the component as soon as it enters the viewport, via [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver).

- `interaction` hydrates the component as soon as the user interacts with it (via `focus` or `pointerenter` events.)
