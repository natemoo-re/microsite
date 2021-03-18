const { resolve } = require('path');
const builtins = require('module').builtinModules;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  plugins: [
    '@snowpack/plugin-dotenv',
    '@prefresh/snowpack',
    'microsite/assets/snowpack-plugin.cjs'
  ],
  packageOptions: {
    source: 'local',
    polyfillNode: true,
    external: [
      ...builtins,
      "@micrositejs/markdown",
      "microsite/server/fetch",
      "microsite/document",
      "microsite/error",
      "microsite/head",
      "microsite/hydrate",
      "microsite/page"
    ]
  },
  devOptions: {
    hmr: true,
    port: 3333,
    open: 'none',
    output: 'stream',
  },
  buildOptions: {
    clean: true,
    out: '.microsite/staging',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: 'import { h, Fragment } from "preact";',
    sourceMaps: false
  },
  mount: {
    [resolve('public')]: { url: '/', static: true, resolve: false },
    [resolve('src')]: { url: '/src', static: false, resolve: true }
  }
};
