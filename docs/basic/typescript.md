# Typescript

Microsite is written in TypeScript and even reccomends using TypeScript for all projects! All type declarations are included out-of-the-box.

## tsconfig.json

In order to provide the best editing experience, Microsite ships its own `tsconfig.json` for you to extend.

Your `tsconfig.json` file can be as simple as the one below. In most cases this should be all you need.

```json
{
  "extends": "microsite/base"
}
```

## Path aliases and baseUrl

Microsite automatically supports the `tsconfig.json` `"paths"` and `"baseUrl"` options.

```json
{
  "extends": "microsite/base",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Static Generation

Microsite's `definePage` utility was designed with TypeScript in mind. Using `definePage` automatically infers the signature of `getStaticProps` based on your component.

To imporve the type inference for `getStaticPaths` and `getStaticProps`, you may optionally provide a `path` option to `definePage`. This uses `typescript@4.1`'s [template literal types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types) to infer the route `params` from your file path.

> **Note** The `path` option has no bearing on Static Generation. It's your responsibility to keep this in sync with your actual file path.

```tsx
import { definePage } from 'microsite/page';

const Post = () => {};

export default definePage(Post, {
    path: '/posts/[slug]',
    async getStaticProps({ params }) {
        // params.slug is properly typed
    }
})
```
