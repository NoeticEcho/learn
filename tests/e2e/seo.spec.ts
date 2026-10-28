// What a search engine, an answer engine and a messenger read from the built site: each page's
// head (title, description, canonical, Open Graph, the Twitter card, JSON-LD), the files beside
// the pages (the cards, sitemap.xml, robots.txt, llms.txt), the lesson's text in the HTML
// itself, and the share buttons. Telegram and VK build a preview from og:title, og:description
// and og:image without running scripts, so every check here reads the HTML as served.
import { test, expect, type APIRequestContext } from '@playwright/test';

const LESSON = 'lesson/02-html/01-first-page/';
const PUBLIC = 'https://open.noeticecho.space/learn/';

const head = async (request: APIRequestContext, path: string) => {
	const res = await request.get(path);
	expect(res.status(), path).toBe(200);
	const html = await res.text();
	const meta = (key: string) => html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
	const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((m) => JSON.parse(m[1]));
	const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
	return { html, meta, ld, canonical };
};
/** The public address of a built file, fetched from the server under test. */
const local = (url: string) => url.replace(PUBLIC, './');
const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");

test('a lesson’s head: description, canonical, Open Graph, the card, and its structured data', async ({ request }) => {
	const { html, meta, ld, canonical } = await head(request, LESSON);
	expect(html).toMatch(/<title>Первая страница: теги, заголовок, ссылка: Сквозь время<\/title>/);
	const description = decode(meta('description')!);
	expect(description.length).toBeLessThanOrEqual(160);
	expect(description).toMatch(/^HTML — язык разметки/);
	expect(canonical).toBe(`${PUBLIC}${LESSON}`);
	expect(meta('og:url')).toBe(canonical);
	expect(meta('og:type')).toBe('article');
	expect(meta('og:locale')).toBe('ru_RU');
	expect(meta('og:site_name')).toBe('Сквозь время');
	expect(meta('og:title')).toBe('Первая страница: теги, заголовок, ссылка');
	expect(meta('og:description')!.length).toBeGreaterThan(50);
	expect(meta('twitter:card')).toBe('summary_large_image');
	expect(decode(meta('og:image:alt')!)).toContain('Первая страница');
	expect(meta('twitter:image')).toBe(meta('og:image'));
	expect(html).not.toMatch(/rel="alternate" hreflang/); // not translated into English yet

	const image = meta('og:image')!;
	expect(image).toMatch(new RegExp(`^${PUBLIC}og/lesson-02-html-01-first-page-[0-9a-f]{10}\\.png$`));
	const png = await request.get(local(image));
	expect(png.status()).toBe(200);
	expect(png.headers()['content-type']).toBe('image/png');
	const body = await png.body();
	expect([body.readUInt32BE(16), body.readUInt32BE(20)]).toEqual([1200, 630]);
	expect(body.length).toBeLessThan(300 * 1024);

	const [resource, crumbs] = ld;
	expect(resource).toMatchObject({
		'@type': 'LearningResource',
		name: 'Первая страница: теги, заголовок, ссылка',
		description,
		url: canonical,
		inLanguage: 'ru',
		image,
		isPartOf: { '@type': 'Course', '@id': `${PUBLIC}#course` },
		timeRequired: 'PT25M',
		license: 'https://creativecommons.org/licenses/by-sa/4.0/'
	});
	expect(resource.teaches.length).toBeGreaterThan(0);
	expect(resource.citation.length).toBeGreaterThanOrEqual(2);
	expect(resource.dateModified).toMatch(/^\d{4}-\d\d-\d\d$/);
	expect(crumbs['@type']).toBe('BreadcrumbList');
	expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual(['Сквозь время', 'Карта курса', 'Часть 2. HTML', resource.name]);
});

test('the lesson’s text is in the HTML as served, definition first', async ({ request }) => {
	const { html } = await head(request, 'lesson/01-internet/05-dns/');
	const definition = html.match(/<p class="definition[^"]*">([^<]+)/)?.[1];
	expect(definition).toMatch(/^DNS — /);
	// the body's headings and a paragraph deep in it, not only the first screen
	for (const text of ['Телефонная книга сети', 'Путь одного запроса', 'Резолвер сохраняет ответ у себя']) expect(html).toContain(text);
	expect(html.indexOf(definition!)).toBeLessThan(html.indexOf('Телефонная книга сети'));
});

