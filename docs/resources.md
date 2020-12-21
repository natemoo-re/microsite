# Resources

#### [Rendering on the Web](https://developers.google.com/web/updates/2019/02/rendering-on-the-web)
by [Jason Miller](https://twitter.com/_developit) and [Addy Osmani](https://twitter.com/addyosmani)

A comprehensive overview of Client-Side Rendering (CSR), Server-Side Rendering (SSR), and (re)hydration. 

> **Note** The section on [Combining server rendering and CSR via rehydration](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#rehydration) outlines a number of problems with hydration, namely delayed interactivity due to large JS bundle sizes. This is the problem that Microsite's Automatic Partial Hydration (APH) has specifically been designed to address. The section on [Partial Hydration](https://developers.google.com/web/updates/2019/02/rendering-on-the-web#partial-rehydration) suggests that static JavaScript components are "transformed into inert references" so their client-side footprint is reduced to "near-zero". With APH, static JavaScript is completely stripped from your client-side bundle, so its footprint is truly reduced to zero.
