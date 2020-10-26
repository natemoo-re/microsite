import { useContext } from "preact/compat";
import { __DocContext } from "./document";

export function Head({ children }) {
  const { head } = useContext(__DocContext);
  head.current.push(children);
  return null;
}
