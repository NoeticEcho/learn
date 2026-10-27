// Эхо crossing the eras (src/lib/home/EraScene.svelte): on the returning home, on a wide screen
// only; moving there, still under reduced motion, stopped by its pause; and the line about the
// project is real text everywhere.
import { test, expect, type Page } from '@playwright/test';

async function returning(page: Page) {
	await page.goto('./');
	await page.getByRole('link', { name: 'Пропустить вступление' }).click();
	await page.waitForURL(/\/map\/$/);
	await expect(async () => {
		await page.goto('./');
		await expect(page.getByRole('link', { name: /^Продолжить:/ })).toBeVisible({ timeout: 1000 });
	}).toPass({ timeout: 10_000 });
}
const running = (page: Page) =>
	page.locator('.scene').evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length);
const project = /Проект NoeticEcho\. Последний учебник эпохи до ИИ/;

test('the project line is on the question screen, and links to NoeticEcho', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByText(project)).toBeVisible();
	await expect(page.getByRole('link', { name: 'NoeticEcho', exact: true })).toHaveAttribute('href', 'https://open.noeticecho.space/');
});

test.describe('wide', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('the scene moves beside the hero, hidden from assistive tech, and its button stops it', async ({ page }) => {
		await returning(page);
		const scene = page.locator('.scene');
		await expect(scene).toBeVisible();
		await expect(scene).toHaveAttribute('aria-hidden', 'true');
		await expect(page.getByText(project)).toBeVisible();
		await expect.poll(() => running(page)).toBeGreaterThan(0);
		const before = await page.locator('.hero h1').boundingBox();
		await page.getByRole('button', { name: 'Остановить анимацию' }).click();
		await expect.poll(() => running(page)).toBe(0);
		await page.getByRole('button', { name: 'Продолжить анимацию' }).click();
		await expect.poll(() => running(page)).toBeGreaterThan(0);
		expect(await page.locator('.hero h1').boundingBox()).toEqual(before);
	});

	test('under reduced motion it is a still, with no pause button', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await returning(page);
		await expect(page.locator('.scene')).toBeVisible();
		await page.waitForTimeout(300);
		expect(await running(page)).toBe(0);
		await expect(page.getByRole('button', { name: 'Остановить анимацию' })).toBeHidden();
	});
});

test('on a phone there is no scene, and its code is never fetched; the line is still there', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	const fetched: string[] = [];
	page.on('request', (r) => {
		if (/EraScene/.test(r.url())) fetched.push(r.url());
	});
	await returning(page);
	await expect(page.locator('.scene')).toHaveCount(0);
	await expect(page.getByText(project)).toBeVisible();
	expect(fetched).toEqual([]);
});
