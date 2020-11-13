# Microsite

`microsite` is a fast opinionated static-site generator (SSG) that outputs extremely minimal clientside code using **automatic partial hydration**.

[See the demo](https://microsite-demo.nmoo.vercel.app/)

> Microsite is output as ESM, so it needs to run in a Node environment which supports it (like node@12)
> You can add a script such as this to your project:
> `node --experimental-modules --experimental-specifier-resolution=node node_modules/.bin/microsite build`

## Automatic Partial Hydration (APH)

The most exciting feature of Microsite is automatic partial hydration. Current solutions send the entire component tree, which has already been rendered server-side, to the client for hydration.
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

## Pages

Microsite uses the file-system to generate your output, meaning each component in `src/pages` outputs a corresponding HTML file.

Page templates are written as `.tsx` files with React (although [Preact](https://preactjs.com/) is used on the client.)

## Styles

Styles are written using CSS Modules. `src/global.css` is, as you guessed, a global CSS file injected on every page.
Per-page/per-component styles are also inject on the correct pages. They are modules and must be named `*.module.css`.

## Project structure

Microsite cares about the structure of your project. It should look like this:

```
project/
├── src/
│   ├── global.css
│   ├── global.ts       // shipped entirely to client, if present
│   ├── pages/          // fs-based routing like Next.js
│   │   └── index.tsx
│   └── public/         // copied to dist/
└── tsconfig.json
```

## Acknowledgments

- [Markus Oberlehner](https://twitter.com/maoberlehner), [`vue-lazy-hydration`](https://github.com/maoberlehner/vue-lazy-hydration)
- [Markus Oberlehner](https://twitter.com/maoberlehner), [Building Partially Hydrated, Progressively Enhanced Static Websites with Isomorphic Preact and Eleventy](https://markus.oberlehner.net/blog/building-partially-hydrated-progressively-enhanced-static-websites-with-isomorphic-preact-and-eleventy/)
- [Lukas Bombach](https://twitter.com/luke_schmuke), [The case of partial hydration (with Next and Preact)](https://medium.com/@luke_schmuke/how-we-achieved-the-best-web-performance-with-partial-hydration-20fab9c808d5)
- [Jason Miller](https://twitter.com/_developit) and [Addy Osmani](https://twitter.com/addyosmani), [Rendering on the Web](https://developers.google.com/web/updates/2019/02/rendering-on-the-web)
