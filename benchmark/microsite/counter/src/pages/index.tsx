import { FunctionalComponent } from "preact";
import { definePage } from "microsite/page";
import styles from "./index.module.css";

import Counter from "../components/counter";

interface IndexProps {}

const Index: FunctionalComponent<IndexProps> = () => {
  return (
    <main className={styles.main}>
      <Counter />
    </main>
  );
};

export default definePage(Index);
