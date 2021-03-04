import styles from "./index.module.css";
import Counter from "../components/counter";

export default function Home() {
  return (
    <main className={styles.main}>
      <Counter />
    </main>
  );
}
