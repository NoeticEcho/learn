import { test, expect, type Page } from '@playwright/test';

const answers = { who: 'Анна Берёзкина, кондитер', forWhom: 'соседи по району', action: 'Заказать торт' };

async function answer(page: Page) {
	await page.getByLabel('Кто вы, или что за идея?').fill(answers.who);
	await page.getByLabel('Для кого этот сайт?').fill(answers.forWhom);
	await page.getByLabel('Что посетитель должен сделать?').fill(answers.action);
	await page.getByRole('button', { name: 'Собрать мой сайт' }).click();
}

const stage = (page: Page) => page.locator('figure.stage');

async function nextUntil(page: Page, era: string) {
	for (let i = 0; i < 8; i++) {
		const now = await stage(page).getAttribute('data-era');
		if (now === era) break;
		await page.getByRole('button', { name: 'Следующая эпоха' }).click();
		await expect(stage(page)).not.toHaveAttribute('data-era', now!);
	}
	await expect(stage(page)).toHaveAttribute('data-era', era);
}

test('the prologue asks three questions', async ({ page }) => {
	await page.goto('./course/web/prologue/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сеть насквозь');
	await expect(page.getByRole('textbox')).toHaveCount(3);
});

test('the answers appear in 1991 and again in 2025', async ({ page }) => {
	await page.goto('./course/web/prologue/');
	await answer(page);
	await expect(stage(page)).toHaveAttribute('data-era', '1991');
	await expect(stage(page)).toContainText(answers.who);
	await expect(stage(page)).toContainText(answers.forWhom);
	await expect(stage(page)).toContainText(answers.action);
	await nextUntil(page, '2025');
	await expect(stage(page)).toContainText(answers.who);
	await expect(stage(page)).toContainText(answers.action);
	await nextUntil(page, 'iskin');
	await page.getByRole('button', { name: 'Следующая эпоха' }).click();
	await expect(page.getByRole('heading', { name: 'Сейчас вы сделаете это сами.' })).toBeVisible();
});

test('«Пропустить» goes to the map, and the course then offers the next lesson, not the prologue', async ({ page }) => {
	await page.goto('./course/web/');
	await expect(page.getByRole('link', { name: 'Начать со вступления' })).toBeVisible();
	await page.goto('./course/web/prologue/');
	await page.waitForLoadState('networkidle'); // the skip's handler is attached by then
	await page.getByRole('link', { name: 'Пропустить вступление' }).click();
	await expect(page).toHaveURL(/\/learn\/map\/$/);
	// the skip's write to the store may land after the map opens
	await expect(async () => {
		await page.goto('./course/web/');
		await expect(page.getByRole('link', { name: /^Продолжить:/ })).toBeVisible({ timeout: 1000 });
	}).toPass({ timeout: 10_000 });
	await expect(page.getByRole('link', { name: 'Начать со вступления' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Посмотреть вступление ещё раз' })).toHaveAttribute('href', /course\/web\/prologue\/$/);
});

test('the answers are saved as the person’s brief', async ({ page }) => {
	await page.goto('./course/web/prologue/');
	await answer(page);
	await expect(stage(page)).toBeVisible();
	const brief = await page.evaluate(
		() =>
			new Promise<Record<string, unknown>>((done) => {
				const r = indexedDB.open('learn');
				r.onsuccess = () => {
					const out: Record<string, unknown> = {};
					const cur = r.result.transaction('persona').objectStore('persona').openCursor();
					cur.onsuccess = () => {
						const c = cur.result;
						if (c) {
							out[String(c.key)] = c.value;
							c.continue();
						} else done(out);
					};
				};
			})
	);
	expect(brief).toMatchObject({ title: answers.who, who: answers.who, forWhom: answers.forWhom, mainAction: { label: answers.action, kind: 'buy' } });
});

test.describe('under reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });
	test('it is a still filmstrip stepped by «Следующая эпоха»', async ({ page }) => {
		await page.goto('./course/web/prologue/');
		await answer(page);
		await expect(page.locator('[data-mode="filmstrip"]')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Пауза' })).toHaveCount(0);
		await page.waitForTimeout(1200);
		expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);
		await expect(stage(page)).toHaveAttribute('data-era', '1991');
		await page.getByRole('button', { name: 'Следующая эпоха' }).click();
		await expect(stage(page)).toHaveAttribute('data-era', '1996');
	});
});
