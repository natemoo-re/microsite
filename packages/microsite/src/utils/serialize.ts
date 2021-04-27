import { valueToEstree } from "estree-util-value-to-estree";
import { generate } from "astring";
import { walk } from "estree-walker";
// @ts-ignore
import shorthash from "shorthash";

const shouldSantize = (node) => {
  return (
    node.type === "Literal" &&
    typeof node.value === "string" &&
    node.value.toLowerCase().indexOf("script") > -1 &&
    node.value.indexOf("<") > -1
  );
};

export const safe = (tree) => {
  walk(tree, {
    enter(node) {
      if (node.type === "Property") {
        if (shouldSantize(node.key)) {
          this.replace({ ...node, computed: true });
        }
      }

      if (shouldSantize(node)) {
        const b64 = Buffer.from(node.value).toString("base64");
        this.replace({
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "atob",
            },
            arguments: [
              {
                type: "Literal",
                value: `${b64}`,
                raw: `"${b64}"`,
              },
            ],
          },
        });
      }
    },
  });
  return tree;
};
export const serializeToJsString = (value: any): string => {
  const str = generate(safe(valueToEstree(value)), {
    lineEnd: "",
    indent: "",
  })
    .replace(/\)\;,/g, "),")
    .replace(/\)\;\]/g, ")]");
  return str;
};

export const hashString = (value: string): string => shorthash.unique(value);
