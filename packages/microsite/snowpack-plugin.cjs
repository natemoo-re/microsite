const { resolve, basename, extname } = require('path');
const glob = require('glob');
const fs = require('fs');

const EXTS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
// const emitted = new Set();
// const emitPage = (page, { buildDir }) => {
//   // if (emitted.has(page)) return;
//   fs.writeFileSync(`${buildDir}/__microsite__/output/${page}.html`, `<!doctype html>
// <html>
//   <!-- Generated by microsite -->
//   <head>
//   </head>
//   <body>
//     <div id="__microsite"></div>
//     <script type="module" src="./${page}.js"></script>
//   </body>
// </html>`)
//   fs.writeFileSync(`${buildDir}/__microsite__/output/${page}.js`, `import 'preact/debug';
// import { options, h, render } from "preact";
// import Page from '/__microsite__/pages/${page}.js';
      
// const noop = () => Promise.resolve();
// let Component = Page;
// let getStaticProps = noop;
// let getStaticPaths = noop;

// let props = {};
// let paths = {};
// if (Page.Component) {
//   Component = Page.Component;
//   getStaticProps = Page.getStaticProps || noop;
//   getStaticPaths = Page.getStaticPaths || noop;
// }

// (async function init() {
//   props = await getStaticProps();

//   render(h(Component, props ? props.props : {}, null), document.getElementById('__microsite'));
// })();`)
//   emitted.add(page);
// }

module.exports = function plugin(snowpackConfig) {
  //  const pages = glob.sync('src/pages/**/*').map(page => page.split('src/pages/')[1]).map(page => basename(page, extname(page)));
  const base = snowpackConfig.buildOptions.out;

  //   fs.rmSync(`${base}/__microsite__/output/`, { force: true, recursive: true });
  //   fs.mkdirSync(`${base}/__microsite__/output/`, { recursive: true });
  //   pages.forEach(page => emitPage(page, { buildDir: base }));
  //   fs.writeFileSync(`${base}/__microsite__/output/404.html`, `<!doctype html>
  // <html>
  //   <head>
  //   </head>
  //   <body>
  //     <div id="__microsite">
  //       <h1>404 | Not found</h1>
  //     </div>
  //   </body>
  // </html>`)

  return {
    name: '@microsite/snowpack',
    knownEntrypoints: ['microsite/runtime/hooks', 'microsite/runtime/csr', 'microsite/document', 'microsite/head'],
    // TODO
    // async optimize({ buildDirectory }) {
    //   const buildOptions = snowpackConfig.buildOptions || {};
    //   const files = glob.sync(buildDirectory + '**/**');
    // },
    async transform({ id, contents, isDev, fileExt }) {
      if (!isDev || !EXTS.includes(fileExt)) return;
      if (id.endsWith('global.js')) {
        return `${contents}\nif (import.meta.hot) import.meta.hot.decline();`
      }
      if (id.indexOf('src/pages') > -1) {
        // const page = id.split('src/pages/')[1].replace(fileExt, '');
        // emitPage(page, { buildDir: base });
        // this.markChanged(`/__microsite__/output/${page}.html`);
        // this.markChanged(`/__microsite__/output/${page}.js`);

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
      
      // TODO
      // if (contents.indexOf('hydrate')) {
        
      // }
    },
    config(snowpackConfig) {
      snowpackConfig.mount = {
        [resolve('src/public')]: { url: '/', static: true, resolve: false },
        [resolve('src')]: { url: '/src', static: false, resolve: true }
      };
      // snowpackConfig.alias = Object.assign({}, snowpackConfig.alias, {
      //   'preact/hooks': 'microsite/runtime/hooks.js'
      // })
      snowpackConfig.devOptions.fallback = null;
      return snowpackConfig;
    },
  };
};
