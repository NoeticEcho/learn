import { test, expect } from '@playwright/test';

const BRIEF = './lesson/00-start/04-brief/';

test('the brief lesson edits the whole brief inline, and settings shows the same brief', async ({ page }) => {
	await page.goto(BRIEF);
	const editor = page.locator('.brief[data-loaded="true"]');
	await expect(editor).toBeVisible();
	await editor.getByLabel('Раздел 1', { exact: true }).fill('Кто я');
	await editor.getByRole('button', { name: 'Добавить раздел' }).click();
	await page.keyboard.insertText('Блог');
	await editor.getByLabel('Что посетитель делает, одной фразой').fill('Написать мне');
	await editor.getByRole('radio', { name: 'Тёплый' }).check();
	await expect(editor.getByRole('status')).toHaveText('Сохранено.');
	await page.waitForTimeout(600);

	await page.goto('./settings/');
	const again = page.locator('.brief[data-loaded="true"]');
	await expect(again.getByLabel('Раздел 1', { exact: true })).toHaveValue('Кто я');
	await expect(again.getByLabel('Что посетитель делает, одной фразой')).toHaveValue('Написать мне');
	await expect(again.getByRole('radio', { name: 'Тёплый' })).toBeChecked();
	const sections = again.getByRole('textbox', { name: /^Раздел \d+$/ });
	await expect(sections.last()).toHaveValue('Блог');
});

test('the brief editor fits a phone: no sideways scroll, and every control is reachable', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('./settings/');
	await expect(page.locator('.brief[data-loaded="true"]')).toBeVisible();
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow).toBeLessThanOrEqual(0);
	const narrowest = await page.locator('.brief input, .brief textarea, .brief select').evaluateAll((els) =>
		Math.max(...els.map((e) => e.getBoundingClientRect().right))
	);
	expect(narrowest).toBeLessThanOrEqual(375);
});
