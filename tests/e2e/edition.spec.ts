// The English edition (docs/content-plan/README.md, «English edition»): its pages speak English
// and say so, every page of it survives hydration, the language switch finds a page's
// counterpart, a lesson not yet translated is an honest page (tested while there is one, and as a
// component always, since every lesson is translated today), the choice is remembered, and the
// two editions share one store, so progress made in one shows in the other.
import { test, expect, type APIRequestContext } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';

const PUBLIC = 'https://open.noeticecho.space/learn/';
const REFERENCE = 'lesson/00-start/01-how-to-learn/';
const translated = new Set(
	readdirSync('content/en', { recursive: true, encoding: 'utf8' })
		.filter((f) => f.endsWith('.svx'))
		.map((f) => f.slice(0, -4))
);
const FIRST = '02-html/01-first-page';

const html = async (request: APIRequestContext, path: string) => {
	const res = await request.get(path);
	expect(res.status(), path).toBe(200);
	return res.text();
};

test('an English page says it is English, in its head and its <html>', async ({ request }) => {
	const page = await html(request, `en/${REFERENCE}`);
	expect(page).toMatch(/<html lang="en"/);
	expect(page).toMatch(/<title>How this textbook works: Through Time<\/title>/);
	expect(page).toContain(`<link rel="canonical" href="${PUBLIC}en/${REFERENCE}"/>`);
	expect(page).toContain(`<link rel="alternate" hreflang="ru" href="${PUBLIC}${REFERENCE}"/>`);
	expect(page).toContain(`<link rel="alternate" hreflang="en" href="${PUBLIC}en/${REFERENCE}"/>`);
	expect(page).toContain(`<link rel="alternate" hreflang="x-default" href="${PUBLIC}${REFERENCE}"/>`);
	expect(page).toContain('<meta property="og:locale" content="en_US"/>');
	expect(page).toContain('<meta property="og:locale:alternate" content="ru_RU"/>');
	expect(page).toMatch(/"inLanguage":"en"/);
	expect(page).toMatch(/og\/en-lesson-00-start-01-how-to-learn-[0-9a-f]{10}\.png/);
	// and the Russian original names its English counterpart
	const ru = await html(request, REFERENCE);
	expect(ru).toMatch(/<html lang="ru"/);
	expect(ru).toContain(`<link rel="alternate" hreflang="en" href="${PUBLIC}en/${REFERENCE}"/>`);
});

// A lesson English has no translation of yet, while there is one: this spec named a fixed lesson
// until the translators reached it, and then four tests failed on nothing but the course's progress.
const untranslated = readdirSync('content/ru', { recursive: true, encoding: 'utf8' })
	.filter((f) => f.endsWith('.svx'))
	.map((f) => f.replace(/\.svx$/, ''))
	.sort()
	.find((id) => !existsSync(`content/en/${id}.svx`));

