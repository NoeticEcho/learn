import { test, expect } from '@playwright/test';

test('home renders under /learn', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сквозь время');
});
