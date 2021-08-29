# RFC: Microsite v2.0.0

Microsite v1.0.0 was released in December 2020. Conceptually, it was my first attempt to unify several strands of work on "Partial Hydration" into a single, well-optimized tool.

In March 2021, I was hired to work on [Astro](https://github.com/snowpackjs/astro), a framework-agnostic tool that built on many of the ideas I was exploring with Microsite.

I've learned so much while working on Astro. Now seems like as good a time as any to apply those lessons to Microsite.

## JSX Compiler

The core of Microsite v2.0.0 would be built around a custom JSX compiler. Conceptually, this would be similar to [Solid](https://www.solidjs.com/)'s approach with [`dom-expressions`](http://npm.im/dom-expressions)—leverage JSX/TSX as the defacto standard for authoring Markup in JavaScript, but compile JSX to a non-standard, highly optimized output.

Instead of the `withHydrate` HOC, this compiler would be able to leverage a hydration directive directly inside of JSX. The compiler output would be highly optimized for SSR speed, relying on strings rather than a server-side VDOM.

It's possible that hydration directives wouldn't even be necessary if we can detect whether a component uses `on*` event listeners or `use*` hooks. In that case, I'd default to `method: visible` hydration.

```tsx
// Input
/* imports */

const Input = () => {
    return (
        <>
            <Head>
                <seo.title>Microsite v2.0.0</seo.title>

                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="alternate icon" href="/favicon.ico" />
            </Head>

            <main>
                <div class="stack">
                    <h1>Hello world!</h1>
                </div>

                <Counter @hydrate={{ method: 'visible' }} />
            </main>
        </>
    )
}

// Output
import { ssr, component, escape } from 'microsite/internal';
/* imports */

const Output = () => {
    return ssr`
        ${component(Head, null, ssr`
            ${component(seo.title, null, ssr`Microsite v2.0.0`)}
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="alternate icon" href="/favicon.ico" />
        `)}
        <main>
            <div class="stack">
                <h1>Hello world!</h1>
            </div>

            ${component(Counter, { '@hydrate': { method: 'visible' } })}
        </main>
    `
}
```

## Framework Agnostic

Switching the majority of JSX compilation to a custom compiler would also open the door for other JSX-based frameworks. Preact would be the primary one, but Solid would be supported as well. 

> I'm not interested in supporting React unless it is aliased to `preact/compat`.

## Custom Rendering

Microsite would have its own internal `renderToString` that resolves everything to a string of HTML.
`component` would be able to render the component instance to a string of HTML and generate the final hydration script.

### Streaming Rendering?

We could potentially return a generator function to enable streaming responses by exposing something like `renderToStream`.

## `esbuild`

`esbuild` is pretty amazing, and there's also a Deno module. Assuming we could build an HMR engine for `esbuild`, do we really need all the extra weight that Snowpack/Vite bring along?

## Deno

I really like [Deno](https://deno.land/) and Microsite should run on Deno. We probably _shouldn't_ drop Node support, but...

If the compiler was written in Rust, we could ship `microsite` as a stand-alone executable that uses [`deno_core`](https://docs.rs/deno_core/0.98.0/deno_core/) under the hood. The idea is extremely appealing!

Using `deno deploy` with no build step sounds amazing.
