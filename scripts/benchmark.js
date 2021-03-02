import { exec } from 'child_process';
import { join } from 'path';
import fse from 'fs-extra';
import formatMs from 'pretty-ms';
import formatBytes from 'nice-bytes';
import size from 'glob-size';

const { remove } = fse;
const SAMPLED_RUNS = 24;
const BENCHMARKS = ['microsite-simple', 'next-simple', 'gatsby-simple'];
const BENCHMARK_NAMES = ['Microsite', 'NextJS', 'Gatsby'];
const BENCHMARK_CACHEDIR = ['.microsite', '.next', '.cache'];
const BENCHMARK_OUTDIR = ['dist', 'out', 'public'];

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
    const index = BENCHMARKS.indexOf(name);
    const samples = [];
    const build = 'npm run build';
    const dir = `./benchmark/${name}`;
    const cacheDir = join(dir, BENCHMARK_CACHEDIR[index]);
    const outDir = join(dir, BENCHMARK_OUTDIR[index]);

    for (const i of Array.from({ length: SAMPLED_RUNS }, (_, i) => i)) {
        const BAR_SIZE = 20;
        const progress = Math.round(((i + 1) / SAMPLED_RUNS) * BAR_SIZE);
        const dots = "•".repeat(progress).padEnd(BAR_SIZE, ' ');
        
        process.stdout.write(`\r${name.padEnd(35, ' ')} [${dots}] ${`${i + 1}`.padStart(3, ' ')}/${SAMPLED_RUNS}\r`);
        if (i === SAMPLED_RUNS - 1) console.log(`${name.padEnd(35, ' ')} [${dots}] ${`${i + 1}`.padStart(3, ' ')}/${SAMPLED_RUNS}\r`);

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

    let header = `${'Framework'.padEnd(20, ' ')} |   Client-side JS |   Duration`; 
    console.log('\n' + header);
    console.log(`—`.repeat(header.length))
    BENCHMARKS.forEach((name, i) => {
        console.log(`${BENCHMARK_NAMES[i].padEnd(20, ' ')} | ${frameworks[name].size.label.padStart(16, ' ')} | ${frameworks[name].duration.label.padStart(10, ' ')}`);
    })
    console.log();
}

run();