test('home: a Course and a WebSite, the home card; the map: breadcrumbs and every lesson', async ({ request }) => {
	const home = await head(request, './');
	expect(home.canonical).toBe(PUBLIC);
	const types = home.ld.map((d) => d['@type']);
	expect(types).toEqual(['Course', 'WebSite']);
	expect(home.ld[0]).toMatchObject({ '@id': `${PUBLIC}#course`, name: 'Сквозь время', provider: { name: 'NoeticEcho' }, inLanguage: 'ru' });
	expect(home.meta('og:image')).toMatch(/\/og\/home-[0-9a-f]{10}\.png$/);
	expect((await request.get(local(home.meta('og:image')!))).status()).toBe(200);

	const map = await head(request, 'map/');
	expect(map.canonical).toBe(`${PUBLIC}map/`);
	const list = map.ld.find((d) => d['@type'] === 'ItemList');
	expect(list.itemListElement.length).toBeGreaterThan(100);
	expect(list.itemListElement[0]).toMatchObject({ position: 1, url: expect.stringMatching(/^https:\/\/open\.noeticecho\.space\/learn\/lesson\//) });
});

test('the learner’s own screens are not indexed and name no canonical', async ({ request }) => {
	for (const path of ['review/', 'settings/', 'gallery/']) {
		const { html, canonical } = await head(request, path);
		expect(html, path).toContain('<meta name="robots" content="noindex"/>');
		expect(canonical, path).toBeUndefined();
	}
});

test('sitemap.xml, robots.txt and llms.txt are served, and the sitemap’s pages exist', async ({ request }) => {
	const sitemap = await (await request.get('sitemap.xml')).text();
	const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	expect(locs.length).toBeGreaterThan(100);
	for (const loc of locs.slice(0, 5)) expect((await request.get(local(loc))).status(), loc).toBe(200);
	expect(await (await request.get('robots.txt')).text()).toContain(`Sitemap: ${PUBLIC}sitemap.xml`);
	const llms = await request.get('llms.txt');
	expect(llms.headers()['content-type']).toMatch(/text\/plain/);
	expect(await llms.text()).toContain(`(${PUBLIC}${LESSON}): HTML — язык разметки`);
	expect((await request.get('llms-full.txt')).status()).toBe(200);
});

test('share: links before the script runs, the system sheet where there is one, and the copied link', async ({ page, context, browserName }) => {
	await page.goto(LESSON);
	const group = page.getByRole('group', { name: 'Поделиться уроком' });
	await expect(group).toHaveCount(2); // the header and the end of the lesson
	const telegram = group.first().getByRole('link', { name: 'Поделиться в Telegram' });
	const href = new URL((await telegram.getAttribute('href'))!);
	expect(href.searchParams.get('url')).toBe(`${PUBLIC}${LESSON}`);
	expect(href.searchParams.get('text')).toContain('Первая страница: теги, заголовок, ссылка');
	for (const name of ['ВКонтакте', 'X', 'WhatsApp']) await expect(group.first().getByRole('link', { name: `Поделиться в ${name}` })).toBeVisible();
	await expect(telegram).toHaveAttribute('rel', 'noopener noreferrer');

	if (browserName === 'chromium') {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await group.first().getByRole('button', { name: 'Скопировать ссылку' }).click();
		await expect(group.first().getByRole('status')).toHaveText('Ссылка скопирована.');
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${PUBLIC}${LESSON}`);
	}

	// A browser with the Web Share API gets one button, which hands the system sheet the lesson.
	await page.addInitScript(() => {
		(navigator as unknown as { share: (d: ShareData) => Promise<void> }).share = async (d) => {
			(window as unknown as { shared: ShareData }).shared = d;
		};
	});
	await page.reload();
	const native = page.getByRole('group', { name: 'Поделиться уроком' }).first().getByRole('button', { name: 'Поделиться', exact: true });
	await native.click();
	const shared = await page.evaluate(() => (window as unknown as { shared: ShareData }).shared);
	expect(shared).toMatchObject({ url: `${PUBLIC}${LESSON}`, title: 'Первая страница: теги, заголовок, ссылка' });
	expect(shared.text).toMatch(/^«Первая страница: теги, заголовок, ссылка», урок учебника «Сквозь время»\. HTML — /);
});
