import fs from "fs";
import util from "util";
const { promisify } = util;

export const readFile = promisify(fs.readFile);
