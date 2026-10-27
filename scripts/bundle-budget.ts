// npm run budget: the JavaScript the home route loads, gzipped, against the 150 KB budget
// (spec §6). It starts from build/index.html (its module preloads and entry imports) and follows
// each chunk's static imports; dynamic import() is lazy by design and is not counted, which is
// how CodeMirror, the practice, the store and the guide's model stay out of the first route.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUILD = 'build';
const BUDGET = 150 * 1024;
const html = readFileSync(join(BUILD, 'index.html'), 'utf8');

const seen = new Map<string, number>();
const queue = [...html.matchAll(/(?:\.\/|\/learn\/|\/)?(_app\/immutable\/[^"'\s)]+\.js)/g)].map((m) => normalize(join(BUILD, m[1])));

while (queue.length) {
	const file = queue.pop()!;
	if (seen.has(file) || !existsSync(file)) continue;
	const src = readFileSync(file);
	seen.set(file, gzipSync(src, { level: 9 }).length);
	const text = src.toString('utf8');
	// static imports only: `import x from "./a.js"`, `import "./a.js"`, `export … from "./a.js"`
	for (const m of text.matchAll(/(?:^|[;\s}])(?:import|export)\s*(?:[\w$*{}\s,]+\s*from\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g))
		queue.push(normalize(join(dirname(file), m[1])));
}

const total = [...seen.values()].reduce((a, b) => a + b, 0);
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
for (const [f, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${kb(n).padStart(9)}  ${f.slice(BUILD.length + 1)}`);
console.log(`first route: ${seen.size} JS files, ${kb(total)} gzipped (budget ${kb(BUDGET)})`);
process.exit(total > BUDGET ? 1 : 0);
