---
"microsite": minor
---

Implements a caching strategy for `getStaticProps` and `getStaticPaths`.

This change introduces two new `ctx` properties, `isPrefetch: boolean` and `key: string|null` for both functions, which can be used to conditionally return a `string` to act as a cache `key` for the function.

`getStaticPaths/Props` is often a build bottleneck due to network or filesystem reads, so this `key` can be used to opt out of slow/expensive work. [Read the docs](/docs/data-fetching) for examples.
