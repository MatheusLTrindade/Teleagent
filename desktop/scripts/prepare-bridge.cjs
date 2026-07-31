const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..', '..');
const staging = path.join(__dirname, '..', 'bridge-staging');

fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

const outfile = path.join(staging, 'bridge.cjs');

esbuild.buildSync({
	entryPoints: [path.join(root, 'src', 'index.ts')],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	outfile,
	target: 'node20',
	sourcemap: false,
	logLevel: 'info',
});

if (!fs.existsSync(outfile) || fs.statSync(outfile).size < 1) {
	throw new Error(`prepare-bridge failed: missing or empty ${outfile}`);
}

fs.writeFileSync(
	path.join(staging, 'package.json'),
	JSON.stringify({ name: 'teleagent-bridge', private: true }, null, 2) + '\n',
);

console.log('bridge-staging ready:', outfile);
