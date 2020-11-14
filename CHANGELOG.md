# microsite

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
