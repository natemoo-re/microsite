import { StaticPath, StaticPropsContext } from './scripts/build';
import { ComponentProps, JSXElementConstructor } from "react";

type RestParam<S extends string> = S extends `...${infer A}` ? A : never;
// @ts-expect-error
type StandardParam<S extends string> = S extends `...${infer A}` ? never : S;
type ExtractParams<S extends string> = S extends `[${infer A}]` ? A : never;
type TupleToUnion<T extends any[]> = T[number];
type Split<S extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}/${infer U}` ? [T, ...Split<U>] :
    [S];
type NormalizePath<S extends string> = S extends `/${infer T}` ? T : S;

type AllPathParams<S extends string, P extends string = ExtractParams<TupleToUnion<Split<NormalizePath<S>>>>> = { [param in P]: string|string[] };
type RestParams<S extends string, Base extends string = keyof AllPathParams<S>> = { [a in RestParam<Base>]: string[] };
type StandardParams<S extends string, Base extends string = keyof AllPathParams<S>> = { [a in StandardParam<Base>]: string };
export type PathParams<S extends string> = RestParams<S> & StandardParams<S>;

export function definePage<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>, Path extends string, P extends PathParams<Path>>(
    Component: T,
    page: {
        path?: Path,
        getStaticPaths?: () => Promise<{ paths: StaticPath<P>[] }>,
        getStaticProps?: (ctx: StaticPropsContext<P>) => Promise<{ props: ComponentProps<T> }>
    } = {}
) {
    return { Component, ...page };
}
