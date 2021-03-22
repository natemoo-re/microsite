import { withHydrate } from "microsite/hydrate";

const DefaultComponent = () => (
  <h1>
    Hello <code>default</code>
  </h1>
);

export default withHydrate(DefaultComponent, { method: "idle" });
