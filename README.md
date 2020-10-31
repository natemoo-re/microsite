# Microsite

`microsite` is a tiny, opinionated static-site generator that outputs extremely minimal clientside code using partial hydration.

**At the moment, this is an experiment more than a production-ready tool.**

> Microsite is output as ESM, so it needs to run in a Node environment which supports it (like node@12)
> You can add a script such as this to your project:
> `node --experimental-modules --experimental-specifier-resolution=node node_modules/.bin/microsite build`

## Pages

Microsite uses the file-system to generate your output, meaning each component in `src/pages` outputs a corresponding HTML file.

Page templates are written as `.tsx` files with React.

## Styles

Styles are written using CSS Modules. `src/global.css` is, as you guessed, a global CSS file injected on every page.
Per-page/per-component styles are also inject on the correct pages. They are modules and must be named `*.module.css`.

## Partial hydration

Rather than shipping your entire site back down to the client in a JS bundle, Microsite makes use of **Partial Hydration** to only ship component which need to by hydrated.
In order to levearge this, all you need to do is wrap a component with the `withHydrate` HOC from `microsite/hydrate`.

There are a few rules that hydrated components rely on: - They can't accept _rich children_, because it's non-trivial to serialize them. Strings and numbers are fine. - They cannot contain other hydrated components, due to the way partial hydration works. - They should be placed as deep as possible in the tree for maximum efficiency.

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
