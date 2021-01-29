import _fetch, { RequestInfo, RequestInit, Response, FetchError }  from "node-fetch";
import { resolve } from 'path';
import { promises as fsp } from 'fs';
import { readDir } from "../utils/fs.js";

const cwd = import.meta.url.slice('file:/'.length).split('microsite')[0].slice(0, -1);

/// @ts-expect-error
type Url<S extends string> = S extends `http${infer A}` ? S : never;
type IsUrl<S extends string> = Url<S> extends never ? false : true;

/// @ts-expect-error
type Extname<S extends string> = S extends `${infer A}.${infer B}` ? B : never;
type HasExt<S extends string> = Extname<S> extends never ? false : true;

interface DirOptions {
    recursive?: boolean;
}

async function fetch<T extends string, Opts = IsUrl<T> extends true ? RequestInit : HasExt<T> extends true ? never : DirOptions>(url: T, opts?: Opts): Promise<Response>;
async function fetch(url: RequestInfo, init?: RequestInit|DirOptions): Promise<Response> {
    if (typeof url === 'string' && !url.startsWith('http')) {
        url = resolve(cwd, `../.${url}`);
        try {
            const stat = await fsp.stat(url);

            if (stat.isFile()) {
                const content = await fsp.readFile(url, 'utf-8');
                return new Response(content);
            } else if (stat.isDirectory()) {
                let contents = await readDir(url);
                contents = contents.map(path => path.slice((url as string).length));
                const res = new Response(JSON.stringify(contents));
                res.headers.set('Content-Type', 'application/json');
                return res;
            }
        } catch (e) {
            const err = new (FetchError as any)(`Unable to fetch ${url}. ${e.message}`);
            err.code = 'ERR_NOT_FOUND';
            err.errno = '404';
            throw err;
        }
    }

    return _fetch(url, init as RequestInit);
}

export default fetch;
