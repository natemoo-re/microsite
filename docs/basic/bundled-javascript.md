# Bundled JavaScript

Microsite enforces performance best practices by not emitting any JavaScript by default&mdash;every byte of JavaScript is an explicit opt-in choice left to the developer.

JavaScript is, of course, essential for spec-compliant accessibility and other expected features. This is where Microsite's **Automatic Partial Hydration (APH)** comes into play.

## Automatic Partial Hydration

Current JavaScript-based SSG solutions send the entire component tree down to the client for hydration, even if the content is entirely static. 

> Preact components offer the right primitive for defining the layout and structure of your site. The only components that should be sent to the client are ones that truly interactive.

Microsite requires a hint from the author, the `withHydrate` HOC, to implement APH and ship highly optimized modules to the client.

**Example** Consider a simple counter component which uses `preact/hooks` and attaches `onClick` handlers to rendered `button` elements.

```tsx
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
```

With this code, Microsite can determine that this component should be included in the final JavaScript bundle. Given a number of hydrated components, Microsite will also automatically implement route-based code-splitting and intelligent lazy loading. 

> Importantly, hydrated components are not executed until the browser is idle, the component is visible, or a user is about to interact with it. See `withHydrate.method` options below.

### Caveats

There are a few things to keep in mind when leveraging APH:

- Hydrated components cannot contain any other hydrated component, as hydration is controlled by the top-level component.

- Hydrated components should be placed as deep as possible in your app's tree for the most efficient bundles.

- Hydrated components can't accept _rich_ (component) `children` as a prop because it's non-trivial to serialize them. Strings and numbers _are_ accepted in the `children` prop.


### `withHydrate` Options

**method**

As a developer, you know exactly how your site is structured, so Microsite allows you to tweak how hydration occurs to optimize your specific use case.

- `idle` (default) hydrates the component as soon as possible, when the browser executes [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) code.

- `visible` hydrates the component as soon as it enters the viewport, via [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver).
