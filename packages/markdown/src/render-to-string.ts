import { evaluate } from "xdm";
import { h } from "preact";
import * as jsxRuntime from "preact/jsx-runtime";
import { render as preactRenderToString } from "preact-render-to-string";

import type { MicrositeMarkdownOptions } from "./types";
import { PluggableList } from "xdm/lib/core";

let remarkFrontmatter;
let remarkMdxFrontmatter;

/**
 *
 * @param source Raw Markdown or MDX content as a string.
 * @param opts Optional parameters, such as components, plugins, and data.
 */
export default async function renderToString(
  source: string,
  {
    format = "mdx",
    components = {},
    mdxOptions = {},
  }: // scope = {},
  MicrositeMarkdownOptions = {}
) {
  let injectedRemarkPlugins: PluggableList = [];
  if (new Set(...source.slice(0, 3)).size === 1) {
    if (!remarkFrontmatter) {
      const [a, b] = await Promise.all([
        import("remark-frontmatter"),
        import("remark-mdx-frontmatter"),
      ]);
      remarkFrontmatter = a.default;
      remarkMdxFrontmatter = b.remarkMdxFrontmatter;
    }
    injectedRemarkPlugins = [remarkFrontmatter, remarkMdxFrontmatter];
  }
  let MDXContent: any;
  let data: any;
  try {
    const { default: _default, ...rest } = await evaluate(source, {
      ...mdxOptions,
      remarkPlugins: [
        ...injectedRemarkPlugins,
        ...(mdxOptions.remarkPlugins ?? []),
      ],
      format,
      ...jsxRuntime,
      baseUrl: import.meta.url,
    });
    MDXContent = _default;
    data = rest;
  } catch (e) {
    console.error(e);
  }

  return { data, content: preactRenderToString(h(MDXContent, { components })) };
}
