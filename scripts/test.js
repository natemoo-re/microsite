// @ts-check

import del      from 'del';
import estrella from 'estrella';
import fs       from 'fs';
import globby   from 'globby';
import path     from 'path';

const cwd         = process.cwd();
const entriesGlob = '{src,test}/**/*.{cjs,js,jsx,mjs,ts,tsx}';
const outDir      = path.resolve(cwd, './.test');
const testDir     = path.resolve(outDir, 'test');

/** @type {estrella.BuildProcess | null} */
let testProcess = null;

// We cannot use the built-in `watch` flag, because the built-in
// watch mode doesn't handle file-system updates, and the `build`
// method overrides configuration with CLI flags. So we accept
// a `once` flag for single runs instead.
const [ args ] = estrella.cliopts.parse([
  'once',
]);

const isWatch = !args.once;
;
const resultsPath = path.join(testDir, 'results.json');
const testCommand = [
  `npx uvu ${JSON.stringify(testDir)}`,
  `echo true > ${JSON.stringify(resultsPath)}`,
].join(' && ');

const runTests = () => {
  return estrella.build({
    cwd,
    entry:     globby.sync(entriesGlob),
    minify:    false,
    outdir:    outDir,
    run:       testCommand,
    sourcemap: 'inline',
    watch:     false,
  });
};

/** @type {estrella.CancellablePromise<void>} */
let watchProcess = null;

const main = async () => {
  if (testProcess != null) {
    testProcess.cancel();
    testProcess = null;
  }

  await del(`${outDir}/**/*`);

  try {
    testProcess = runTests();

    await testProcess;
  }
  catch (error) {
    console.error('Unexpected error:', error);

    if (!isWatch) {
      process.exit(1);
    }
  }
  finally {
    if (isWatch) {
      testProcess.cancel();
      testProcess = null;

      if (watchProcess == null) {
        watchProcess = estrella.watch([ 'src', 'test' ], {
          // Imperceptibly slower (to me), but seems to prevent double runs
          // on filesystem changes.
          latency: 150,
        }, main);
      }
    }
    else {
      /** @type {number | null} */
      let exitCode = null;

      try {
        exitCode = JSON.parse(fs.readFileSync(resultsPath).toString()) === true
          ? 0
          : 1;
      }
      catch {
        exitCode = 1;
      }

      process.exit(exitCode);
    }
  }
};

main();
