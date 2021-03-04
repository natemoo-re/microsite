import { exec } from 'child_process';
import { join } from 'path';
import fse from 'fs-extra';
import formatMs from 'pretty-ms';
import formatBytes from 'nice-bytes';
import size from 'glob-size';
import { gzip } from 'gzip-cli';
import { performance } from 'perf_hooks';

const { remove } = fse;
let SAMPLED_RUNS = 15;
const BENCHMARKS = ['microsite-simple', 'next-simple', 'gatsby-simple'];
const BENCHMARK_NAMES = ['Microsite', 'NextJS', 'Gatsby'];
const BENCHMARK_CACHEDIR = ['.microsite', '.next', '.cache'];
const BENCHMARK_OUTDIR = ['dist', 'out', 'public'];

async function runCmd(cmd, dir = '.') {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      exec(cmd, { cwd: dir, maxBuffer: Infinity }, (err, stdout, stderr) => {
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime)
        return err ? reject(err) : resolve({ duration: elapsedTime, stdout, stderr })
      })
    })
}

async function benchmark(name) {
    const index = BENCHMARKS.indexOf(name);
    const label = BENCHMARK_NAMES[index];
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
        const { total, count: numFiles } = await size('**/*.js', { cwd: outDir });
        let gzipSize = 0;
        let brotliSize = 0;

        if (numFiles > 0) {
            await gzip({ patterns: [join(outDir, '**/*.js')], outputExtensions: ['gz', 'br'] });
            const [{ total: totalGzip }, { total: totalBrotli }] = await Promise.all([size('**/*.js.gz', { cwd: outDir }), size('**/*.js.br', { cwd: outDir })]);
            gzipSize = totalGzip;
            brotliSize = totalBrotli;
        }
        
        samples[i] = {
            duration,
            numFiles,
            size: total,
            gzipSize,
            brotliSize
        }
        await Promise.all([remove(cacheDir), remove(outDir)]);
    }

    const avgDuration = samples.reduce((a, { duration: b }) => (a + b), 0) / SAMPLED_RUNS;
    const avgSize = samples.reduce((a, { size: b }) => (a + b), 0) / SAMPLED_RUNS;
    const avgGzipSize = samples.reduce((a, { gzipSize: b }) => (a + b), 0) / SAMPLED_RUNS;
    const avgBrotliSize = samples.reduce((a, { brotliSize: b }) => (a + b), 0) / SAMPLED_RUNS;
    const numFiles = samples[samples.length - 1].numFiles;

    return { 
        name: { value: name, label },
        duration: { value: avgDuration, label: formatMs(avgDuration) },
        numFiles: { value: numFiles, label: numFiles },
        uncompressedSize: { value: avgSize, label: avgSize > 0 ? formatBytes(avgSize).text : '0B' },
        gzipSize: { value: avgGzipSize, label: avgGzipSize > 0 ? formatBytes(avgGzipSize).text : '0B' },
        brotliSize: { value: avgBrotliSize, label: avgBrotliSize > 0 ? formatBytes(avgBrotliSize).text : '0B' }
    };
}

async function run() {
    const args = process.argv.slice(2).reduce((acc, curr, i, arr) => {
        if (i % 2 !== 0) {
            const key = arr[i - 1];
            if (typeof acc[key] !== 'undefined') {
                if (Array.isArray(acc[key])) return { ...acc, [key]: [...acc[key], curr] }
                return { ...acc, [key]: [acc[key], curr] };
            }
            return { ...acc, [key]: curr };
        }
        return acc;
    }, {});
    SAMPLED_RUNS = args['--runs'] || 10;

    const frameworks = {};
    
    for (const name of BENCHMARKS) {
        frameworks[name] = await benchmark(name);
    }

    const labels = {
        name: 'Framework'.padEnd(20, ' '),
        duration: 'Duration',
        numFiles: 'JS files',
        uncompressedSize: 'JS size (raw)',
        gzipSize: 'JS size (gzip)',
        brotliSize: 'JS size (brotli)'
    }
    
    let table = [];
    const header = Object.values(labels).join(' | ');
    table.push('\n' + `| ${header} |`);
    table.push(`| ${Object.values(labels).map((label, i) => `${i === 0 ? ':' : ''}${'-'.repeat(label.length - 1)}${i !== 0 ? ':' : ''}`).join(' | ')} |`)
    BENCHMARKS.forEach((name) => {
        const row = Object.entries(labels).map(([key, label], i) => {
            const method = i === 0 ? 'padEnd' : 'padStart';
            const len = label.length;
            return `${frameworks[name][key].label}`[method](len);
        }).join(' | ');
        table.push(`| ${row} |`);
    })

    const README = `./benchmark/README.md`;
    const text = await fse.readFile(README).then(res => res.toString());
    const newText = text.replace(/(?<=\<!--\s*TABLE\s*-->\n)(.*)(?=<!--\s*ENDTABLE\s*-->)/gms, table.join('\n') + '\n\n');
    await fse.writeFile(README, newText);

    console.log(table.join('\n'))
}

run();
