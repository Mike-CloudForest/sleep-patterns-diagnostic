import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const vendor = fileURLToPath(new URL('../../vendor/', import.meta.url));
await mkdir(vendor, { recursive: true });
const result = await build({
  absWorkingDir: here,
  entryPoints: ['entry.js'],
  outfile: vendor + 'chart-engine.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  legalComments: 'eof',
  metafile: true,
  banner: { js: '/* Cloud Forest chart dependencies. See chart-engine.LICENSE.txt. Rebuild: npm ci && npm run build in tools/chart-engine. */' }
});
if (Object.keys(result.metafile.inputs).some(path => /(?:^|\/)ephemeris(?:\/|$)|moshier-entry/.test(path))) {
  throw new Error('The optional GPL ephemeris entry must not be bundled.');
}
const packages = ['hd-chart-engine', 'astronomy-engine', 'luxon'];
let notices = 'Pinned MIT dependencies for the Cloud Forest birth chart calculator.\n\n';
for (const name of packages) {
  const pkg = JSON.parse(await readFile(here + 'node_modules/' + name + '/package.json', 'utf8'));
  const licensePath = name === 'astronomy-engine' ? here + 'ASTRONOMY_ENGINE_LICENSE.txt'
    : here + 'node_modules/' + name + (name === 'luxon' ? '/LICENSE.md' : '/LICENSE');
  const license = await readFile(licensePath, 'utf8');
  notices += `${name} ${pkg.version}\n${'='.repeat(64)}\n${license.trim()}\n\n`;
}
notices += 'Only the MIT default hd-chart-engine path is included. Its optional GPL Moshier backend and Swiss Ephemeris are not bundled.\n';
notices += '\nBodyGraph reference data adapted from https://github.com/adamblvck/free-human-design/blob/main/src/hd/bodygraph.js\n'
  + await readFile(here + 'BODYGRAPH_REFERENCE_LICENSE.txt', 'utf8');
await writeFile(vendor + 'chart-engine.LICENSE.txt', notices);
console.log('Built vendor/chart-engine.js and its MIT notices.');
