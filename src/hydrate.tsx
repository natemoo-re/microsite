import React, { forwardRef, FC } from "preact/compat";

const isServer = typeof window === "undefined";

let id = 0;

export function withHydrate<T extends FC<any>>(Component: T): T {
  return forwardRef((props, ref) => {
    id += 1;

    const scriptSrc = `window.__hydrate.components[${id}]={name:${JSON.stringify(
      Component.displayName || Component.name
    )},props:${JSON.stringify(props)}}`;

    return (
      <>
        {isServer && <script dangerouslySetInnerHTML={{ __html: scriptSrc }} />}
        <div style={{ display: "contents" }} data-hydrate={id}>
          <Component {...{ ...props, ref }} />
        </div>
      </>
    );
  }) as T;
}
