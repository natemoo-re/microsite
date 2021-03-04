# Benchmarks

These benchmarks are designed to measure the speed and output of various P/React-based static site generators. Please see [About](#about) for a detailed breakdown of the different benchmarks.

> Would you like to see the numbers for another tool? Feel free to [open an issue](https://github.com/natemoo-re/microsite/issues/new)!

<!-- TABLE -->

## Microsite

| Benchmark | Duration | JS files | JS size (raw) | JS size (gzip) | JS size (brotli) |
| :-------- | -------: | -------: | ------------: | -------------: | ---------------: |
| static    |     1.9s |        0 |            0B |             0B |               0B |

## NextJS

| Benchmark | Duration | JS files | JS size (raw) | JS size (gzip) | JS size (brotli) |
| :-------- | -------: | -------: | ------------: | -------------: | ---------------: |
| static    |    10.1s |       10 |      294.56kB |        98.42kB |          87.47kB |

## Gatsby

| Benchmark | Duration | JS files | JS size (raw) | JS size (gzip) | JS size (brotli) |
| :-------- | -------: | -------: | ------------: | -------------: | ---------------: |
| static    |    10.4s |        6 |      392.92kB |       123.66kB |          91.69kB |

<!-- ENDTABLE -->

---

## About

In order to normalize the results across tools with different feature sets, all benchmarks are configured to be as close to Microsite's defaults as possible. For example, NextJS benchmarks measure the output of `next build && next export` to generate fully static client assets.

### Static

The static benchmark consists of a simple `hello-world` project. It generates a single page that renders "Hello world!" and no interactive components. It is authored in TypeScript, contains one global stylesheet, and one CSS Module.
