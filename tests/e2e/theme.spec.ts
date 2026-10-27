import { test, expect } from '@playwright/test';

const bg = (page: import('@playwright/test').Page) =>
	page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('Ink by default, Paper when chosen', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('./');
	expect(await bg(page)).toBe('rgb(10, 11, 9)');
	await page.evaluate(() => localStorage.setItem('learn.theme', 'paper'));
	await page.reload();
	expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('paper');
	expect(await bg(page)).toBe('rgb(233, 227, 210)');
});
