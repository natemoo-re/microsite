const { resolve } = require('path');

const EXTS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

module.exports = function plugin() {
  return {
    name: '@microsite/snowpack',
    knownEntrypoints: ['microsite/runtime/hooks', 'microsite/runtime/csr', 'microsite/error', 'microsite/document', 'microsite/head'],
    async transform({ id, contents, isDev, fileExt }) {
      if (!EXTS.includes(fileExt)) return;

      if (!isDev) {
        // shim fetch for files that use it
        if (/\bfetch\(/g.test(contents)) return `import fetch from 'microsite/utils/fetch';\n${contents}`;
        return;
      }

      if (id.endsWith('global/index.js')) {
        return `${contents}\nif (import.meta.hot) import.meta.hot.decline();`
      }

      if (id.indexOf('src/pages') > -1) {
        return `${contents}
const hash = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)
export let $hashes = {};

if (import.meta.hot) {
  let $prev = $hashes;

  import(\`$\{import.meta.hot.id}\`).then(module => {
    $hashes = {
      getStaticProps: module.default.getStaticProps ? hash(\`$\{module.default.getStaticProps}\`) : undefined,
      getStaticPaths: module.default.getStaticPaths ? hash(\`$\{module.default.getStaticPaths}\`) : undefined
    }

    import.meta.hot.dispose(() => {
      import.meta.hot.data = { $hashes };
    })
  });

  import.meta.hot.accept(({ module }) => {
    $prev = import.meta.hot.data.$hashes || module.$hashes;
    $hashes = {
      getStaticProps: module.default.getStaticProps ? hash(\`$\{module.default.getStaticProps}\`) : undefined,
      getStaticPaths: module.default.getStaticPaths ? hash(\`$\{module.default.getStaticPaths}\`) : undefined
    }
    
    if ($prev && $hashes) {
      if ($prev.getStaticProps !== $hashes.getStaticProps) {
        import.meta.hot.invalidate();
      }
      if ($prev.getStaticPaths !== $hashes.getStaticPaths) {
        import.meta.hot.invalidate();
      }
    }
  });
}
        `;
      }
      
      // TODO: disable runtime hooks
      // if (contents.indexOf('hydrate')) {
        
      // }
    },
    config(snowpackConfig) {
      snowpackConfig.mount = {
        [resolve('public')]: { url: '/', static: true, resolve: false },
        [resolve('src')]: { url: '/src', static: false, resolve: true }
      };
      snowpackConfig.devOptions.fallback = null;
      return snowpackConfig;
    },
  };
};
