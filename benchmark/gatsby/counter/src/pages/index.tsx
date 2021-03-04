import * as React from "react";
import "../global/index.css";
import styles from "./index.module.css";

import Counter from "../components/counter";

const IndexPage = () => {
  return (
    <main className={styles.main}>
      <Counter />
    </main>
  );
};

export default IndexPage;
