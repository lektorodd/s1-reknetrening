// Copies MathJax from node_modules into static/, so the app serves its own
// copy: a school network that blocks a CDN still gets its maths. The version is
// pinned in package.json. Only the one component the app loads and its fonts
// are copied; MathJax finds the fonts relative to its own script.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules/mathjax/es5');
const to = join(root, 'static/mathjax');

const files = ['tex-mml-chtml.js', 'output/chtml/fonts/woff-v2'];

rmSync(to, { recursive: true, force: true });
for (const f of files) {
	mkdirSync(dirname(join(to, f)), { recursive: true });
	cpSync(join(from, f), join(to, f), { recursive: true });
}
