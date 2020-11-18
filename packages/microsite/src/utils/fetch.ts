import fetch from "make-fetch-happen";
import { resolve, join } from "path";

export default fetch.defaults({
  cacheManager: resolve(join(".microsite", "cache", "fetch")),
});
