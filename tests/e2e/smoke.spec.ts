import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

test('the catalog renders under /learn', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сквозь время');
});

// 27.10: the map rendered on the server and then hydrated into «Что-то сломалось»: two required
// concepts taught by one lesson gave two edges the same key (each_key_duplicate). Every page
// must survive hydration with the whole course in it, not only the server render.
for (const [route, title] of [
	['./map/', 'Карта курса'],
	['./review/', null],
	['./gallery/', null],
	['./settings/', null]
] as const)
	test(`${route} survives hydration`, async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('console', (m) => m.type() === 'error' && !m.text().includes('cloudflareinsights') && errors.push(m.text()));
		await page.goto(route);
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Что-то сломалось');
		if (title) await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
		expect(errors).toEqual([]);
	});

test('a returning person is sent to the next lesson, from the hashed lesson list, online and offline', async ({ page, context }) => {
	const index: string[] = [];
	page.on('request', (r) => {
		if (/\/data\/home-[0-9a-f]{12}\.json$/.test(r.url())) index.push(r.url());
	});
	await page.goto('./');
	await page.waitForLoadState('networkidle');
	expect(index).toEqual([]); // a first visit does not fetch it
	await page.goto('./course/web/prologue/');
	await page.waitForLoadState('networkidle'); // the skip's handler is attached by then
	await page.getByRole('link', { name: 'Пропустить вступление' }).click();
	await page.waitForURL(/\/map\/$/);
	// the skip's write to the store may land after the map opens: reload the catalog until it has
	await expect(async () => {
		await page.goto('./');
		await expect(page.getByRole('link', { name: 'Продолжить: Как устроен этот учебник' })).toBeVisible({ timeout: 1000 });
	}).toPass({ timeout: 10_000 });
	expect(index.length).toBeGreaterThan(0);
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload(); // the worker controls the page from here on
	await expect(page.getByRole('link', { name: /^Продолжить:/ })).toBeVisible();
	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('link', { name: 'Продолжить: Как устроен этот учебник' })).toBeVisible();
	await context.setOffline(false);
});

// Every lesson, not a sample: the QA pass of 28.10.2026 loaded all of them in Chromium, and a
// diagram or a lesson body that throws on hydration would show only here. One test per part,
// so a failure names the part.
const lessonsByPart = new Map<string, string[]>();
for (const part of readdirSync('content/ru').sort())
	lessonsByPart.set(part, readdirSync(`content/ru/${part}`).filter((f) => f.endsWith('.svx')).sort().map((f) => f.slice(0, -4)));

for (const [part, lessons] of lessonsByPart)
	test(`every lesson of ${part} hydrates without an error`, async ({ page }) => {
		test.setTimeout(30_000 + lessons.length * 10_000);
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
		for (const lesson of lessons) {
			await page.goto(`./lesson/${part}/${lesson}/`);
			// .first(): 00-start/02's diagram shows a 1991 page with an h1 of its own, once it has loaded
			await expect(page.getByRole('heading', { level: 1 }).first()).not.toHaveText('Что-то сломалось');
			await expect(page.locator('.theory .prose')).toBeVisible();
		}
		expect(errors).toEqual([]);
	});
