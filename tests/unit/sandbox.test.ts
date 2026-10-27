// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { buildSrcdoc, SANDBOX_CSP } from '#lib/practice/sandbox.ts';
import type { Check } from '#lib/practice/checks.ts';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

it('puts the CSP first, before anything the person wrote', () => {
	const html = buildSrcdoc({ 'index.html': '<!doctype html><html lang="ru"><head><title>x</title></head><body><img src="https://example.com/a.png"></body></html>' }, [], {});
	expect(html.startsWith('<!doctype html>')).toBe(true);
	expect(html.indexOf('Content-Security-Policy')).toBeLessThan(html.indexOf('example.com'));
	const doc = parse(html);
	expect(doc.head.firstElementChild?.getAttribute('content')).toBe(SANDBOX_CSP);
	expect(doc.documentElement.lang).toBe('ru');
	expect(doc.title).toBe('x');
	expect(doc.querySelector('img')).toBeTruthy();
});

it('blocks the network in its CSP', () => {
	expect(SANDBOX_CSP).toMatch(/default-src 'none'/);
	expect(SANDBOX_CSP).not.toMatch(/connect-src/);
	expect(SANDBOX_CSP).toMatch(/img-src data:/);
});

it('a fragment becomes a document', () => {
	const doc = parse(buildSrcdoc({ 'index.html': '<h1>Привет</h1>' }, [], {}));
	expect(doc.querySelector('body h1')?.textContent).toBe('Привет');
});

it('carries the CSS, the script after the HTML, and the runner last', () => {
	const html = buildSrcdoc({ 'index.html': '<p>a</p>', 'styles.css': 'p{color:red}', 'script.js': 'window.x=1' }, [{ id: 'h', kind: 'exists', selector: 'h1' }], { name: 'Мария' });
	const doc = parse(html);
	expect(doc.querySelector('style')?.textContent).toContain('p{color:red}');
	const scripts = [...doc.querySelectorAll('script')].map((s) => s.textContent ?? '');
	const user = scripts.findIndex((s) => s.includes('window.x=1'));
	const runner = scripts.findIndex((s) => s.includes('learn:checks'));
	expect(user).toBeGreaterThan(-1);
	expect(runner).toBeGreaterThan(user);
	expect(html.indexOf('<p>a</p>')).toBeLessThan(html.indexOf('window.x=1'));
});

it('the person cannot close our tags from inside their CSS or script', () => {
	const html = buildSrcdoc({ 'index.html': '', 'styles.css': '</style><script>bad()</script>', 'script.js': '"</script><b>x</b>"' }, [], { name: '</script>' });
	const doc = parse(html);
	expect(doc.querySelector('b')).toBeNull();
	expect([...doc.querySelectorAll('script')].some((s) => s.textContent === 'bad()')).toBe(false);
});

it('checks see the person’s document, not what the sandbox adds to it', async () => {
	const { evaluate, facts } = await import('#lib/practice/checks.ts');
	const checks: Check[] = [
		{ id: 'no-script', kind: 'noTag', tags: ['script'] },
		{ id: 'no-style', kind: 'noTag', tags: ['style'] },
		{ id: 'no-meta', kind: 'count', selector: 'meta', max: 0 },
		{ id: 'one-script', kind: 'count', selector: 'script', max: 0 }
	];
	const page = { 'index.html': '<h1>Привет</h1>', 'styles.css': 'h1{color:red}', 'script.js': 'window.x=1' };
	const clean = parse(buildSrcdoc(page, checks, {}));
	expect(evaluate(clean, window, checks, facts(checks, {})).map((r) => r.ok)).toEqual([true, true, true, true]);
	const own = parse(buildSrcdoc({ 'index.html': '<style>h1{}</style><h1>x</h1><script>1</script>' }, checks, {}));
	expect(evaluate(own, window, checks, facts(checks, {})).map((r) => r.ok)).toEqual([false, false, true, false]);
});
