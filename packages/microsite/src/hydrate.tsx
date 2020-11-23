import { h, FunctionComponent, createContext } from "preact";

import { useContext } from "preact/hooks";
import { Buffer } from "buffer";
import { __DocContext } from "./document.js";

const isServer = typeof window === "undefined";
const btoa = (str: string) => Buffer.from(str, "utf-8").toString("base64");
const HydrateContext = createContext<string | false>(false);

export interface HydrationProps {
  method?: "idle" | "visible" | "interaction";
}

export function withHydrate<T extends FunctionComponent<any>>(
  Component: T,
  hydrationProps: HydrationProps = {}
): T {
  const name = Component.displayName || Component.name;
  const { method = "idle" } = hydrationProps;

  const Wrapped: FunctionComponent<any> = (props, ref) => {
    const { hydrate } = useContext(__DocContext);
    const hydrateParent = useContext(HydrateContext);
    if (hydrateParent)
      throw new Error(
        `withHydrate() should only be called at the top-level of a Component tree. <${name} /> should not be nested within <${hydrateParent} />`
      );

    if (isServer) hydrate.current.push({ name });
    if (props.children && !["string", "number"].includes(typeof props.children))
      throw new Error(
        `withHydrate() is unable to serialize complex \`children\`. Please inline these children into <${name} />.`
      );

    return (
      <HydrateContext.Provider value={name}>
        <div
          {...(isServer
            ? {
                "data-hydrate": name,
                "data-props":
                  Object.keys(props).length > 0
                    ? btoa(JSON.stringify(props))
                    : null,
                "data-method": method,
              }
            : {})}
        >
          <Component {...{ ...props, ref }} />
        </div>
      </HydrateContext.Provider>
    );
  };

  Object.defineProperty(Wrapped, "name", { value: name, configurable: true });
  return (Wrapped as unknown) as T;
}
