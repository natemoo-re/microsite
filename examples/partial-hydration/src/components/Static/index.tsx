import { h, FunctionalComponent } from "preact";

const Static: FunctionalComponent<{ renderedAt: string }> = ({
  renderedAt,
  children,
}) => {
  return (
    <section>
      <h3>Page rendered on {renderedAt}</h3>

      {children}

      <p>
        <a href="https://github.com/natemoo-re/microsite">Microsite</a> is an
        opinionated static site generator tailored for performance.
      </p>
      <p>
        This is a demo of Microsite's{" "}
        <strong>automatic partial hydration,</strong> which intelligently
        code-splits and rehydrates the minimum amount of clientside code. Check
        the console to see components hydrate in real-time or disable JS to see
        the SSR output.
      </p>

      <p>
        <a href="https://github.com/natemoo-re/microsite-demo">Demo source</a>
      </p>
    </section>
  );
};

export default Static;
