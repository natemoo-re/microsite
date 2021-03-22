import { h, FunctionComponent, createContext, VNode } from "preact";
import { useContext } from "preact/hooks";

const isServer = typeof window === "undefined";
export const HydrateContext = createContext<string | false>(false);

export interface HydrationProps {
  displayName?: string;
  method?: "idle" | "visible";
  fallback?: VNode<any> | null;
}

const encode = (str: string) => Buffer.from(str).toString("base64");

export function withHydrate<T extends FunctionComponent<any>>(
  Component: T,
  hydrationProps: HydrationProps = {}
): T {
  const innerName = Component.name;
  const { method, fallback: Fallback } = hydrationProps;

  return (function (props: any, ref: any) {
    const hydrateParent = useContext(HydrateContext);
    if (hydrateParent)
      throw new Error(
        `withHydrate() should only be called at the top-level of a Component tree. <${innerName} /> should not be nested within <${hydrateParent} />`
      );

    if (props.children && !["string", "number"].includes(typeof props.children))
      throw new Error(
        `withHydrate() is unable to serialize complex \`children\`. Please inline these children into <${innerName} />.`
      );

    const p = isServer ? `p=${encode(JSON.stringify(props))}` : "";
    const m = isServer && method ? `m=${method}` : "";
    const f = isServer && typeof Fallback !== "undefined" ? "f=1" : "";
    const Marker = "hydrate-marker" as any;
    const Placeholder = "hydrate-placeholder" as "div";
    return (
      <HydrateContext.Provider value={innerName}>
        {isServer && (
          <Marker dangerouslySetInnerHTML={{ __html: `?h c=${innerName} ?` }} />
        )}
        {typeof Fallback !== "undefined" ? (
          Fallback || <Placeholder />
        ) : (
          <Component {...{ ...props, ref }} />
        )}
        {isServer && (
          <Marker
            dangerouslySetInnerHTML={{
              __html: `?h ${[p, m, f].filter((v) => v).join(" ")} ?`,
            }}
          />
        )}
      </HydrateContext.Provider>
    );
  } as unknown) as T;
}
