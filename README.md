# Microsite

`microsite` is a tiny, opinionated static-site generator. 

**At the moment, this is an experiment more than a production-ready tool.**

## The opinionated stack

Microsite uses `rollup` to bundle your code. Templates are written in `typescript` with `preact`, but the only JS shipped to the client is what you include in `src/global.ts`. It is automatically optimized for modern browsers following the `module/nomodule` pattern.

CSS is automatically bundled using PostCSS and CSS Modules. Pages can import styles from `name.module.css`, whereas global styles live in `src/global.css`. 
