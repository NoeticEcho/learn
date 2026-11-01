// The platform (docs/specs/2026-11-01-platform-design.md §9): no published address is lost, the
// catalog and a course's page, Эхо on every kind of page with no key and no network, a learner's
// old store, and nothing reaching a third party.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC = 'https://open.noeticecho.space/learn/';

test.describe('published addresses', () => {
	test('every file the build of 1 November 2026 published is still in the build', () => {
		const list = readFileSync('tests/fixtures/published-urls.txt', 'utf8').split('\n').filter(Boolean);
		expect(list.length).toBeGreaterThan(900);
		expect(list.filter((f) => !existsSync(join('build', f)))).toEqual([]);
	});
	test('old lesson addresses and the old home card answer in both editions', async ({ request }) => {
		for (const path of ['lesson/02-html/01-first-page/', 'en/lesson/02-html/01-first-page/', 'map/', 'en/map/', 'gallery/', 'en/gallery/', 'llms.txt', 'en/llms.txt', 'sitemap.xml'])
			expect((await request.get(path)).status(), path).toBe(200);
		const card = readFileSync('tests/fixtures/published-urls.txt', 'utf8').match(/^og\/home-.*$/m)![0];
		expect((await request.get(card)).status()).toBe(200);
	});
	test('no page exists for a planned lesson: below /course/<id>/ there is only the prologue', async ({ request }) => {
		const below = readdirSync('build/course').flatMap((c) => {
			const dir = join('build/course', c);
			return statSync(dir).isDirectory() ? readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory()).map((f) => `${c}/${f}`) : [];
		});
		expect(below).toEqual(['web/prologue']);
		expect((await request.get('course/ai/symbols/eliza/')).status()).toBe(404);
		const sitemap = await (await request.get('sitemap.xml')).text();
		expect([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => /\/course\/[^/]+\/./.test(u))).toEqual([]);
	});
});

test.describe('the catalog', () => {
	test('lists the strands and courses, web first and AI second, the noetic strand visible, no fetch of the lesson list', async ({ page }) => {
		const requests: string[] = [];
		page.on('request', (r) => requests.push(r.url()));
		await page.goto('./');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сквозь время');
		await expect(page.getByRole('heading', { level: 2, name: 'Ноэтическая сингулярность' })).toBeVisible();
		const courses = page.getByRole('heading', { level: 3 });
		expect(await courses.count()).toBeGreaterThanOrEqual(15);
		await expect(courses.nth(0)).toHaveText('Сеть насквозь');
		await expect(courses.nth(1)).toContainText('ИИ');
		await expect(page.getByText(/^Открыт, 154 урока$/)).toBeVisible();
		await page.waitForLoadState('networkidle');
		expect(requests.filter((u) => /data\/home-/.test(u))).toEqual([]);
		await expect(page.getByRole('link', { name: 'Лента новых уроков (Atom)' })).toHaveAttribute('href', /feed\.xml$/);
		await expect(page.getByRole('link', { name: 'NoeticEcho', exact: true }).first()).toBeVisible();
	});
	test('in English too, with the language switch to the Russian catalog', async ({ page }) => {
		await page.goto('./en/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Through Time');
		await expect(page.getByRole('heading', { level: 2, name: 'The Noetic Singularity' })).toBeVisible();
		await expect(page.getByRole('heading', { level: 3 }).first()).toHaveText('The Web, End to End');
		await expect(page.getByRole('link', { name: 'Русский', exact: true })).toHaveAttribute('hreflang', 'ru');
	});
	test('its head: a canonical, a card of its own, the feed and a WebSite', async ({ request }) => {
		const html = await (await request.get('./')).text();
		expect(html).toContain(`<link rel="canonical" href="${PUBLIC}"`);
		expect(html).toMatch(/type="application\/atom\+xml"/);
		expect(html).toMatch(/og\/catalog-[0-9a-f]{10}\.png/);
		const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((m) => JSON.parse(m[1]));
		expect(ld.map((d) => d['@type'])).toEqual(['WebSite']);
	});
	test('a returning person sees their own state in the web course’s row', async ({ page }) => {
		await seedOldStore(page);
		await page.goto('./');
		await expect(page.getByText('Пройдено 2 из 154')).toBeVisible();
		await expect(page.getByRole('link', { name: /^Продолжить:/ }).first()).toBeVisible();
	});
});

