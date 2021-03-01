import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import styles from "./index.module.css";

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <main className={styles.main}>
      <h1>Hello world!</h1>
    </main>
  );
};

export default definePage(Index);
