import "./global.css";
import { listen } from "../node_modules/quicklink/dist/quicklink.mjs";

if ("requestIdleCallback" in window) {
  window.addEventListener("load", () => {
    listen();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
