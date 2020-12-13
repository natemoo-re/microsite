<br />
<br />

<div align="center">
    <img src="https://raw.githubusercontent.com/natemoo-re/microsite/master/.github/assets/microsite.svg?sanitize=true&v=1" alt="microsite" width="375" height="101" />
</div>

<br />
<br />

`microsite` is a fast, opinionated static-site generator (SSG) built on top of [Snowpack](https://snowpack.dev). It outputs extremely minimal clientside code using **automatic partial hydration**.

```bash
npm init microsite <project>
```

[See the demo](https://microsite-demo.nmoo.vercel.app/)

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
