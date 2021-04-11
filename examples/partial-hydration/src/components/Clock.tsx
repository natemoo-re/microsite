import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { withHydrate } from "microsite/hydrate";

const Clock: FunctionalComponent<{ initialDate: Date }> = ({ initialDate }) => {
  const [date, setDate] = useState(
    (initialDate || new Date()).toLocaleString().replace(", ", " at ")
  );

  useEffect(() => {
    let id = setInterval(() => {
      setDate(new Date().toLocaleString().replace(", ", " at "));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return <h3>The current date is {date}</h3>;
};

export default withHydrate(Clock, { method: "idle" });
