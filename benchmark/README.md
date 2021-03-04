# Benchmarks

These benchmarks are designed to measure the speed and output of various P/React-based static site generators. Please see [About](#about) for a detailed breakdown of the different benchmarks.

> Would you like to see the numbers for another tool? Feel free to [open an issue](https://github.com/natemoo-re/microsite/issues/new)!

### Wait, how is Microsite _that_ small?

Great question! Microsite treats every byte of JavaScript as an opt-in, which means the default output does not include Preact or any JavaScript. For interactive components, [automatic partial hydration](https://github.com/natemoo-re/microsite/blob/main/docs/basic/bundled-javascript.md#automatic-partial-hydration) strips any static components from your bundle and includes **only** your hydrated components. In those cases, Preact is loaded from the [Skypack](https://www.skypack.dev/) CDN and is not reflected in these benchmarks (for now.)

<!-- TABLE -->

## Microsite

| Benchmark | Build duration | JS files | JS size (raw) | JS size (gzip) | JS size (brotli) | First Meaningful Paint | Speed Index | First CPU Idle | Time to Interactive |
| :-------- | -------------: | -------: | ------------: | -------------: | ---------------: | ---------------------: | ----------: | -------------: | ------------------: |
| static    |           1.8s |        0 |            0B |             0B |               0B |                  0.9 s |       0.9 s |          0.9 s |               0.9 s |
| counter   |           1.9s |        2 |        2.83kB |         1.54kB |           1.38kB |                  1.0 s |       1.0 s |          1.0 s |               1.0 s |

## NextJS

| Benchmark | Build duration | JS files | JS size (raw) | JS size (gzip) | JS size (brotli) | First Meaningful Paint | Speed Index | First CPU Idle | Time to Interactive |
| :-------- | -------------: | -------: | ------------: | -------------: | ---------------: | ---------------------: | ----------: | -------------: | ------------------: |
| static    |           9.4s |       10 |      294.56kB |        98.42kB |          87.47kB |                  2.5 s |       2.5 s |          2.5 s |               2.5 s |
| counter   |           9.5s |       10 |      295.85kB |        99.03kB |          87.99kB |                  2.5 s |       2.5 s |          2.5 s |               2.5 s |

## Gatsby

| Benchmark | Build duration | JS files | JS size (raw) | JS size (gzip) | JS size (brotli) | First Meaningful Paint | Speed Index | First CPU Idle | Time to Interactive |
| :-------- | -------------: | -------: | ------------: | -------------: | ---------------: | ---------------------: | ----------: | -------------: | ------------------: |
| static    |          10.1s |        6 |      392.92kB |       123.66kB |          91.69kB |                  2.8 s |       2.8 s |          2.8 s |               2.8 s |
| counter   |           9.5s |        6 |      393.23kB |       123.75kB |          91.79kB |                  2.7 s |       2.7 s |          2.7 s |               2.7 s |

<!-- ENDTABLE -->

---

## About

In order to normalize the results across tools with different feature sets, all benchmarks are configured to be as close to Microsite's defaults as possible. For example, NextJS benchmarks measure the output of `next build && next export` to generate fully static client assets.

### Static

The static benchmark consists of a simple `hello-world` project. It generates a single page that renders "Hello world!" and no interactive components. It is authored in TypeScript, contains one global stylesheet, and one CSS Module.

### Counter

The counter benchmark is exactly the same as **Static**, except it renders an interactive "Counter" component rather than static text. This should give you a sense of Microsite's base output size when using `withHydrate`.
