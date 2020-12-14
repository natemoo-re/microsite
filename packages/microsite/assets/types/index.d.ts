import "./env";
import type preact from "preact";

/* GLOBAL */
declare global {
  // h and Fragment are automatically injected
  var h: typeof preact.h;
  var Fragment: typeof preact.Fragment;
}

export {};
