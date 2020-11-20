import { StaticPath, StaticPropsContext } from './scripts/build.js';
import { ComponentProps, JSX, ComponentType } from "preact";

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

export interface GetStaticPaths<Path extends string, P extends PathParams<Path>> {
    (ctx: { isPrefetch: boolean, key: string|null }): Promise<{ paths: StaticPath<P>[] }|string>;
}

export interface GetStaticProps<T extends ComponentType<any> | keyof JSX.IntrinsicElements, Path extends string, P extends PathParams<Path>> {
    (ctx: StaticPropsContext<P> & { isPrefetch: boolean, key: string|null }): Promise<{ props: ComponentProps<T> }|string>;
}

export interface Page<T extends ComponentType<any> | keyof JSX.IntrinsicElements, Path extends string, P extends PathParams<Path>> {
    path?: Path;
    getStaticPaths?: GetStaticPaths<Path, P>;
    getStaticProps?: GetStaticProps<T, Path, P>;
}

export function definePage<T extends ComponentType<any> | keyof JSX.IntrinsicElements, Path extends string, P extends PathParams<Path>>(
    Component: T,
    page: Page<T, Path, P> = {}
) {
    return { Component, ...page };
}
