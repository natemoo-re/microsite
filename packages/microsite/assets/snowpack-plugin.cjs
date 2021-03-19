const EXTS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

module.exports = function plugin() {
  return {
    name: '@microsite/snowpack',
    knownEntrypoints: ['preact', 'preact-render-to-string', 'microsite/client/hooks', 'microsite/client/csr', 'microsite/error', 'microsite/document', 'microsite/head'],
    async transform({ id, contents, isDev, isPackage, fileExt }) {
      if (isPackage) return;
      if (!EXTS.includes(fileExt)) return;

      if (!isDev) {
        // shim fetch for files that use it
        if (/\bfetch\(/g.test(contents)) return `import fetch from 'microsite/server/fetch';\n${contents}`;
        return contents;
      }

      if (id.endsWith('global/index.js')) {
        return `${contents}\nif (import.meta.hot) import.meta.hot.decline();`
      }

      return contents;
    },
    config(snowpackConfig) {
      snowpackConfig.devOptions.fallback = null;
      return snowpackConfig;
    },
  };
};
