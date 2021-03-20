---
"microsite": minor
---

Enabled the use of `snowpack.config.js` in ESM format to mirror Snowpack's new support.

Cleaned up some unused internal files and removed their dependencies.

Removed automatic PostCSS handling. If you have a PostCSS config file, it is your responsibility to create a `snowpack.config.js` file and install and configure `@snowpack/plugin-postcss`.
