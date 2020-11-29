import { FunctionalComponent } from "preact";
import css from "./index.module.css";
import Logo from "@/components/Logo";

const Header: FunctionalComponent = () => {
  return (
    <header class={css.header}>
      <div class="container">
        <a href="/">
          <Logo height={64} />
        </a>

        <nav class={css.nav}>
          <ul role="list">
            <li>
              <a href="/docs/getting-started">Docs</a>
            </li>
            <li>
              <a href="https://github.com/natemoo-re/microsite">Github</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
