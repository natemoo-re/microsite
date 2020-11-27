---
title: Data Fetching
description: How to fetch content in Microsite
---

Microsite exposes two functions to hook into **server-side rendering (SSR)** on a per-page basis. At build time, these hooks allow you to fetch dynamic data from the network or read local files.

- `getStaticProps`: Fetch data at build time
- `getStaticPaths`: Specify dynamic routes to pre-render based on data.

## `definePage`

Microsite exposes a `definePage` utility from `microsite/page` which can bundle all of these functions together with the Preact component which defines your page. This allows TypeScript to automatically infer the correct types because `definePage` is aware of your component's props. In addition to `getStaticPaths` and `getStaticProps`, you can optionally include the current filename as `path` to have TypeScript infer the `params` which `getStaticPaths` expects to be returned.

```tsx
import { definePage } from 'microsite/page';

const Component: FunctionalComponent<Props> = () => { /* ... */ }

export default definePage(Component, {
    path: '/blog/[slug]',
    async getStaticProps() {}
    async getStaticPaths() {}
})
```

## `getStaticProps`

If included, Microsite pre-renders this page at build time using the props returned by `getStaticProps`.

```tsx
export default definePage(Component, {
  async getStaticProps(context) {
    return {
      props: {}, // will be passed to the Component as props
    };
  },
});
```

The `context` parameter is an object containing the following keys:

- `params` contains the route parameters for pages using dynamic routes.
- `isPrefetch` is `true` if this is a prefetch request, which we'll explain later.
- `key` is a cache key returned from a prefetch request, which (again) we'll explain later.

`getStaticProps` should return an object with:

- `props` A **required** object with the props that will be received by the page component.

> `getStaticProps` is called only server-side. It is completely stripped from the client build. It's perfectly safe to make database calls or fetch content from a CMS.

## `getStaticPaths`

If a page has dynamic routes and uses `getStaticProps` it needs to define a list of paths that have to be rendered to HTML at build time.

```tsx
export default definePage(Component, {
    async getStaticProps(context) {
        paths: [
            { params: { ... } } // See the "paths" section below
        ],
    }
})
```

### The `paths` key (required)

The `paths` key determines which pages will be server-side rendered. For example, a page using dynamic routes such as `/posts/[id].tsx` would use `getStaticPaths` and return the following:

```tsx
return {
  paths: [{ params: { id: "1" } }, { params: { id: "2" } }],
};
```

From this, Microsite will generate `/posts/1` and `/posts/2` using the page component in `/posts/[id].tsx`.

## Prefetching

`getStaticProps` and `getStaticPaths` can be a bottleneck for builds if you're performing expensive network requests or file system reads. To alleviate this, both functions can optionally return the `prefetch` method to enable resource caching. These resources can be local, on your filesystem, or remote, on the network (CMS, GitHub, etc.)

```tsx
export default definePage(Component, {
  async getStaticProps(context) {
    if (context.prefetch) {
      // remote network resource
      return prefetch("https://.../posts");

      // local filesystem resource (directory, caches filenames inside directory)
      return prefetch("./src/posts");

      // local filesystem resource (file, caches content of file)
      return prefetch("./src/posts/post.md");
    }
  },
});
```
