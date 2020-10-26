#!/usr/bin/env node
import type React from "react";
declare module "react" {
  interface HTMLAttributes<T>
    extends React.AriaAttributes,
      React.DOMAttributes<T> {
    class?: string;
  }
}

import { build } from "./scripts/build";
async function run() {
  const [command] = process.argv.slice(2);

  if (command === "build") {
    await build();
    return;
  }
}
run();