test.describe('a course’s page', () => {
	test('a planned course lists its parts and lessons, each «скоро», with no link and no date', async ({ page, request }) => {
		await page.goto('./course/ai/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('ИИ');
		await expect(page.getByText('ELIZA').first()).toBeVisible();
		await expect(page.getByText('Attention Is All You Need').first()).toBeVisible();
		const soon = page.getByText('скоро', { exact: true });
		expect(await soon.count()).toBeGreaterThan(20);
		expect(await page.locator('main ol a').count()).toBe(0);
		const html = await (await request.get('course/ai/')).text();
		expect(html).toContain(`<link rel="canonical" href="${PUBLIC}course/ai/"`);
		expect(html).not.toContain('name="robots"');
		const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((m) => JSON.parse(m[1]));
		expect(ld.map((d) => d['@type'])).toEqual(['BreadcrumbList']); // no Course: it cannot be taken yet
	});
	test('the web course has a Course, its lessons as links, and the old card', async ({ page, request }) => {
		await page.goto('./course/web/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сеть насквозь');
		expect(await page.locator('.toc li a').count()).toBe(154);
		await expect(page.getByRole('link', { name: 'Начать со вступления' })).toHaveAttribute('href', /course\/web\/prologue\/$/);
		const html = await (await request.get('course/web/')).text();
		const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((m) => JSON.parse(m[1]));
		expect(ld[0]).toMatchObject({ '@type': 'Course', '@id': `${PUBLIC}course/web/#course`, name: 'Сеть насквозь', inLanguage: 'ru' });
		expect(html).toMatch(/og\/home-[0-9a-f]{10}\.png/);
	});
	test('the header names the map and the gallery only on the web course’s pages', async ({ page }) => {
		const nav = page.getByRole('navigation', { name: 'Разделы' });
		await page.goto('./');
		await expect(nav.getByRole('link', { name: 'Карта' })).toHaveCount(0);
		await page.goto('./course/web/');
		await expect(nav.getByRole('link', { name: 'Карта' })).toBeVisible();
		await page.goto('./lesson/00-start/01-how-to-learn/');
		await expect(nav.getByRole('link', { name: 'Галерея' })).toBeVisible();
	});
});

/** Writes a store as a person's browser holds it from before the platform, with no app code. */
async function seedOldStore(page: Page) {
	await page.goto('./robots.txt');
	await page.evaluate(
		() =>
			new Promise<void>((done, fail) => {
				localStorage.setItem('learn.theme', 'paper');
				const r = indexedDB.open('learn', 2);
				r.onupgradeneeded = () => {
					for (const s of ['lessons', 'answers', 'practice', 'cards', 'persona', 'settings']) r.result.createObjectStore(s);
					r.result.createObjectStore('log', { autoIncrement: true });
				};
				r.onerror = () => fail(r.error);
				r.onsuccess = () => {
					const tx = r.result.transaction(['lessons', 'settings', 'practice', 'log'], 'readwrite');
					tx.objectStore('lessons').put({ status: 'done', at: 1, xp: 10 }, '00-start/01-how-to-learn');
					tx.objectStore('lessons').put({ status: 'done', at: 2, xp: 10 }, '00-start/02-time-machine');
					tx.objectStore('lessons').put({ status: 'started', at: 3, xp: 0 }, '00-start/03-workbench');
					tx.objectStore('settings').put(true, 'prologueSeen');
					tx.objectStore('settings').put({ section: 2, at: 12 }, 'narration:ru:00-start/01-how-to-learn');
					tx.objectStore('practice').put('<h1>моя страница</h1>', 'step:first-page:index.html');
					tx.objectStore('log').put({ at: Date.now(), kind: 'lesson', xp: 20 });
					tx.oncomplete = () => {
						r.result.close();
						done();
					};
				};
			})
	);
}

test.describe('a learner’s old store', () => {
	test('shows the same progress on the course’s page and the map, and the store’s keys stay what they were', async ({ page }) => {
		await seedOldStore(page);
		await page.goto('./course/web/');
		await expect(page.getByText('2 из 154 уроков')).toBeVisible();
		await expect(page.getByRole('link', { name: /^Продолжить:/ })).toBeVisible();
		await expect(page.locator('.toc li.passed')).toHaveCount(2);
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
		await page.goto('./map/');
		await expect(page.getByTestId('lesson-00-start/01-how-to-learn')).toHaveAttribute('data-status', 'done');
		await page.goto('./lesson/00-start/01-how-to-learn/');
		await expect(page.getByRole('status').filter({ hasText: 'Вы уже прошли этот урок' })).toBeVisible();
		const left = await page.evaluate(
			() =>
				new Promise<{ version: number; narration: unknown; practice: unknown }>((done) => {
					const r = indexedDB.open('learn');
					r.onsuccess = () => {
						const tx = r.result.transaction(['settings', 'practice']);
						const a = tx.objectStore('settings').get('narration:ru:00-start/01-how-to-learn');
						const b = tx.objectStore('practice').get('step:first-page:index.html');
						tx.oncomplete = () => done({ version: r.result.version, narration: a.result, practice: b.result });
					};
				})
		);
		expect(left).toEqual({ version: 2, narration: { section: 2, at: 12 }, practice: '<h1>моя страница</h1>' });
	});
});

const PAGES: [string, string, string][] = [
	['catalog', './', 'catalog'],
	['planned course', './course/ai/', 'course'],
	['web course', './course/web/', 'course'],
	['prologue', './course/web/prologue/', 'prologue'],
	['lesson', './lesson/02-html/01-first-page/', 'lesson'],
	['map', './map/', 'map'],
	['review', './review/', 'review'],
	['gallery', './gallery/', 'gallery'],
	['settings', './settings/', 'settings']
];

/** Opens the panel with whichever launcher this width shows. */
async function openEcho(page: Page) {
	await expect(page.locator('.echo-launch:visible').first()).toBeVisible();
	// hydration: a click before the layout's script runs would be lost, so try until it opens
	await expect(async () => {
		await page.locator('.echo-launch:visible').first().click();
		await expect(page.locator('#echo-panel')).toBeVisible({ timeout: 1500 });
	}).toPass({ timeout: 15_000 });
}

for (const edition of ['', 'en/'])
	test.describe(`Эхо on every kind of page (${edition || 'ru'})`, () => {
		for (const [name, path, kind] of PAGES)
			test(`${name}: it opens with no key, and knows the page`, async ({ page }) => {
				const outside: string[] = [];
				page.on('request', (r) => {
					if (!r.url().startsWith('http://localhost') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) outside.push(r.url());
				});
				const target = path.replace('./', `./${edition}`);
				await page.goto(target);
				await openEcho(page);
				const panel = page.locator('#echo-panel');
				await expect(panel).toHaveAttribute('data-kind', kind);
				await expect(panel.locator('[aria-live="polite"]').first()).not.toBeEmpty();
				await expect(panel.getByRole('textbox')).toHaveCount(0); // model mode is off with no key
				await page.keyboard.press('Escape');
				await expect(panel).toHaveCount(0);
				expect(outside).toEqual([]);
			});
		test('a 404: it opens there too', async ({ page }) => {
			await page.goto(`./${edition}no-such-page/`);
			await openEcho(page);
			await expect(page.locator('#echo-panel')).toHaveAttribute('data-kind', 'error');
		});
	});

test('on the catalog it helps choose: an answer gives courses, each marked open or coming soon', async ({ page }) => {
	await page.goto('./');
	await openEcho(page);
	await page.getByRole('button', { name: 'Хочу понять, что такое ИИ' }).click();
	const link = page.locator('#echo-panel').getByRole('link', { name: /ИИ: от символов/ });
	await expect(link).toHaveAttribute('href', /course\/ai\/$/);
	await expect(page.locator('#echo-panel .result')).toContainText('скоро');
	await page.getByRole('button', { name: 'Хочу сделать сайт' }).click();
	await expect(page.locator('#echo-panel .result')).toContainText('открыт');
});

test('model mode appears only with a person’s own key, and the page names itself', async ({ page }) => {
	await seedOldStore(page);
	await page.goto('./settings/');
	await page.evaluate(
		() =>
			new Promise<void>((done) => {
				const r = indexedDB.open('learn');
				r.onsuccess = () => {
					const tx = r.result.transaction('settings', 'readwrite');
					tx.objectStore('settings').put({ provider: 'anthropic', key: 'k', model: 'claude-sonnet-5-5' }, 'ownKey');
					tx.oncomplete = () => done();
				};
			})
	);
	await page.goto('./course/ai/');
	await openEcho(page);
	await expect(page.locator('#echo-panel').getByRole('textbox')).toBeVisible();
	await expect(page.locator('#echo-panel')).toContainText('только в Anthropic');
});

test('offline, after the worker is ready, it still opens and speaks', async ({ page, context }) => {
	await page.goto('./');
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload();
	await expect(async () => {
		expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	}).toPass({ timeout: 10_000 });
	await context.setOffline(true);
	await page.reload();
	await openEcho(page);
	await expect(page.locator('#echo-panel')).toHaveAttribute('data-kind', 'catalog');
	await expect(page.locator('#echo-panel [aria-live="polite"]').first()).toContainText('курс');
	await context.setOffline(false);
});

test.describe('on a phone', () => {
	test.use({ viewport: { width: 375, height: 812 } });
	for (const path of ['./', './course/ai/', './lesson/02-html/01-first-page/', './map/'])
		test(`${path}: nothing is fixed, the launcher covers nothing, and the open panel pushes the page down`, async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('.echo-head')).toBeVisible();
			await expect(page.locator('.echo-tab')).toBeHidden();
			const fixed = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => ['fixed', 'sticky'].includes(getComputedStyle(e).position) && (e as HTMLElement).offsetParent !== null || getComputedStyle(e).position === 'fixed' && getComputedStyle(e).display !== 'none').map((e) => e.className || e.tagName));
			expect(fixed).toEqual([]);
			const before = await page.locator('main').boundingBox();
			await openEcho(page);
			const panel = await page.locator('#echo-panel').boundingBox();
			const after = await page.locator('main').boundingBox();
			expect(after!.y).toBeGreaterThanOrEqual(panel!.y + panel!.height - 1);
			expect(after!.y).toBeGreaterThan(before!.y);
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
		});
	test('from the footer the panel comes into view, and closing goes back', async ({ page }) => {
		await page.goto('./course/ai/');
		const foot = page.locator('.echo-foot');
		await foot.scrollIntoViewIfNeeded();
		await expect(async () => {
			await foot.click();
			await expect(page.locator('#echo-panel')).toBeInViewport({ timeout: 1500 });
		}).toPass({ timeout: 15_000 });
		await page.getByRole('button', { name: 'Закрыть' }).click();
		await expect(foot).toBeFocused();
		await expect(foot).toBeInViewport();
	});
});

