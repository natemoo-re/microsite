import { h, createContext } from 'preact';

export const HydrateContext = createContext(false);

export const withHydrate = (Component: any) => {
    const name = Component.displayName || Component.name;

    const HydratedComponent = (props: any) => (
        <HydrateContext.Provider value={true}>
            <Component {...props} />
        </HydrateContext.Provider>
    )
    HydratedComponent.__withHydrate = true;

    Object.defineProperty(HydratedComponent, "name", { value: `withHydrate(${name})`, configurable: true });
    return HydratedComponent;
}
