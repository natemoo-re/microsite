---
"microsite": minor
---

Implements fragment-based hydration. This is a **breaking change**&mdash;the previous behavior was to wrap any hydrated components in a `div` with `display: contents` but this new behavior has the benefit of not modifying the document flow at all.

**Breaking change**: The `interaction` hydration strategy has been removed. In practice it tended to actually _cause_ interaction delays because hydration work would occur in an input-blocking fashion. Use `idle` or `visible`.
