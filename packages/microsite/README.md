<br />
<br />

<div align="center">
    <img src="https://raw.githubusercontent.com/natemoo-re/microsite/master/.github/assets/microsite.svg?sanitize=true&v=1" alt="microsite" width="375" height="101" />
</div>

<h4 align="center">
    <a href="https://github.com/natemoo-re/microsite/tree/main/docs">Read the docs</a>
    <span> | </span>
    <a href="https://examples.microsite.page">See the live examples</a>
</h4>

<br />
<br />

`microsite` is a fast, opinionated static-site generator (SSG) built on top of [Snowpack](https://snowpack.dev). It outputs extremely minimal clientside code using [**automatic partial hydration**](https://github.com/natemoo-re/microsite/blob/main/docs/basic/bundled-javascript.md#automatic-partial-hydration).

```bash
npm init microsite <project>
```

> Microsite is output as ESM, so it needs to run in a Node environment which supports it (node@12.19.0).
>
> Ensure that your project includes `"type": "module"` in `package.json`, which will allow you to use ESM in your project's `node` scripts.

## Pages

Microsite uses the file-system to generate your static site, meaning each component in `src/pages` outputs a corresponding HTML file.

Page templates are `.js`, `.jsx`, or `.tsx` files which export a `default` a [Preact](https://preactjs.com/) component.

## Styles

Styles are written using CSS Modules. `src/global.css` is, as you guessed, a global CSS file injected on every page.
Per-page/per-component styles are also inject on the correct pages. They are modules and must be named `*.module.css`.

## Project structure

```
project/
├── public/             // copied to dist/
├── src/
│   ├── global/
│   │   └── index.css   // included in every generated page
│   │   └── index.ts    // shipped entirely to client, if present
│   ├── pages/          // fs-based routing like Next.js
│   │   └── index.tsx
└── tsconfig.json
```

## Acknowledgments

- [Markus Oberlehner](https://twitter.com/maoberlehner), [`vue-lazy-hydration`](https://github.com/maoberlehner/vue-lazy-hydration)
- [Markus Oberlehner](https://twitter.com/maoberlehner), [Building Partially Hydrated, Progressively Enhanced Static Websites with Isomorphic Preact and Eleventy](https://markus.oberlehner.net/blog/building-partially-hydrated-progressively-enhanced-static-websites-with-isomorphic-preact-and-eleventy/)
- [Lukas Bombach](https://twitter.com/luke_schmuke), [The case of partial hydration (with Next and Preact)](https://medium.com/@luke_schmuke/how-we-achieved-the-best-web-performance-with-partial-hydration-20fab9c808d5)
- [Jason Miller](https://twitter.com/_developit) and [Addy Osmani](https://twitter.com/addyosmani), [Rendering on the Web](https://developers.google.com/web/updates/2019/02/rendering-on-the-web)
- [Poimandres](https://github.com/pmndrs), [`valtio`](https://github.com/pmndrs/valtio) for inspiring `microsite/global`

## Contributing

This is a monorepo, set up with [Lerna](https://github.com/lerna/lerna), you should start by familiarizing yourself with its commands, as it's a little bit different from standard Node/NPM workflows. The most important thing to remember is that commands should generally be run from the monorepo root directory.

### Initial dev setup

1. Install [NVM](https://github.com/nvm-sh/nvm/) if you haven't already, to ensure you're using the Node/NPM version specified by the project.

2. Run NVM: `nvm use`.

3. Install dependencies for the monorepo: `npm install`.

4. Install and link dependencies in sub-packages: `npx lerna bootstrap`. <!-- Note for review: I actually have no idea which command is preferred here, each one I've tried has still produced changes to most or all `package-lock.json` files in the project. -->

