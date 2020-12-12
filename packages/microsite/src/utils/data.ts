const DYNAMIC_ROUTE = /\[[^/]+?\](?=\/|$)/;
function isDynamicRoute(route: string): boolean {
  return DYNAMIC_ROUTE.test(route);
}

const routeToSegments = (route: string) =>
  route.split("/").map((text) => {
    const isDynamic = isDynamicRoute(text);
    const isCatchAll = isDynamic && text.slice(1, -1).startsWith("...");
    return { text, isDynamic, isCatchAll };
  });


export interface Params {
  [param: string]: string | string[];
}

export interface RouteInfo {
  segments: ReturnType<typeof routeToSegments>;
  params: Params;
}

export type StaticPath<P extends Params = Params> =
  | string
  | { params: P; meta?: any };
export interface StaticPropsContext<P extends Params = Params> {
  path: string;
  params: P;
  meta?: any;
}
