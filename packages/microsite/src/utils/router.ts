const DYNAMIC_ROUTE = /\[[^/]+?\](?=\/|$)/;
function isDynamicRoute(route: string): boolean {
  return DYNAMIC_ROUTE.test(route);
}

const cleanPathSegment = (segment: string) => {
  return segment.replace(/[\[\]]/g, "").replace(/\.\.\./, "");
};

const pathToSegments = (path: string) =>
  path.split("/").map((text) => {
    const isDynamic = isDynamicRoute(text);
    const isCatchAll = isDynamic && text.slice(1, -1).startsWith("...");
    return { text, isDynamic, isCatchAll };
  });

export interface Params {
  [param: string]: string | string[];
}

export interface RouteInfo {
  segments: ReturnType<typeof pathToSegments>;
  params: Params;
}

export type StaticPath<P extends Params = Params> =
  | string
  | { params: P; meta?: any };

export interface StaticPropsContext<P extends Params = Params> {
  path: string;
  params: P;
}

// TODO: prefetch
export interface StaticPathsContext {}

function getParamsFromPath(fileName: string, path: string): Params {
  path = normalizePathName(path);
  const segments = pathToSegments(normalizePathName(fileName));
  const parts = path.split("/");
  return parts.reduce((acc, part, i) => {
    const segment = segments[i] ?? segments[segments.length - 1];
    if (segment.isCatchAll) {
      const key = segment.text.slice(4, -1);
      return { ...acc, [key]: [...(acc[key] ?? []), part] };
    }
    if (segment.isDynamic) {
      const key = segment.text.slice(1, -1);
      return { ...acc, [key]: part };
    }
    return acc;
  }, {});
}

const stripLeadingSlash = (str: string) => str.replace(/^\//, "");
const stripTrailingExt = (str: string) => str.replace(/\..*$/, "");
const normalizePathName = (str: string) =>
  stripTrailingExt(stripLeadingSlash(str));

export function getPathFromParams(fileName: string, params: Params): string {
  const segments = pathToSegments(normalizePathName(fileName));

  return (
    "/" +
    segments
      .reduce((path: string[], segment) => {
        const key = cleanPathSegment(segment.text);
        const value = params[key];

        if (typeof value === "undefined") return path.concat(key);
        return path.concat(...(Array.isArray(value) ? value : [value]));
      }, [])
      .join("/")
  );
}

export function generateStaticPropsContext(
  fileName: string,
  pathOrParams: string | { params: Params }
): StaticPropsContext {
  if (typeof pathOrParams === "string") {
    return {
      path: normalizePathName(pathOrParams),
      params: getParamsFromPath(fileName, pathOrParams),
    };
  } else if (typeof pathOrParams === "object") {
    return {
      path: getPathFromParams(fileName, pathOrParams.params),
      params: pathOrParams.params,
    };
  }
}
