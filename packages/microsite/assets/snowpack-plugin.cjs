const { resolve } = require('path');

const EXTS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

module.exports = function plugin() {
  return {
    name: '@microsite/snowpack',
    knownEntrypoints: ['microsite/client/hooks', 'microsite/client/csr', 'microsite/error', 'microsite/document', 'microsite/head'],
    async transform({ id, contents, isDev, fileExt }) {
      if (!EXTS.includes(fileExt)) return;

      let inject = [];
      if (/\bh\(/g.test(contents) && !/import\s*\{[\s\S]*?\bh\b[\s\S]*?\}/.test(contents)) inject.push('h');
      if (/\bFragment\b/g.test(contents) && !/import\s*\{[\s\S]*?\bFragment\b[\s\S]*?\}/.test(contents)) inject.push('Fragment');
      if (inject.length > 0) {
        contents = `import { ${inject.join(', ')} } from 'preact';\n` + contents;
      }

      if (!isDev) {
        // shim fetch for files that use it
        if (/\bfetch\(/g.test(contents)) return `import fetch from 'microsite/server/fetch';\n${contents}`;
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
