import fetch, { Request, Response, RequestInfo, RequestInit } from "node-fetch";
import CachePolicy from "http-cache-semantics";
import { promises as fsp } from "fs";
import { CACHE_DIR } from "./build";
import { join } from "path";
import { createHash } from "crypto";
import cache from "cacache";

export type Prefetch = ReturnType<typeof createPrefetch>;
export interface CacheEntry {
  data: any;
  meta: {
    prefetch: string | null;
    hash: string | null;
  };
}

export async function getCacheEntry(
  method: "getStaticPaths" | "getStaticProps",
  fileName: string
): Promise<CacheEntry> {
  const cacheKey = `${method}:${fileName}`;
  const {
    data = null,
    meta: { prefetch = null, hash = null } = {},
  } = await cache.get(CACHE_DIR, cacheKey).catch(() => ({} as any));

  return { data, meta: { prefetch, hash } };
}

export function createPrefetch(previousKey: string | null) {
  return async function prefetch(
    info: RequestInfo,
    init: RequestInit = {}
  ): Promise<string | null> {
    // file mode
    if (typeof info === "string" && !info.startsWith("http")) {
      const key = await createFileKey(info);
      return Buffer.from(JSON.stringify({ type: "fs", key })).toString(
        "base64"
      );
    }

    // fetch mode
    let req = new Request(info, { ...init, method: "HEAD" });
    let previousPolicy = null;
    let previousRes = null;

    if (previousKey) {
      const { policy, response } = JSON.parse(
        Buffer.from(previousKey, "base64").toString("utf8")
      );
      previousPolicy = CachePolicy.fromObject(policy);
      previousRes = response;
    }

    if (previousPolicy && previousPolicy.satisfiesWithoutRevalidation(req)) {
      previousRes.headers = previousPolicy.responseHeaders();
      const response = !previousPolicy.storable()
        ? null
        : serializeRes(previousRes);
      return Buffer.from(
        JSON.stringify({
          type: "network",
          policy: previousPolicy.toObject(),
          response,
        })
      ).toString("base64");
    }

    if (previousPolicy) {
      req = new Request(info, {
        ...init,
        method: "HEAD",
        headers: {
          ...req.headers,
          ...previousPolicy.revalidationHeaders(serializeReq(req)),
        },
      });
      const res = await fetch(req);
      const { policy, modified } = previousPolicy.revalidatedPolicy(req, res);

      const response = !policy.storable() ? null : serializeRes(res);
      if (modified) {
        return Buffer.from(
          JSON.stringify({
            type: "network",
            policy: policy.toObject(),
            response,
          })
        ).toString("base64");
      }

      return Buffer.from(
        JSON.stringify({
          type: "network",
          policy: previousPolicy.toObject(),
          response,
        })
      ).toString("base64");
    }

    const res = await fetch(req);
    const policy = createPolicy(req, res);
    const response = !policy.storable() ? null : serializeRes(res);

    return Buffer.from(
      JSON.stringify({ policy: policy.toObject(), response })
    ).toString("base64");
  };
}

export const isKeyValid = (previousKey: string | null, key: string | null) => {
  if (!previousKey || !key) return false;
  const { type } = JSON.parse(
    Buffer.from(previousKey, "base64").toString("utf8")
  );

  if (type === "fs") return previousKey === key;

  const { type: _type, ...current } = JSON.parse(
    Buffer.from(key, "base64").toString("utf8")
  );

  return current.response.status === 200 || current.response.status === 304;
};

const serializeReq = (req: Request) => ({
  url: req.url,
  method: req.method,
  headers: iterableToObject(req.headers),
});
const serializeRes = (res: Response) => ({
  status: res.status,
  headers: iterableToObject(res.headers),
});
const iterableToObject = (iter: any) => {
  if (typeof iter.keys !== "function") return iter;
  let obj = {};
  for (const key of iter.keys()) {
    obj[key] = iter.get(key);
  }
  return obj;
};

const createPolicy = (req: Request, res: Response) =>
  new CachePolicy(serializeReq(req), serializeRes(res), { shared: false });

async function createFileKey(p: string): Promise<string> {
  const hash = createHash("sha1");
  const stat = await fsp.stat(p);

  if (stat.isDirectory()) {
    for (const ent of await addDir(p, { mode: "dir" })) {
      hash.update(ent);
    }
  } else {
    hash.update(await addFile(p, { mode: "file" }));
  }

  return hash.digest("base64");
}

const addDir = async (p, { mode }) => {
  const ents = await fsp.readdir(p, { withFileTypes: true });
  const results = await Promise.all(
    ents.map((ent) =>
      ent.isDirectory()
        ? addDir(join(p, ent.name), { mode })
        : addFile(join(p, ent.name), { mode })
    )
  );

  return [].concat(...results);
};

const addFile = async (p, { mode }) => {
  if (mode === "dir") {
    return p;
  } else if (mode === "file") {
    const content = await fsp.readFile(p);
    return content;
  }
};