test('a lesson not yet translated is a noindex page that links to the Russian one', async ({ page, request }) => {
	test.skip(!untranslated, 'every lesson is translated');
	const head = await html(request, `en/lesson/${untranslated}/`);
	expect(head).toContain('<meta name="robots" content="noindex"/>');
	expect(head).not.toMatch(/rel="canonical"|hreflang="en"/);
	await page.goto(`./en/lesson/${untranslated}/`);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('This lesson isn’t in English yet');
	const original = page.getByRole('link', { name: 'Read it in Russian' });
	await expect(original).toHaveAttribute('href', new RegExp(`lesson/${untranslated}/$`));
	await original.click();
	await page.waitForURL(new RegExp(`/learn/lesson/${untranslated}/$`));
	await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test('a translated lesson is an indexable pair with its Russian original, both ways', async ({ request }) => {
	test.skip(!translated.has(FIRST), `${FIRST} is not translated`);
	const ru = await html(request, `lesson/${FIRST}/`);
	expect(ru).toContain(`<link rel="alternate" hreflang="en" href="${PUBLIC}en/lesson/${FIRST}/"/>`);
	const en = await html(request, `en/lesson/${FIRST}/`);
	expect(en).not.toContain('<meta name="robots" content="noindex"/>');
	expect(en).toContain(`<link rel="canonical" href="${PUBLIC}en/lesson/${FIRST}/"/>`);
});

test('sitemap and llms.txt: the English pages written in English, and nothing else', async ({ request }) => {
	const sitemap = await html(request, 'sitemap.xml');
	expect(sitemap).toContain(`<loc>${PUBLIC}en/</loc>`);
	expect(sitemap).toContain(`<loc>${PUBLIC}en/${REFERENCE}</loc>`);
	if (untranslated) expect(sitemap).not.toContain(`<loc>${PUBLIC}en/lesson/${untranslated}/</loc>`);
	for (const id of translated) expect(sitemap).toContain(`<loc>${PUBLIC}en/lesson/${id}/</loc>`);
	const llms = await html(request, 'en/llms.txt');
	expect(llms.startsWith('# Through Time')).toBe(true);
	expect(llms).toContain(`(${PUBLIC}en/${REFERENCE}): `);
	for (const id of translated) expect(llms).toContain(`(${PUBLIC}en/lesson/${id}/): `);
	expect((await request.get('en/llms-full.txt')).status()).toBe(200);
});

test('the switch goes to the counterpart, and the choice is remembered', async ({ page }) => {
	await page.goto(`./${REFERENCE}`);
	await page.getByRole('link', { name: 'English', exact: true }).click();
	await page.waitForURL(new RegExp(`/learn/en/${REFERENCE}$`));
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('How this textbook works');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');

	// remembered: the Russian home now sends this person to the English one
	await page.goto('./');
	await page.waitForURL(/\/learn\/en\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Through Time');

	// a lesson English does not have yet: the switch opens its part on the English map
	if (untranslated) {
		await page.goto(`./lesson/${untranslated}/`);
		const href = await page.getByRole('link', { name: 'English', exact: true }).getAttribute('href');
		expect(href).toMatch(new RegExp(`en/map/#part-${Number(untranslated.slice(0, 2))}$`));
	}

	// a lesson English has: the switch opens that lesson, from the Russian page
	if (translated.has(FIRST)) {
		await page.goto(`./lesson/${FIRST}/`);
		await page.getByRole('link', { name: 'English', exact: true }).click();
		await page.waitForURL(new RegExp(`/learn/en/lesson/${FIRST}/$`));
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your first page: tags, a heading, a link');
	}

	// back to Russian, and remembered too
	await page.goto(`./en/${REFERENCE}`);
	await page.getByRole('link', { name: 'Русский', exact: true }).click();
	await page.waitForURL(new RegExp(`/learn/${REFERENCE}$`));
	await page.goto('./');
	await expect(page).toHaveURL(/\/learn\/$/);
});

test('one store for both editions: a lesson finished in Russian is done on the English map', async ({ page }) => {
	await page.goto(`./${REFERENCE}`);
	await page.getByRole('button', { name: 'Завершить урок' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Урок пройден' })).toBeVisible();
	await page.goto('./en/map/');
	await expect(page.getByTestId(`lesson-${REFERENCE.slice(7, -1)}`)).toHaveAttribute('data-status', 'done');
	// and its cards come back in review, marked as Russian on an English page
	await page.goto('./en/review/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review');
	await expect(page.locator('.card .front')).toHaveAttribute('lang', 'ru');
});

for (const [route, title] of [
	['./en/', 'Through Time'],
	['./en/map/', 'Course map'],
	['./en/review/', 'Review'],
	['./en/gallery/', 'Gallery'],
	['./en/settings/', 'Settings']
] as const)
	test(`${route} survives hydration, in English`, async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
		await page.goto(route);
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		expect(errors).toEqual([]);
	});

// Every English page of every lesson, one test per part, as smoke.spec.ts does for Russian.
const byPart = new Map<string, string[]>();
for (const part of readdirSync('content/ru').sort())
	byPart.set(part, readdirSync(`content/ru/${part}`).filter((f) => f.endsWith('.svx')).sort().map((f) => f.slice(0, -4)));

for (const [part, lessons] of byPart)
	test(`every English page of ${part} hydrates without an error`, async ({ page }) => {
		test.setTimeout(30_000 + lessons.length * 6_000);
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
		for (const lesson of lessons) {
			await page.goto(`./en/lesson/${part}/${lesson}/`);
			const h1 = page.getByRole('heading', { level: 1 });
			await expect(h1).not.toHaveText('Something broke');
			if (translated.has(`${part}/${lesson}`)) await expect(page.locator('.theory .prose')).toBeVisible();
			else await expect(h1).toHaveText('This lesson isn’t in English yet');
		}
		expect(errors).toEqual([]);
	});
