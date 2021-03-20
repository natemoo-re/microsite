import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const workspaceRoot = resolve(join(dirname(fileURLToPath(import.meta.url)), '..', '..'));

export default {
    workspaceRoot
}
