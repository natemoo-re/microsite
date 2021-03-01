import { exec } from 'child_process';
import { join } from 'path';
import fse from 'fs-extra';
import formatMs from 'pretty-ms';
import formatBytes from 'nice-bytes';
import size from 'glob-size';

const { remove } = fse;
const SAMPLED_RUNS = 3;
const BENCHMARKS = ['microsite-simple', 'next-simple'];
const BENCHMARK_NAMES = ['Microsite "hello-world"', 'NextJS "hello-world"'];

async function runCmd(cmd, dir = '.') {
    return new Promise((resolve, reject) => {
      const startTime = new Date()
      exec(cmd, { cwd: dir, maxBuffer: Infinity }, (err, stdout, stderr) => {
        const endTime = new Date()
        const elapsedTime = (endTime.valueOf() - startTime.valueOf())
        return err ? reject(err) : resolve({ duration: elapsedTime, stdout, stderr })
      })
    })
}

async function benchmark(name) {
    const samples = [];
    const build = 'npm run build';
    const dir = `./benchmark/${name}`;
    const cacheDir = join(dir, /next/gmi.test(name) ? '.next' : '.microsite');
    const outDir = join(dir, /next/gmi.test(name) ? 'out' : 'dist');

    for (const i of Array.from({ length: SAMPLED_RUNS }, (_, i) => i)) {
        const { duration } = await runCmd(build, dir);
        const { total, count: jsFiles } = await size('**/*.js', { cwd: outDir });
        
        samples[i] = {
            duration,
            jsFiles,
            size: total
        }
        await Promise.all([remove(cacheDir), remove(outDir)]);
    }

    const avgDuration = samples.reduce((a, { duration: b }) => (a + b), 0) / SAMPLED_RUNS;
    const avgSize = samples.reduce((a, { size: b }) => (a + b), 0) / SAMPLED_RUNS;
    return { duration: { value: avgDuration, label: formatMs(avgDuration) }, size: { value: avgSize, label: avgSize > 0 ? formatBytes(avgSize).text : '0B' } };
}

async function run() {
    const frameworks = {};
    for (const name of BENCHMARKS) {
        frameworks[name] = await benchmark(name);
    }

    console.log(`Results averaged over ${SAMPLED_RUNS} runs:\n`);

    BENCHMARKS.forEach((name, i) => {
        console.log(`${BENCHMARK_NAMES[i]} generated ${frameworks[name].size.label} of client-side JS in ${frameworks[name].duration.label}`);
    })
}

run();
