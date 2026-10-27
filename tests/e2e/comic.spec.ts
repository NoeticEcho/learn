import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The comic rail (src/lib/comic): beside the theory from 1100 px, never over it; text a screen
// reader hears; a panel reveal for those who have not asked for less motion, and none for those
// who have.
const lesson = './lesson/01-internet/05-dns/';

const boxes = (page: Page) =>
	page.evaluate(() => {
		const r = (el: Element | null) => el!.getBoundingClientRect();
		const comic = r(document.querySelector('.comic'));
		const prose = r(document.querySelector('.theory .prose'));
		const blocks = [...document.querySelectorAll('.theory .prose > *')].map((e) => r(e)).filter((b) => b.width > 0);
		return {
			comic: { left: comic.left, right: comic.right, top: comic.top, bottom: comic.bottom },
			proseRight: prose.right,
			widest: Math.max(...blocks.map((b) => b.right)),
			page: document.documentElement.scrollWidth,
			vw: innerWidth
		};
	});

for (const scheme of ['dark', 'light'] as const)
	test(`the comic has no accessibility problems (${scheme})`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(lesson);
		await page.locator('.comic').evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
		const result = await new AxeBuilder({ page }).include('.comic').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
		expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
	});

for (const width of [1100, 1280, 1440, 1600])
	test(`the comic sits beside the theory at ${width} px, never over it`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(lesson);
		const b = await boxes(page);
		expect(b.comic.left).toBeGreaterThanOrEqual(b.proseRight + 24);
		expect(b.comic.left).toBeGreaterThanOrEqual(b.widest);
		expect(b.comic.right).toBeLessThanOrEqual(b.vw);
		expect(b.page).toBeLessThanOrEqual(b.vw);
		// Sticky: after a scroll through the theory the rail is still on screen, still clear of the text.
		await page.evaluate(() => window.scrollTo(0, 1600));
		await page.waitForTimeout(100);
		const after = await boxes(page);
		expect(after.comic.bottom).toBeGreaterThan(0);
		expect(after.comic.top).toBeLessThan(900);
		expect(after.comic.left).toBeGreaterThanOrEqual(after.proseRight + 24);
	});

test('the comic speaks in text, and the drawing is hidden', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto(lesson);
	const comic = page.getByRole('complementary', { name: 'Комикс к уроку' });
	await expect(comic).toBeVisible();
	await expect(comic.getByRole('listitem')).toHaveCount(3);
	await expect(comic.getByText('Где живёт example.ru?')).toBeVisible();
	await expect(comic.getByText('Корневой сервер:', { exact: false })).toHaveCount(1);
	for (const svg of await comic.locator('svg.scene').all()) await expect(svg).toHaveAttribute('aria-hidden', 'true');
});

test('below 1100 px it is a strip under the header that scrolls sideways, not the page', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto(lesson);
	const strip = page.locator('.comic ol');
	await expect(strip).toBeVisible();
	const m = await page.evaluate(() => {
		const s = document.querySelector('.comic ol')!;
		const h1 = document.querySelector('h1')!.getBoundingClientRect();
		const prose = document.querySelector('.theory .prose')!.getBoundingClientRect();
		return {
			scrolls: s.scrollWidth > s.clientWidth,
			tab: s.getAttribute('tabindex'),
			below: s.getBoundingClientRect().top > h1.bottom,
			above: s.getBoundingClientRect().bottom <= prose.top,
			page: document.documentElement.scrollWidth
		};
	});
	expect(m).toEqual({ scrolls: true, tab: '0', below: true, above: true, page: 375 });
});

test('the panels arrive with a short reveal', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto(lesson);
	const name = await page.locator('.comic li').first().evaluate((el) => getComputedStyle(el).animationName);
	expect(name).not.toBe('none');
});

test.describe('under reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });
	test('nothing in the comic moves', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(lesson);
		const running = await page.locator('.comic').evaluate((el) => el.getAnimations({ subtree: true }).length);
		expect(running).toBe(0);
		const name = await page.locator('.comic li').first().evaluate((el) => getComputedStyle(el).animationName);
		expect(name).toBe('none');
	});
});
