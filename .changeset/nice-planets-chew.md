---
"microsite": major
---

Microsite has been completely rewritten to focus on what it does best—optimize your static site for partial hydration.

Rather than implementing a highly-opinionated, custom build pipeline, Microsite@1.0.0 leverages the power of [Snowpack](https://www.snowpack.dev/)'s upcoming 3.0.0 release. This means that there are a number of new features, notably:

- Pages can now be written in your preferred file format—TypeScript or plain old JavaScript.
- If your file/asset types are [supported in Snowpack](https://www.snowpack.dev/reference/supported-files), they are supported by Microsite. This is because Microsite has delegated the initial compilation of your site completely to Snowpack!
- `microsite dev` spins up a Snowpack development server with best-in-class DX, including built-in HMR with [Prefresh](https://github.com/JoviDeCroock/prefresh/tree/main).
- `microsite build --serve` performs a build and serves the result on a local server, for testing production builds.

There are a small number of breaking changes in the release:

- Microsite now relies on explicit [subpath exports](https://nodejs.org/api/packages.html#packages_subpath_exports), meaning only public files can be accessed from Node.
- Global asset entry points have been moved from `src/global.ts` and `src/global.css` to `src/global/index.ts` and `src/global/index.css`.
- Global scripts are no longer executed as a side-effect. Global scripts must contain a single `export default async () => {}`, which is executed on page load.
