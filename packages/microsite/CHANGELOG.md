# microsite

## 0.7.4

### Patch Changes

- 5eb1b20: Fix issue where shared styles of non-hydrated components would not be included in the output

## 0.7.3

### Patch Changes

- 2535fe9: Fix bug where global script would have extra code injected

## 0.7.2

### Patch Changes

- c71d8da: Whoops, actually fix that bundling bug

## 0.7.1

### Patch Changes

- bf8cfa0: Fix bundling bug

## 0.7.0

### Minor Changes

- 65bf0bd: Implements a caching strategy for `getStaticProps` and `getStaticPaths`, which can often become a build bottleneck due to network or filesystem reads.

  This change introduces a new `prefetch` method for both of these functions. [Read the docs](/docs/data-fetching) for more details.

### Patch Changes

- 4475a3c: Update prefetch logic to accomodate changing headers
- f3b313b: Update to esbuild@0.8.x

## 0.7.0-next.2

### Patch Changes

- 4475a3c: Update prefetch logic to accomodate changing headers

## 0.7.0-next.1

### Patch Changes

- f3b313b: Update to esbuild@0.8.x

## 0.7.0-next.0

### Minor Changes

- 65bf0bd: Implements a caching strategy for `getStaticProps` and `getStaticPaths`, which can often become a build bottleneck due to network or filesystem reads.

  This change introduces a new `prefetch` method for both of these functions. [Read the docs](/docs/data-fetching) for more details.

## 0.6.14

### Patch Changes

