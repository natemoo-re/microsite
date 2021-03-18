import type { ComponentFactory } from "preact";
import type { PluggableList } from "unified";

interface MdxOptions {
  /**
   * List of recma (esast, JavaScript) plugins
   */
  recmaPlugins?: PluggableList;
  /**
   * List of remark (mdast, markdown) plugins
   */
  remarkPlugins?: PluggableList;
  /**
   * List of rehype (hast, HTML) plugins
   */
  rehypePlugins?: PluggableList;
}
export interface MicrositeMarkdownOptions {
  /**
   * Format of the files to be processed
   */
  format?: "mdx" | "md";
  /**
   * A object mapping names to Preact components.
   * The key used will be the name accessible to MDX.
   *
   * For example: `{ ComponentName: Component }` will be accessible in the MDX as `<ComponentName/>`.
   */
  components?: Record<string, ComponentFactory<any>>;
  /**
   * These options are passed to the MDX compiler.
   * See [the MDX docs.](https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js).
   */
  mdxOptions?: MdxOptions;
}
