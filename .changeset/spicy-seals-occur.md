---
"microsite": minor
---

**Build performance improvements**

Rather than relying on [`@rollup/plugin-typescript`](https://github.com/rollup/plugins/tree/master/packages/typescript) (which uses `typescript` under the hood), we have switched to [`rollup-plugin-esbuild`](https://github.com/egoist/rollup-plugin-esbuild) to perform code transforms.

[`esbuild`](https://github.com/evanw/esbuild) is very very fast. Now, so is Microsite.
