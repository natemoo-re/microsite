import fetch, { Request, RequestInfo, RequestInit } from "node-fetch";
import { promises as fsp } from "fs";
import { join } from "path";
import { createHash } from "crypto";

export function createPrefetch(previousKey: string | null) {
  console.log({ previousKey });
  return async function prefetch(
    info: RequestInfo,
    init: RequestInit = {}
  ): Promise<string | null> {
    // file mode
    if (typeof info === "string" && !info.startsWith("http")) {
      const currentKey = await createFileKey(info);
      // console.log('fs', { previousKey, currentKey });
      return currentKey;
    }

    // fetch mode
    const req = new Request(info, { ...init, method: "HEAD" });
    const res = await fetch(req);
    return res.headers.get("etag") ?? null;
  };
}

// const serializeReq = (req: Request) => ({
//     url: req.url,
//     method: req.method,
//     headers: iterableToObject(req.headers)
// })
// const serializeRes = (res: Response) => ({
//     status: res.status,
//     headers: iterableToObject(res.headers)
// })

// const createPolicy = (req: Request, res: Response) => new CachePolicy(serializeReq(req), serializeRes(res), { shared: false });

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
