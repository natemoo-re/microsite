const builtins = require('module').builtinModules;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  plugins: [
    '@snowpack/plugin-dotenv',
    '@prefresh/snowpack',
    'microsite/assets/snowpack-plugin.cjs'
  ],
  installOptions: {
    installTypes: true,
    externalPackage: [...builtins, 'microsite']
  },
  devOptions: {
    hmr: true,
    port: 3333,
    open: 'none',
    output: 'stream'
  },
  buildOptions: {
    clean: true,
    out: '.microsite/staging',
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
};
