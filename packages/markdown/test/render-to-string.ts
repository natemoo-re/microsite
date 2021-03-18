import { test } from "uvu";
import * as assert from "uvu/assert";
import { createContext, FunctionComponent, h } from "preact";
import { paragraphCustomAlerts } from "@hashicorp/remark-plugins";
import renderToString from "../src/render-to-string";

test("should export a default function", () => {
  assert.type(renderToString, "function");
});

test("minimal", async () => {
  const result = await renderToString("foo **bar**");
  assert.is(result.renderedOutput, "<p>foo <strong>bar</strong></p>");
});

test("with component", async () => {
  const result = await renderToString('foo <Test name="test" />', {
    components: {
      Test: ({ name }: any) => h("span", null, `hello ${name}`),
    },
  });
  assert.is(result.renderedOutput, "<p>foo <span>hello test</span></p>");
});

test("with options", async () => {
  const result = await renderToString("~> hello", {
    mdxOptions: {
      remarkPlugins: [paragraphCustomAlerts],
    },
  });
  assert.is(
    result.renderedOutput,
    '<div role="alert" class="alert alert-warning g-type-body"><p>hello</p></div>'
  );
});

test("with scope", async () => {
  const Test: FunctionComponent<{ name: string }> = ({ name }) =>
    h("p", null, name);
  const result = await renderToString("<Test name={bar} />", {
    components: {
      Test,
    },
    scope: {
      bar: "test",
    },
  });
  assert.is(result.renderedOutput, "<p>test</p>");
});

test("with custom provider", async () => {
  const TestContext = createContext(null);

  const result = await renderToString("<Test />", {
    components: {
      Test: () => h(TestContext.Consumer, null, (value) => h("p", null, value)),
    },
    provider: {
      component: TestContext.Provider,
      props: { value: "provider-value" },
    },
  });

  assert.is(result.renderedOutput, "<p>provider-value</p>");
});

test.run();
