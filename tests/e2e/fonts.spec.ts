// The built site names no font host but its own (docs/design-notes.md, Fonts), the first screen
// sets the textbook's faces from same-origin files, and offline it still has them.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = (dir: string): string[] =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? files(p) : [p];
	});

test('no built file references Google Fonts, and no font is inlined as data:', () => {
	const text = files('build').filter((p) => /\.(html|css|js|json|webmanifest)$/.test(p));
	expect(text.length).toBeGreaterThan(10);
	for (const p of text) {
		const s = readFileSync(p, 'utf8');
		expect(s, p).not.toMatch(/googleapis\.com|gstatic\.com/);
		expect(s, p).not.toMatch(/data:font\/|data:application\/font/);
	}
	const fonts = files('build/_app/immutable/assets').filter((p) => p.endsWith('.woff2'));
	expect(fonts.length).toBeGreaterThan(0);
	expect(fonts.length).toBeLessThanOrEqual(12); // 4 faces (Literata, its italic, Plex Sans, Mono) × 3 subsets
});

test('the first screen sets the faces from same-origin files, and offline they come from the cache', async ({ page, context }) => {
	const fontHosts = new Set<string>();
	page.on('request', (r) => {
		if (r.resourceType() === 'font') fontHosts.add(new URL(r.url()).origin);
	});
	await page.goto('./');
	await page.evaluate(() => document.fonts.ready);
	expect([...fontHosts]).toEqual([new URL(page.url()).origin]);
	const faces = () =>
		page.evaluate(async () => {
			await document.fonts.ready;
			return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`);
		});
	expect(await faces()).toEqual(expect.arrayContaining(['Literata 400', 'IBM Plex Sans 400']));

	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload(); // the worker controls the page from here on
	const cached = await page.evaluate(async () => {
		const c = await caches.open((await caches.keys()).find((k) => k.startsWith('learn-'))!);
		return (await c.keys()).map((r) => r.url).filter((u) => u.endsWith('.woff2'));
	});
	expect(cached.length).toBeGreaterThan(0);

	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сквозь время');
	expect(await faces()).toEqual(expect.arrayContaining(['Literata 400', 'IBM Plex Sans 400']));
	await context.setOffline(false);
});
