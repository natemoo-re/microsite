/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  plugins: [
    '@snowpack/plugin-dotenv',
    '@prefresh/snowpack',
    'microsite/snowpack-plugin.cjs'
  ],
  installOptions: {
    installTypes: true,
  },
  devOptions: {
    hmr: true,
    port: 3333,
    open: 'none',
    output: 'stream'
  },
  buildOptions: {
    clean: true,
  }
};
