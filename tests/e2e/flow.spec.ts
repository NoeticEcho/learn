import { test, expect, type Page } from '@playwright/test';

const LESSON = './lesson/02-html/01-first-page/';
const persona = { name: 'Ксения Ольховская', profession: 'Кадастровый инженер и судебный эксперт по земельным спорам', city: 'Заречье', phone: '+7 000 000-00-00' };
const solution = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>${persona.name}</title></head>
<body>
<h1>${persona.name}</h1>
<p>${persona.profession}</p>
<p>${persona.city}</p>
<p><a href="tel:${persona.phone}">Позвонить: ${persona.phone}</a></p>
</body>
</html>`;

async function writeEditor(page: Page, text: string) {
	const editor = page.locator('.cm-content').first();
	await expect(editor).toBeVisible();
	await editor.click();
	await page.keyboard.press('ControlOrMeta+a');
	await page.keyboard.press('Delete');
	await page.keyboard.insertText(text);
}

async function check(page: Page) {
	await page.getByRole('button', { name: 'Проверить' }).click();
	await expect(page.getByText('Верно.')).toBeVisible();
	await page.getByRole('button', { name: /Дальше|Посмотреть итог/ }).click();
}

async function answerQuiz(page: Page) {
	const quiz = page.getByRole('region', { name: 'Тест' });
	// 1. single
	await quiz.getByRole('radio', { name: /Язык разметки/ }).check();
	await check(page);
	// 2. multiple
	for (const o of ['<p>', '<h1>', '<a>']) await quiz.getByRole('checkbox', { name: o, exact: true }).check();
	await check(page);
	// 3. order: bubble each item up into place
	const want = ['<!doctype html>', '<html lang="ru">', '<head>', '<body>'];
	for (let i = 0; i < want.length; i++) {
		for (let guard = 0; guard < 6; guard++) {
			const items = await quiz.locator('ol.order .item').allTextContents();
			const at = items.indexOf(want[i]);
			if (at <= i) break;
			await quiz.getByRole('button', { name: `Выше: ${want[i]}` }).click();
		}
	}
	await check(page);
	// 4. match
	const pairs: [string, string][] = [
		['h1', 'главный заголовок страницы'],
		['p', 'абзац текста'],
		['a', 'ссылка'],
		['title', 'название страницы на вкладке браузера']
	];
	for (const [l, r] of pairs) await quiz.getByLabel(`Пара для «${l}»`).selectOption(r);
	await check(page);
	// 5. single
	await quiz.getByRole('radio', { name: 'tel: и номер' }).check();
	await check(page);
	// 6. code, graded in a sandbox
	await quiz.getByLabel('Ваш код').fill('<p>Привет</p>');
	await check(page);
	await expect(page.getByText('Все ответы верны.')).toBeVisible();
}

test('a lesson end to end, and progress survives export and import', async ({ page, context }) => {
	await page.goto(LESSON);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Первая страница: теги, заголовок, ссылка');

	// practice: the starter fails, the reference solution passes every check
	await expect(page.locator('[data-check="h1"]')).toHaveAttribute('data-ok', 'false');
	await writeEditor(page, solution);
	for (const id of ['h1', 'name-in-h1', 'paragraphs', 'tel-link', 'lang'])
		await expect(page.locator(`[data-check="${id}"]`)).toHaveAttribute('data-ok', 'true');

	await answerQuiz(page);

	await page.getByRole('button', { name: 'Завершить урок' }).click();
	await expect(page.getByText('Урок пройден.')).toBeVisible();

	await page.goto('./settings/');
	const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Сохранить прогресс' }).click()]);
	const file = await download.path();

	const fresh = await context.browser()!.newContext();
	const p2 = await fresh.newPage();
	await p2.goto('http://localhost:4173/learn/settings/');
	await p2.setInputFiles('input[type=file]', file!);
	await p2.getByRole('button', { name: 'Загрузить' }).click();
	await expect(p2.getByText('Прогресс загружен.')).toBeVisible();
	await p2.goto('http://localhost:4173/learn/map/');
	await expect(p2.getByTestId('lesson-02-html/01-first-page')).toHaveAttribute('data-status', 'done');
	await fresh.close();
});

test('the map opens the first lesson and locks the one that needs it', async ({ page }) => {
	await page.goto('./map/');
	await expect(page.getByTestId('lesson-00-start/01-how-to-learn')).toHaveAttribute('data-status', 'open');
	await expect(page.getByTestId('lesson-02-html/01-first-page')).toHaveAttribute('data-status', 'locked');
});

test('a video loads nothing before the click', async ({ page }) => {
	const video: string[] = [];
	page.on('request', (r) => {
		if (/youtube|ytimg|googlevideo/.test(r.url())) video.push(r.url());
	});
	await page.goto(LESSON);
	await page.getByRole('heading', { name: 'Видео' }).scrollIntoViewIfNeeded();
	await page.waitForTimeout(500);
	expect(video).toEqual([]);
	await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
});

test('two lessons of one era keep their own pages, and the gallery shows the furthest', async ({ page }) => {
	await page.goto('./lesson/00-start/03-workbench/');
	await writeEditor(page, '<h1>Верстак: моя правка</h1>');
	await page.waitForTimeout(600); // past the save debounce
	await page.goto('./lesson/00-start/04-brief/');
	const editor = page.locator('.cm-content').first();
	await expect(editor).toContainText('brief-card');
	await expect(editor).not.toContainText('Верстак: моя правка');
	await writeEditor(page, '<h1>Бриф: моя правка</h1>');
	await page.waitForTimeout(600);
	await page.goto('./lesson/00-start/03-workbench/');
	await expect(page.locator('.cm-content').first()).toContainText('Верстак: моя правка');
	await page.goto('./gallery/');
	const thumb = page.frameLocator('iframe').first();
	await expect(thumb.locator('h1')).toHaveText('Бриф: моя правка');
});