- e18c71c: Fix Linux shebang issue (#40) by removing need for --experimental-module-resolution=node. Uses .js import specifiers everywhere

## 0.6.13

### Patch Changes

- 86bdb17: Fix bug where &lt;pre> code was improperly indented

## 0.6.12

### Patch Changes

- 9d22932: Update to typescript@4.1.2
- 217299b: Update Document viewport meta tag, html lang and dir

## 0.6.12-next.0

### Patch Changes

- 9d22932: Update to typescript@4.1.2
- 217299b: Update Document viewport meta tag, html lang and dir

## 0.6.11

### Minor Changes

- fd4c454: Add [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) to `fetch` via [`make-fetch-happen`](https://github.com/zkat/make-fetch-happen/). Thanks [@zkat](https://github.com/zkat)!

## 0.6.10

### Patch Changes

- 8a7374f: Add preload hints for hydrated pages
- 6d0f3a3: Microsite's partial hydration method manages each component as a seperate Preact tree, meaning standard `Context` won't work across components.

  This update adds a `microsite/global` entry point which exposes two utilities for sharing state across component trees.

  **`createGlobalState`** creates a [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which acts as a mutable data source. Mutating this object notifies any consuming components that they should rerender.

  > If you're a fan of Vue, this is very similar to `reactive` from the Composition API.

  Components can consume this global state object via **`useGlobalState(state)`**.

  ```tsx
  // utils/state.tsx
  import { createGlobalState } from "microsite/global";

  export const state = createGlobalState({
    count: 0
  });

  // components/Counter.tsx
  import { withHydrate } from "microsite/hydrate";
  import { useGlobalState } from "microsite/global";
  import { state } from "@/utils/state";

  const Counter = () => {
    const localState = useGlobalState(state);
    // `localState` is a readonly snapshot of global `state`
    // Updates can be written to global `state` by direct mutation

    return (
      <>
        <button onClick={() => state.count--}>-</button>
        <span>{localState.count}</span>
        <button onClick={() => state.count++}>+</button>
      </>
    );
  };

  export default withHydrate(Counter);
  ```

- 6d0f3a3: Fix issue with CSS scoped name generation

## 0.6.9

### Patch Changes

- 788860d: Add --no-clean flag to persist intermediate build (useful for debugging)
- 64add28: Fixes issue with named hydration chunks
- 10f9fd5: Improve caching by using external styles rather than inlined styles
- 0641e72: Update microsite bin to use correct arguments

## 0.6.9-next.0

### Patch Changes

- Add --no-clean flag to persist intermediate build (useful for debugging)

## 0.6.6

### Patch Changes

- 7e955a0: Ensure children is not required for Head component

## 0.6.5

### Patch Changes

- f65c7f4: Improve types by adding global `h` and `Fragment`, and ambient `*.modules.css` declarations

## 0.6.4

### Patch Changes

- e53864f: Update default `tsconfig` to be named `base`.

  Update `tsconfig.baseUrl` to resolve from inside `node_modules`

## 0.6.3

### Patch Changes

- a760228: Automatically inject h and Fragment
- 580bb4f: expose default tsconfig.json for end-users

## 0.6.2

### Patch Changes

- 60de6a2: Fix esbuild jsxFactory

## 0.6.1

### Patch Changes

- a3a5131: Fix external warning
- 5c79ec3: update README

## 0.6.0

### Breaking Changes

- 9d0e9cc: Drop `@types/react` and switch to `preact`. See issue [#5](https://github.com/natemoo-re/microsite/issues/5) for more background.

## 0.0.0-canary-2020101419274

### Breaking Changes

- 7fd4679: Drop `@types/react` and switch to `preact`. See issue [#5](https://github.com/natemoo-re/microsite/issues/5) for more background.

## 0.5.1

### Patch Changes

- 3d99331: Fix handling of node builtins for intermediate builds
- 3d99331: Remove .microsite/cache dir for now

## 0.5.1-next.0

### Patch Changes

- a29b71e: Fix handling of node builtins for intermediate builds
- 078b910: Remove .microsite/cache dir for now

## 0.5.0

### Minor Changes

- 47eec22: **Build performance improvements**

  Rather than relying on [`@rollup/plugin-typescript`](https://github.com/rollup/plugins/tree/master/packages/typescript) (which uses `typescript` under the hood), we have switched to [`rollup-plugin-esbuild`](https://github.com/egoist/rollup-plugin-esbuild) to perform code transforms.

  [`esbuild`](https://github.com/evanw/esbuild) is very very fast. Now, so is Microsite.

### Patch Changes

- 275f297: Gracefully handle Component/export name mismatch

  Automatically handle `tsconfig.paths` aliases

- 945685d: **SEO**

  Microsite aims to make SEO as simple as possible, so this featureset adds built-in SEO utility components to `microsite/head` under the `seo` namespace.

  The benefit of using `seo` components over manual `meta` tag configuration is API simplicity, since `seo` automatically configures duplicate [Open Graph](https://ogp.me/)/social meta tags for you.

  If something here doesn't cover your use case, please feel free to [open an issue](https://github.com/natemoo-re/microsite/issues/new).

  ```tsx
  import { Head, seo } from "microsite/head";

  <Head>
    <seo.title>Easy SEO</seo.title>
    <seo.description>Hello world!</seo.description>
    <seo.image
      src="https://og-image.now.sh/**Hello**%20World.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg"
      width={100}
      height={100}
    />
    <seo.twitter handle="@n_moore" />
  </Head>;
  ```

  #### seo.robots

  By default, `<Head>` now automatically adds the following tags.

  ```html
  <meta name="robots" content="index,follow" />
  <meta name="googlebot" content="index,follow" />
  ```

  This behavior can be controlled with the `<seo.robots>` helper, which accepts `noindex` and `nofollow` booleans.

  ```tsx
  <seo.robots noindex nofollow />
  ```

  #### seo.title

  `<seo.title>` has the same API as a regular `<title>` tag—it accepts a `string` child. `<seo.title>` sets the page `<title>` as well as `<meta property="og:title">`.

  #### seo.description

  `<seo.description>` accepts a `string` child. `<seo.description>` sets `<meta name="description">` as well as `<meta property="og:description">`.

  #### seo.canonical

  `<seo.canonical>` accepts a `string` child representing the canonical URL of the current page. It generates `<link rel="canonical">` and `<meta property="og:url">`.

  #### seo.image

  `<seo.image>` exposes an API similar to the native `<img>`, accepting `src`, `alt`, `width`, and `height` props. It generates all the meta tags necessary for valid Open Graph images.

  #### seo.video

  `<seo.video>` exposes an API similar to the native `<video>`, accepting `src`, `width`, and `height` props. It generates all the meta tags necessary for valid Open Graph videos.

  #### seo.audio

  `<seo.audio>` exposes an API similar to the native `<audio>`, accepting only a `src` prop. It generates all the meta tags necessary for valid Open Graph audio.

  #### seo.twitter

  `<seo.twitter>` controls [Twitter meta tags](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup). It accepts `card`, `handle` (maps to `twitter:creator`), and `site`.

  #### seo.facebook

  `<seo.facebook>` accepts an `appId` in order to set `<meta property="fb:app_id">`.

  #### seo.openGraph

  `<seo.openGraph>` provides low-level control over [Open Graph meta tags](https://ogp.me/). The accepted props vary based on `type`, so you might want to dig [into the code](https://github.com/natemoo-re/microsite/blob/8c0599f8c05da3214534b864c536a2614a89fb7f/src/head.tsx#L14) for this one.

- 17e3130: Fix issue when building projects without optional global/hydrated files
- da6e0f3: Improve build performance (parallelization)
- eaec00b: Fixes issue with static path generation for the `/` route

## 0.5.0-alpha.0

### Minor Changes

- 47eec22: **Build performance improvements**

  Rather than relying on [`@rollup/plugin-typescript`](https://github.com/rollup/plugins/tree/master/packages/typescript) (which uses `typescript` under the hood), we have switched to [`rollup-plugin-esbuild`](https://github.com/egoist/rollup-plugin-esbuild) to perform code transforms.

  [`esbuild`](https://github.com/evanw/esbuild) is very very fast. Now, so is Microsite.

### Patch Changes

- 945685d: **SEO**

  Microsite aims to make SEO as simple as possible, so this featureset adds built-in SEO utility components to `microsite/head` under the `seo` namespace.

  The benefit of using `seo` components over manual `meta` tag configuration is API simplicity, since `seo` automatically configures duplicate [Open Graph](https://ogp.me/)/social meta tags for you.

  If something here doesn't cover your use case, please feel free to [open an issue](https://github.com/natemoo-re/microsite/issues/new).

  ```tsx
  import { Head, seo } from "microsite/head";

  <Head>
    <seo.title>Easy SEO</seo.title>
    <seo.description>Hello world!</seo.description>
    <seo.image
      src="https://og-image.now.sh/**Hello**%20World.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg"
      width={100}
      height={100}
    />
    <seo.twitter handle="@n_moore" />
  </Head>;
  ```

  #### seo.robots

  By default, `<Head>` now automatically adds the following tags.

  ```html
  <meta name="robots" content="index,follow" />
  <meta name="googlebot" content="index,follow" />
  ```

  This behavior can be controlled with the `<seo.robots>` helper, which accepts `noindex` and `nofollow` booleans.

  ```tsx
  <seo.robots noindex nofollow />
  ```

  #### seo.title

  `<seo.title>` has the same API as a regular `<title>` tag—it accepts a `string` child. `<seo.title>` sets the page `<title>` as well as `<meta property="og:title">`.

  #### seo.description

  `<seo.description>` accepts a `string` child. `<seo.description>` sets `<meta name="description">` as well as `<meta property="og:description">`.

  #### seo.canonical

  `<seo.canonical>` accepts a `string` child representing the canonical URL of the current page. It generates `<link rel="canonical">` and `<meta property="og:url">`.

  #### seo.image

  `<seo.image>` exposes an API similar to the native `<img>`, accepting `src`, `alt`, `width`, and `height` props. It generates all the meta tags necessary for valid Open Graph images.

  #### seo.video

  `<seo.video>` exposes an API similar to the native `<video>`, accepting `src`, `width`, and `height` props. It generates all the meta tags necessary for valid Open Graph videos.

  #### seo.audio

  `<seo.audio>` exposes an API similar to the native `<audio>`, accepting only a `src` prop. It generates all the meta tags necessary for valid Open Graph audio.

  #### seo.twitter

  `<seo.twitter>` controls [Twitter meta tags](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup). It accepts `card`, `handle` (maps to `twitter:creator`), and `site`.

  #### seo.facebook

  `<seo.facebook>` accepts an `appId` in order to set `<meta property="fb:app_id">`.

  #### seo.openGraph

  `<seo.openGraph>` provides low-level control over [Open Graph meta tags](https://ogp.me/). The accepted props vary based on `type`, so you might want to dig [into the code](https://github.com/natemoo-re/microsite/blob/8c0599f8c05da3214534b864c536a2614a89fb7f/src/head.tsx#L14) for this one.
