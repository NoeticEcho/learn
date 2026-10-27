import { test, expect, type Page } from '@playwright/test';

async function write(page: Page, text: string) {
	const editor = page.locator('.cm-content').first();
	await expect(editor).toBeVisible();
	await editor.click();
	await page.keyboard.press('ControlOrMeta+a');
	await page.keyboard.press('Delete');
	await page.keyboard.insertText(text);
}

const check = (page: Page, id: string) => page.locator(`[data-check="${id}"]`);

test('typing <h1> flips the exists check', async ({ page }) => {
	await page.goto('./_dev/practice/');
	await expect(check(page, 'h1')).toHaveAttribute('data-ok', 'false');
	await write(page, '<h1>Анна Берёзкина</h1>');
	await expect(check(page, 'h1')).toHaveAttribute('data-ok', 'true');
	await expect(check(page, 'name')).toHaveAttribute('data-ok', 'true');
});

test('the preview cannot read the app', async ({ page }) => {
	await page.goto('./_dev/practice/');
	await page.getByRole('tab', { name: 'script.js' }).click();
	await write(page, 'document.body.dataset.leak = parent.document.title;');
	await expect(page.getByRole('alert')).toContainText(/Ошибка в скрипте/);
	expect(await page.evaluate(() => document.body.dataset.leak)).toBeUndefined();
	const sandbox = await page.locator('iframe').getAttribute('sandbox');
	expect(sandbox).toBe('allow-scripts');
});

test('the preview reaches no network: fetch, images and navigation are blocked', async ({ page, context }) => {
	// Chromium reports a request the CSP blocked as a `request` event that then fails with «csp»;
	// it never reaches the network. So the test counts what reaches the network (the route) and
	// what finished, and requires every attempt to have failed on the CSP.
	const hits: string[] = [];
	const failures: string[] = [];
	await context.route(/example\.(com|org)/, (route) => {
		hits.push(route.request().url());
		return route.abort();
	});
	page.on('requestfinished', (r) => {
		if (/example\.(com|org)/.test(r.url())) hits.push(r.url());
	});
	page.on('requestfailed', (r) => {
		if (/example\.(com|org)/.test(r.url())) failures.push(r.failure()?.errorText ?? '');
	});
	await page.goto('./_dev/practice/');
	await page.getByRole('tab', { name: 'script.js' }).click();
	await write(page, "fetch('https://example.com/x').catch(() => {});");
	await expect(page.getByRole('alert')).toHaveCount(0);
	await page.getByRole('tab', { name: 'index.html' }).click();
	await write(page, '<h1>x</h1><img src="https://example.org/pixel.gif">');
	await expect(check(page, 'h1')).toHaveAttribute('data-ok', 'true');
	await page.getByRole('tab', { name: 'script.js' }).click();
	await write(page, "location.href = 'https://example.com/away';");
	await page.waitForTimeout(1500);
	expect(hits).toEqual([]);
	expect(failures.every((f) => f === 'csp')).toBe(true);
});