test.describe('on a wide screen', () => {
	test.use({ viewport: { width: 1280, height: 800 } });
	test('the tab stays inside the container’s padding, so it covers no text', async ({ page }) => {
		await page.goto('./lesson/00-start/01-how-to-learn/');
		await expect(page.locator('.echo-head')).toBeHidden();
		const tab = await page.locator('.echo-tab').boundingBox();
		const content = await page.locator('main .container').first().evaluate((el) => {
			const r = el.getBoundingClientRect();
			return r.right - parseFloat(getComputedStyle(el).paddingRight);
		});
		expect(tab!.x).toBeGreaterThanOrEqual(content);
	});
});

test('with the narration player open, the tab stands above it and the panel opens', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.route('**/learn-audio/**', (r) => r.abort());
	await page.goto('./lesson/00-start/01-how-to-learn/');
	await expect(async () => {
		await page.getByRole('button', { name: /^Слушать/ }).click();
		await expect(page.locator('#narration-player')).toBeVisible({ timeout: 1500 });
	}).toPass({ timeout: 15_000 });
	const player = (await page.locator('#narration-player').boundingBox())!;
	const tab = (await page.locator('.echo-tab').boundingBox())!;
	expect(tab.y + tab.height).toBeLessThanOrEqual(player.y);
	await page.locator('.echo-tab').click();
	const panel = (await page.locator('#echo-panel').boundingBox())!;
	expect(panel.y + panel.height).toBeLessThanOrEqual(player.y);
});

test('the open panel has no serious accessibility problems, in either theme', async ({ page }) => {
	for (const scheme of ['dark', 'light'] as const) {
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto('./');
		await openEcho(page);
		await page.getByRole('button', { name: 'Хочу понять, что такое ИИ' }).click();
		const result = await new AxeBuilder({ page }).include('#echo-panel').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
		expect(result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
	}
});

test('the feed is served, parses as Atom, and llms.txt lists the courses', async ({ page, request }) => {
	for (const path of ['feed.xml', 'en/feed.xml']) {
		const res = await request.get(path);
		expect(res.status(), path).toBe(200);
		const xml = await res.text();
		const entries = await page.evaluate((x) => {
			const d = new DOMParser().parseFromString(x, 'application/xml');
			return d.querySelector('parsererror') ? -1 : d.querySelectorAll('feed > entry').length;
		}, xml);
		expect(entries).toBeGreaterThanOrEqual(1);
	}
	const llms = await (await request.get('llms.txt')).text();
	expect(llms).toContain('## Курсы');
	expect(llms).toContain(`(${PUBLIC}course/ai/)`);
	expect(llms).toContain(`(${PUBLIC}lesson/02-html/01-first-page/)`);
});
