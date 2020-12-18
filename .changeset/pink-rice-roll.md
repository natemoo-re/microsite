---
"microsite": patch
---

Automatic JSX injection is fixed (I really mean it this time.)

Added automatic aliasing for `tsconfig` `paths`.

Fixed a bug where `microsite/global` was not included in the vendor bundle.

Fixed a bug where `shared` components would not be concatenated into a single chunk.

Added minification for the `init` hydration script.
