import { promises as fsp } from "fs";
import { dirname, join } from "path";

export const fileExists = async (path: string) => {
  try {
    return (await fsp.stat(path)).isFile();
  } catch (e) {}
  return false;
};

export const dirExists = async (path: string) => {
  try {
    return (await fsp.stat(path)).isDirectory();
  } catch (e) {}
  return false;
};

export const readDir = async (path: string): Promise<string[]> => {
  const ents = await fsp.readdir(path, { withFileTypes: true });
  const results = await Promise.all(
    ents.map((ent) =>
      ent.isDirectory()
        ? (readDir(join(path, ent.name)) as any)
        : join(path, ent.name)
    )
  );

  return [].concat(...results);
};

export const rmFile = async (path: string) => {
  return fsp.unlink(path);
};

export const writeFile = async (path: string, content: string) => {
  await mkdir(dirname(path));
  return fsp.writeFile(path, content);
};

export const rmdir = (path: string) => fsp.rmdir(path, { recursive: true });
export const mkdir = (path: string) => fsp.mkdir(path, { recursive: true });

export interface CopyFileOpts {
  transform?: (source: string) => string | Promise<string>;
}
export const copyFile = async (
  src: string,
  dest: string,
  { transform }: CopyFileOpts = {}
) => {
  if (transform) {
    let content = await fsp.readFile(src).then((res) => res.toString());
    content = await transform(content);
    await writeFile(dest, content);
  }
  else {
    await mkdir(dirname(dest));
    await fsp.copyFile(src, dest);
  }
};

export const copyDir = async (src: string, dest: string) => {
  try {
    if (!(await fsp.stat(src)).isDirectory()) throw new Error();
  } catch (e) {
    return;
  }

  const files = await readDir(src);
  await Promise.all(
    files.map((file) => copyFile(file, file.replace(src, dest)))
  );
};
