import del from 'del';
import { promises as fsp } from 'fs';
import path from 'path';

async function removeEmptyDirectories(directory = process.cwd()) {
    const fileStats = await fsp.lstat(directory);
    if (!fileStats.isDirectory()) return;
    let fileNames = await fsp.readdir(directory);
    if (fileNames.length > 0) {
        const recursiveRemovalPromises = fileNames.map(
            (fileName) => removeEmptyDirectories(path.join(directory, fileName)),
        );
        await Promise.all(recursiveRemovalPromises);

        // re-evaluate fileNames; after deleting subdirectory
        // we may have parent directory empty now
        fileNames = await fsp.readdir(directory);
    }

    if (fileNames.length === 0) {
        await fsp.rmdir(directory);
    }
}

async function clean() {
    await Promise.all([del(['**/*.d.ts', '!assets', '!node_modules']), del('dist')]);
    await removeEmptyDirectories();
}

clean();
