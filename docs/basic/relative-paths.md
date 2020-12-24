# Relative Paths
By default, Microsite builds your project assuming it will be hosted at the server root (`/`).

To override this behavior, you may either:

- Specify a `homepage` option in your `package.json`
    ```json
    "homepage": "/subdir"
    ```
- Pass `--base-path="/subdir"` to `microsite build` or `microsite serve`.

Microsite's philosophically makes every attempt to rely on built-in browser behavior. In this case, it leverages the [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) element.

In order to properly resolve your internal links, be sure that you use **relative** `href` attributes. 

```html
<!-- ❌ Do NOT use an absolute `href` -->
<a href="/page">Page</a>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- ✅ DO use a relative `href` -->
<a href="./page">Page</a>
<link rel="icon" type="image/svg+xml" href="./favicon.svg" />
```
