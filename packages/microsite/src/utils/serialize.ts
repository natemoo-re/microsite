import { valueToEstree } from "estree-util-value-to-estree";
import { generate } from "astring";
// @ts-ignore
import shorthash from "shorthash";

export const serializeToJsString = (value: any): string => {
  const str = generate(valueToEstree(value), { lineEnd: "", indent: "" });
  return str;
};

export const hashString = (value: string): string => shorthash.unique(value);
