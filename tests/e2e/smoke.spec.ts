import { test, expect } from '@playwright/test';

test('home renders under /learn', async ({ page }) => {
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
