import { withHydrate } from "microsite/hydrate";

const NamedComponentInternal = () => (
  <h1>
    Hello <code>named</code>
  </h1>
);

export const NamedComponent = withHydrate(NamedComponentInternal, {
  method: "idle",
});
