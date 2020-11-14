import "./styles";
import type preact from "preact";

declare global {
  var h: typeof preact.h;
  var Fragment: typeof preact.Fragment;
}

export {};
