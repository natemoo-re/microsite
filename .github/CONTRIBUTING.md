# Contributing to Microsite

This codebase is a monorepo, set up with [Lerna](https://github.com/lerna/lerna). You should start by familiarizing yourself with `lerna`, as it operates a little bit differently than the standard Node/NPM workflow. 

> Note: Commands should generally be run from the root directory of the monorepo rather than a subdirectory like `packages/microsite`.

## Initial dev setup

1. Install [Volta](https://volta.sh/) if you haven't already. It's our favorite tools for managing Node/NPM versions, and automatically picks up the correct Node version for this project.

2. Install dependencies for the monorepo: `npm install`.

3. Install and link dependencies in sub-packages: `npx lerna bootstrap`

## Adding features/fixing bugs
Please open an issue describing your feature/bug before opening a PR.

Please ensure that your PR is covered by a test, if applicable. Microsite currently has very fews tests but this is something we hope to prioritize.

## Testing

Our tests are written in TypeScript with [`uvu`](https://github.com/lukeed/uvu). They are run with the `uvu` CLI and [`@swc-node/register`](https://github.com/Brooooooklyn/swc-node/tree/master/packages/register).

> Note: as of `@swc-node/register@1.0.3`, `jsxFactory` and `jsxFragmentFactory` are not respected. This means any Preact components need to include the following comment at the top of the file:
> `/* @jsx h */`
> This should be fixed in the next version of `@swc-node/register`.

```bash
npm run test

# Or watch mode (requires a file change to run the first time)
npm run test:watch
```

**VSCode:** There are launch actions included for both single-run and watch mode.
