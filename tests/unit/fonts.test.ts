// The fonts are the app's own (docs/design-notes.md, Fonts): every face is a woff2 file beside
// design/tokens.css, under its licence, behind font-display: swap; nothing names Google's font
// hosts; and the three subsets scripts/sync-tokens.sh keeps cover every letter the course sets.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync('design/tokens.css', 'utf8');
const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => {
	const block = m[1];
	const prop = (p: string) => new RegExp(`${p}:\\s*([^;]+);`).exec(block)?.[1].trim() ?? '';
	const ranges = prop('unicode-range')
		.split(',')
		.map((r) => r.trim().replace(/^U\+/, '').split('-'))
		.map(([a, z]) => [parseInt(a, 16), parseInt(z ?? a, 16)] as const);
	return { family: prop('font-family').replace(/['"]/g, ''), display: prop('font-display'), src: prop('src'), ranges };
});

function files(dir: string, ext: RegExp): string[] {
	return readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? files(p, ext) : ext.test(f) ? [p] : [];
	});
}

describe('fonts', () => {
	it('are local woff2 files, swapped in, three families under their licences', () => {
		expect(faces.length).toBeGreaterThan(0);
		for (const f of faces) {
			const url = /^url\(\.\/fonts\/([\w.-]+\.woff2)\) format\('woff2'\)$/.exec(f.src);
			expect(url, f.src).not.toBeNull();
			expect(existsSync(join('design/fonts', url![1])), url![1]).toBe(true);
			expect(f.display).toBe('swap');
		}
		expect(new Set(faces.map((f) => f.family))).toEqual(new Set(['Literata', 'IBM Plex Sans', 'JetBrains Mono']));
		for (const l of ['OFL-literata.txt', 'OFL-ibmplexsans.txt', 'OFL-jetbrainsmono.txt'])
			expect(readFileSync(join('design/fonts', l), 'utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1');
	});

	it('come from no third party: no source names Google Fonts, and the CSP allows fonts from self only', () => {
		const sources = [...files('src', /\.(ts|svelte|css|html)$/), ...files('static', /./), 'design/tokens.css', 'vite.config.ts'];
		for (const p of sources) expect(readFileSync(p, 'utf8'), p).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
		const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(readFileSync('src/app.html', 'utf8'))![1];
		expect(csp).toContain("font-src 'self';");
		expect(csp).not.toMatch(/google/);
	});

	it('cover every letter and digit the course sets (else add the subset in scripts/sync-tokens.sh)', () => {
		// Each family is cut to the same subsets, so one family's ranges stand for all three.
		const covered = (c: number) => faces.some((f) => f.family === 'IBM Plex Sans' && f.ranges.some(([a, z]) => c >= a && c <= z));
		const missing = new Map<string, string>();
		for (const p of [...files('content', /\.(svx|svelte|ts|md|yaml|json)$/), ...files('src', /\.(ts|svelte|json)$/)])
			for (const ch of readFileSync(p, 'utf8'))
				if (/[\p{L}\p{N}]/u.test(ch) && !covered(ch.codePointAt(0)!) && !missing.has(ch)) missing.set(ch, p);
		expect([...missing].map(([ch, p]) => `${ch} U+${ch.codePointAt(0)!.toString(16).toUpperCase()} in ${p}`)).toEqual([]);
	});
});
