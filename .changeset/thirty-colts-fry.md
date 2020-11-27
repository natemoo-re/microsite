---
"microsite": minor
---

Implements a caching strategy for `getStaticProps` and `getStaticPaths`, which can often become a build bottleneck due to network or filesystem reads.

This change introduces a new `prefetch` method for both of these functions. [Read the docs](/docs/data-fetching) for more details.
