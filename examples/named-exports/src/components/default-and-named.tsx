import { withHydrate } from "microsite/hydrate";

const DefaultComponent = () => (
  <h1>
    Hello <code>default</code>
  </h1>
);
const NamedComponentInternal = () => (
  <h1>
    Hello <code>named</code>
  </h1>
);

export const NamedComponent = withHydrate(NamedComponentInternal, {
  method: "idle",
});

export default withHydrate(DefaultComponent, { method: "idle" });
