const { resolve } = require('path');

const EXTS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
const IMPORT_REGEX = /import(?:['"\s]*([\w*${}\s,]+)from\s*)?['"\s]['"\s](.*[@\w_-]+)['"\s].*/gm;

const scanImports = (contents) => {
  let result;
  let imports = [];
  while (result = IMPORT_REGEX.exec(contents)) {
    const [_, statement = null, specifier] = result;
    imports.push({ statement, specifier });
  }
  return imports;
}

/** Automatically inject `h` and `Fragment` */
const injectJSX = (contents) => {
  let toInject = [];
  let imports = scanImports(contents);
  const preactImports = imports.filter(i => i.specifier.indexOf('preact') > -1);
  const imported = {
    h: preactImports.length > 0 ? preactImports.some(({ statement }) => /\bh\b/.test(statement)) : false,
    Fragment: preactImports.length > 0 ? preactImports.some(({ statement }) => /\bFragment\b/.test(statement)) : false
  }
  if (/\bh\(/g.test(contents) && !imported.h) toInject.push('h');
  if (/\bFragment\b/g.test(contents) && !imported.Fragment) toInject.push('Fragment');
  if (toInject.length > 0) {
    contents = `import { ${toInject.join(', ')} } from 'preact';\n` + contents;
  }

  return contents;
}

module.exports = function plugin() {
  return {
    name: '@microsite/snowpack',
    knownEntrypoints: ['preact', 'preact-render-to-string', 'microsite/client/hooks', 'microsite/client/csr', 'microsite/error', 'microsite/document', 'microsite/head'],
    async transform({ id, contents, isDev, fileExt }) {
      if (!EXTS.includes(fileExt)) return;

      contents = injectJSX(contents);

      if (!isDev) {
        // shim fetch for files that use it
        if (/\bfetch\(/g.test(contents)) return `import fetch from 'microsite/server/fetch';\n${contents}`;
        return contents;
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

      return contents;
    },
    config(snowpackConfig) {
      snowpackConfig.devOptions.fallback = null;
      return snowpackConfig;
    },
  };
};
