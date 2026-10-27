import { test, expect } from '@playwright/test';

test('«Скачать курс целиком», then a lesson never visited opens offline', async ({ page, context }) => {
	await page.goto('./');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	// the worker controls the page only after a reload; the button talks to it through `ready`
	await page.reload();
	await page.getByRole('button', { name: 'Скачать курс целиком' }).click();
	await expect(page.getByText(/готово/)).toBeVisible({ timeout: 20_000 });
	await context.setOffline(true);
	await page.goto('./lesson/00-start/01-how-to-learn/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Как устроен этот учебник');
	await context.setOffline(false);
});
