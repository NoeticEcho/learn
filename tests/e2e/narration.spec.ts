// The lesson's player (docs/narration.md). The audio itself lives in NoeticEcho/learn-audio and
// is not part of this build, so every request for it is answered with a three-second fixture:
// what is tested is the player, not the recording. The lesson is the first one the committed
// manifest narrates whose page offers «Слушать» (a lesson whose text changed since it was
// rendered does not, by design).
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('content/narration/ru.json', 'utf8')) as { lessons: Record<string, { sections: unknown[] }> };
const fixture = readFileSync('tests/fixtures/narration.opus');
const candidates = Object.keys(manifest.lessons).sort();

async function audioRoute(page: Page) {
	const asked: string[] = [];
	await page.route('**/learn-audio/**', (route) => {
		asked.push(new URL(route.request().url()).pathname);
		return route.fulfill({ status: 200, body: fixture, contentType: 'audio/ogg', headers: { 'accept-ranges': 'none' } });
	});
	return asked;
}

async function narratedLesson(page: Page): Promise<string> {
	for (const id of candidates) {
		await page.goto(`./lesson/${id}/`);
		if (await page.locator('[data-narration]').count()) return id;
	}
	throw new Error('no lesson offers «Слушать»: render the narration (docs/narration.md) or check the manifest');
}

const state = (page: Page) =>
	page.evaluate(() => {
		const a = document.querySelector<HTMLAudioElement>('#narration-player audio')!;
		return { src: a.currentSrc, rate: a.playbackRate, paused: a.paused, title: navigator.mediaSession?.metadata?.title ?? null };
	});

test.describe('narration', () => {
	test.skip(!candidates.length, 'the manifest narrates no lesson yet');

	test('plays section by section, marks the section, jumps, changes speed and remembers', async ({ page }) => {
		const asked = await audioRoute(page);
		const id = await narratedLesson(page);
		await expect(page.getByText('Озвучено синтезом речи (Qwen3-TTS), голос не принадлежит человеку.')).toBeVisible();

		await page.getByRole('button', { name: /^Слушать/ }).click();
		const player = page.getByRole('region', { name: 'Озвучка урока' });
		await expect(player).toBeVisible();
		await expect(player.getByText(/^Раздел 1 из \d+$/)).toBeVisible();
		// the intro is the title, the «Зачем» and the definition
		await expect(page.locator('h1[data-narrating]')).toHaveCount(1);
		await expect.poll(() => asked.length).toBeGreaterThan(0);
		expect(asked[0]).toMatch(new RegExp(`^/learn-audio/ru/${id}/intro-[0-9a-f]{16}\\.opus$`));
		await expect.poll(async () => (await state(page)).paused).toBe(false);
		expect((await state(page)).title).toBe(await page.locator('h1').innerText());

		// pause and play from the keyboard
		const toggle = player.getByRole('button', { name: 'Пауза' });
		await toggle.focus();
		await page.keyboard.press('Enter');
		await expect.poll(async () => (await state(page)).paused).toBe(true);
		await player.getByRole('button', { name: 'Слушать' }).press('Space');
		await expect.poll(async () => (await state(page)).paused).toBe(false);

		// the next section: its heading is marked on the page
		await player.getByRole('button', { name: 'Следующий раздел' }).click();
		await expect(player.getByText(/^Раздел 2 из \d+$/)).toBeVisible();
		await expect(page.locator('.prose > h2[data-narrating]')).toHaveCount(1);
		await expect(page.locator('h1[data-narrating]')).toHaveCount(0);

		// speed
		await player.getByLabel('Скорость').selectOption('1.25');
		await expect.poll(async () => (await state(page)).rate).toBe(1.25);

		// jump from the list
		await player.getByRole('button', { name: 'Разделы' }).click();
		const items = player.locator('#narration-sections li button');
		const n = await items.count();
		expect(n).toBeGreaterThanOrEqual(3);
		await items.nth(2).click();
		await expect(player.getByText(new RegExp(`^Раздел 3 из ${n}$`))).toBeVisible();
		const heading = (await page.locator('.prose > h2[data-narrating]').innerText()).trim();
		await expect.poll(async () => (await state(page)).title).toBe(heading);

		// the section reached is remembered, and so is the speed
		await page.waitForTimeout(300);
		await page.reload();
		await page.getByRole('button', { name: /^Слушать/ }).click();
		await expect(page.getByRole('region', { name: 'Озвучка урока' }).getByText(new RegExp(`^Раздел 3 из ${n}$`))).toBeVisible();
		await expect.poll(async () => (await state(page)).rate).toBe(1.25);

		// close: nothing stays marked
		await page.getByRole('button', { name: 'Закрыть озвучку' }).click();
		await expect(page.locator('[data-narrating]')).toHaveCount(0);
		await expect(page.getByRole('region', { name: 'Озвучка урока' })).toHaveCount(0);
	});

	test('a downloaded lesson plays without the network, from its own cache', async ({ page, context }) => {
		await audioRoute(page);
		await narratedLesson(page);
		await page.getByRole('button', { name: /^Слушать/ }).click();
		const player = page.getByRole('region', { name: 'Озвучка урока' });
		await player.getByRole('button', { name: 'Разделы' }).click();
		await player.getByRole('button', { name: 'Скачать озвучку для офлайна' }).click();
		await expect(player.getByText('Озвучка скачана: её можно слушать без сети.')).toBeVisible();
		const files = await page.evaluate(async () => (await (await caches.open('narration')).keys()).length);
		expect(files).toBe(await player.locator('#narration-sections li').count());
		// nothing else was put in it, and nothing in the build's own cache
		const inShell = await page.evaluate(async () => {
			const names = (await caches.keys()).filter((k) => k !== 'narration');
			const all = await Promise.all(names.map(async (k) => (await (await caches.open(k)).keys()).map((r) => r.url)));
			return all.flat().filter((u) => u.includes('/learn-audio/')).length;
		});
		expect(inShell).toBe(0);

		await page.unroute('**/learn-audio/**');
		await context.setOffline(true);
		await player.getByRole('button', { name: 'Следующий раздел' }).click();
		await expect.poll(async () => (await state(page)).src).toMatch(/^blob:/);
		await expect(player.getByRole('alert')).toHaveCount(0);
		await context.setOffline(false);
		await player.getByRole('button', { name: 'Удалить скачанное' }).click();
		expect(await page.evaluate(async () => (await (await caches.open('narration')).keys()).length)).toBe(0);
	});

	for (const scheme of ['dark', 'light'] as const)
		test(`the open player has no serious accessibility problems (${scheme})`, async ({ page }) => {
			await audioRoute(page);
			await page.emulateMedia({ colorScheme: scheme });
			await narratedLesson(page);
			await page.getByRole('button', { name: /^Слушать/ }).click();
			await page.getByRole('button', { name: 'Разделы' }).click();
			await expect(page.locator('#narration-sections')).toBeVisible();
			const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
			const bad = result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
			expect(bad.map((v) => `${v.id}: ${v.nodes.map((x) => x.target.join(' ')).join(' | ')}`)).toEqual([]);
		});
});
