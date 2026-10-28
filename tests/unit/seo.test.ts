// Search, answer engines and link previews (lib/seo): the definition convention, the structured
// data's required fields for every lesson, the Open Graph cards, the sitemap, robots.txt and
// llms.txt, and the share links. The built pages' heads are read in tests/e2e/seo.spec.ts.
import { describe, it, expect } from 'vitest';
import { loadContent, loadEdition } from '#lib/content/load.ts';
import { Definition, DefinitionEn } from '#lib/content/schema.ts';
import { alternates, at, describe as describeText, EDITIONS } from '#lib/seo/site.ts';
import { breadcrumbs, course, duration, learningResource, ldJson, website } from '#lib/seo/jsonld.ts';
import { cards, homeCard, lessonCard, lastmod } from '#lib/seo/pages.server.ts';
import { defaultInstance, ogFile, renderCard, staticEcho } from '#lib/seo/og.server.ts';
import { llmsFullTxt, llmsTxt, lessonMarkdown } from '#lib/seo/llms.server.ts';
import { targets, xText, lessonText } from '#lib/share/targets.ts';
import { GET as sitemap } from '../../src/routes/sitemap.xml/+server.ts';
import { GET as robots } from '../../src/routes/robots.txt/+server.ts';

const { lessons, curriculum } = loadContent();
const partOf = (n: number) => curriculum.parts.find((p) => p.number === n)!;
const en = loadEdition('en');

describe('the definition convention', () => {
	it('every lesson has one that fits a snippet', () => {
		for (const l of lessons) {
			expect(l.definition.length, l.id).toBeGreaterThanOrEqual(50);
			expect(l.definition.length, l.id).toBeLessThanOrEqual(160);
		}
	});
	it('refuses «вы», a lesson-shaped opening, a missing end, and too long', () => {
		const ok = 'DNS — распределённая система, которая переводит имя сайта в IP-адрес сервера.';
		expect(Definition.safeParse(ok).success).toBe(true);
		expect(Definition.safeParse('DNS — система, которая переводит ваш адрес сайта в IP-адрес сервера.').success).toBe(false);
		expect(Definition.safeParse('В этом уроке разберём, как DNS переводит имя сайта в IP-адрес сервера.').success).toBe(false);
		expect(Definition.safeParse(ok.replace(/\.$/, '')).success).toBe(false);
		expect(Definition.safeParse(ok.repeat(3)).success).toBe(false);
		expect(Definition.safeParse(undefined).error?.issues[0].message).toMatch(/README/);
	});
	it('a description is at most 160 characters, cut at a sentence or a word', () => {
		const long = 'Первое предложение достаточно длинное, чтобы стать описанием страницы целиком. ' + 'Второе. '.repeat(30);
		expect(describeText(long)).toBe('Первое предложение достаточно длинное, чтобы стать описанием страницы целиком.');
		const words = 'слово '.repeat(60);
		const d = describeText(words);
		expect(d.length).toBeLessThanOrEqual(160);
		expect(d).toMatch(/слово…$/);
	});
});

describe('structured data', () => {
	const home = at.home();
	it('a LearningResource per lesson, with the fields schema.org and the course graph need', () => {
		for (const l of lessons) {
			const url = at.lesson(l.id);
			const d = JSON.parse(ldJson(learningResource({ lesson: l, url, homeUrl: home, image: at.file('og/x.png'), teaches: ['a'], dateModified: '2026-10-27' })));
			expect(d['@context']).toBe('https://schema.org');
			expect(d['@type']).toBe('LearningResource');
			expect(d).toMatchObject({ name: l.title, description: l.definition, url, inLanguage: 'ru', educationalLevel: 'beginner' });
			expect(d.isPartOf).toEqual({ '@type': 'Course', '@id': `${home}#course`, name: 'Сквозь время', url: home });
			expect(d.timeRequired).toMatch(/^PT(\d+H)?(\d+M)?$/);
			expect(d.license).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
			expect(d.citation.length).toBeGreaterThanOrEqual(2);
			for (const c of d.citation) expect(c).toMatchObject({ '@type': 'CreativeWork', name: expect.any(String), url: expect.stringMatching(/^https:\/\//) });
		}
	});
	it('a Course on home with what Google requires of one', () => {
		const c = course({ homeUrl: home, description: 'Учебник.', minutes: 150 });
		expect(c).toMatchObject({ '@type': 'Course', '@id': `${home}#course`, name: 'Сквозь время', description: 'Учебник.', provider: { '@type': 'Organization' } });
		expect(c.hasCourseInstance).toEqual({ '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT2H30M' });
		expect(c.offers).toMatchObject({ '@type': 'Offer', price: 0, category: 'Free' });
		expect(website(home, 'x')).toMatchObject({ '@type': 'WebSite', url: home });
	});
	it('breadcrumbs number their items from 1, and the last one is the page', () => {
		const b = breadcrumbs([{ name: 'a', url: home }, { name: 'b' }]) as { itemListElement: Record<string, unknown>[] };
		expect(b.itemListElement).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'a', item: home },
			{ '@type': 'ListItem', position: 2, name: 'b' }
		]);
	});
	it('durations, and JSON that cannot close its script element', () => {
		expect([5, 60, 125].map(duration)).toEqual(['PT5M', 'PT1H', 'PT2H5M']);
		const tricky = { name: '</script><script>alert(1)</script>' };
		expect(ldJson(tricky)).not.toContain('<');
		expect(JSON.parse(ldJson(tricky))).toEqual(tricky);
	});
	it('hreflang for a page in both editions, Russian the default; none for a page in one', () => {
		expect(EDITIONS.map((e) => e.lang)).toEqual(['ru', 'en']);
		expect(alternates('/map/')).toEqual([
			{ hreflang: 'ru', href: at.map() },
			{ hreflang: 'en', href: at.map('en') },
			{ hreflang: 'x-default', href: at.map() }
		]);
		expect(alternates('/lesson/02-html/01-first-page/', ['ru'])).toEqual([]);
	});
	it('an English definition is held to the same rules, with «you» in place of «вы»', () => {
		const ok = 'DNS is a distributed system that turns a site name into the IP address of its server.';
		expect(DefinitionEn.safeParse(ok).success).toBe(true);
		expect(DefinitionEn.safeParse('DNS is a system that turns your site name into the IP address of a server.').success).toBe(false);
		expect(DefinitionEn.safeParse('In this lesson we see how DNS turns a site name into the address of a server.').success).toBe(false);
		expect(DefinitionEn.safeParse(ok.replace(/\.$/, '')).success).toBe(false);
		for (const l of en.lessons) expect(DefinitionEn.safeParse(l.definition).success, l.id).toBe(true);
	});
	it('the English edition\'s structured data says English and the English name', () => {
		const l = en.lessons[0];
		const d = JSON.parse(ldJson(learningResource({ lesson: l, url: at.lesson(l.id, 'en'), homeUrl: at.home('en'), teaches: ['a'], lang: 'en' })));
		expect(d).toMatchObject({ inLanguage: 'en', isPartOf: { name: 'Through Time', url: at.home('en') } });
		expect(JSON.parse(ldJson(website(at.home('en'), 'x', 'en')))).toMatchObject({ name: 'Through Time', inLanguage: 'en' });
	});
});

/** A PNG's width and height, from its IHDR chunk. */
const size = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });

describe('Open Graph cards', () => {
	it('one per lesson, the home and the map, each named by a hash of what it draws', () => {
		const all = cards();
		// both editions: every Russian lesson, and every lesson translated into English
		expect(all.size).toBe(lessons.length + 2 + en.lessons.length + 2);
		for (const file of all.keys()) expect(file).toMatch(/^(en-)?(home|map|lesson-\d\d-[a-z0-9-]+)-[0-9a-f]{10}\.png$/);
		const enCard = lessonCard(en.lessons[0], en.curriculum.parts.find((p) => p.number === en.lessons[0].part)!, 'en');
		expect(enCard).toMatchObject({ stem: `en-lesson-${en.lessons[0].id.replace('/', '-')}`, lang: 'en' });
		expect(enCard.alt).toContain('Echo');
		const l = lessons[0];
		const card = lessonCard(l, partOf(l.part));
		expect(ogFile(card)).toBe(ogFile({ ...card }));
		expect(ogFile({ ...card, title: `${card.title}!` })).not.toBe(ogFile(card));
		expect(ogFile({ ...card, alt: 'другая подпись' })).toBe(ogFile(card));
	});
	it('a card names its part, its lesson and Эхо, for the alt text', () => {
		const l = lessons.find((x) => x.id === '02-html/01-first-page')!;
		const card = lessonCard(l, partOf(2));
		expect(card).toMatchObject({ kicker: 'Часть 2. HTML', title: l.title, era: 1 });
		expect(card.alt).toContain(l.title);
		expect(card.alt).toContain('Эхо');
	});
	it('Эхо made static: no custom property left, the era lit', () => {
		const svg = staticEcho(3, 'cheer');
		expect(svg).not.toContain('var(');
		expect(svg).not.toMatch(/animation\s*:/);
		expect(svg).toMatch(/<circle class="era e3"[^>]*r="4\.5"/);
	});
	it('the variable fonts lose only their variation tables', async () => {
		const { readFileSync } = await import('node:fs');
		const wawoff2 = (await import('wawoff2')).default;
		const ttf = new Uint8Array(await wawoff2.decompress(readFileSync('design/fonts/literata-500-latin.woff2')));
		const tags = (b: Uint8Array) => {
			const v = new DataView(b.buffer, b.byteOffset);
			return Array.from({ length: v.getUint16(4) }, (_, i) => String.fromCharCode(...b.subarray(12 + i * 16, 16 + i * 16)));
		};
		const out = tags(new Uint8Array(defaultInstance(ttf)));
		expect(tags(ttf)).toContain('fvar');
		expect(out).not.toContain('fvar');
		expect(out).toEqual(expect.arrayContaining(['glyf', 'cmap', 'head', 'name']));
	});
	it('draws a 1200 × 630 PNG under WhatsApp’s 300 KB, for the longest title and the home', { timeout: 30_000 }, async () => {
		const longest = [...lessons].sort((a, b) => b.title.length - a.title.length)[0];
		for (const card of [lessonCard(longest, partOf(longest.part)), homeCard()]) {
			const png = await renderCard(card);
			expect(png.subarray(1, 4).toString()).toBe('PNG');
			expect(size(png)).toEqual({ width: 1200, height: 630 });
			expect(png.length).toBeLessThan(300 * 1024);
			// and not blank: a flat background compresses to a few kilobytes
			expect(png.length).toBeGreaterThan(30 * 1024);
		}
	});
});

describe('sitemap, robots.txt and llms.txt', () => {
	it('the sitemap lists home, the map and every lesson, each with a date', async () => {
		const xml = await (sitemap as () => Response)().text();
		const urls = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d\d-\d\d)<\/lastmod>/g)];
		// Russian: home, map, every lesson; English: home, map, the lessons translated so far
		expect(urls.length).toBe(lessons.length + 2 + en.lessons.length + 2);
		expect(urls.map((u) => u[1])).toEqual(expect.arrayContaining([at.home(), at.map(), ...lessons.map((l) => at.lesson(l.id))]));
		expect(urls.map((u) => u[1])).toEqual(expect.arrayContaining([at.home('en'), at.map('en'), ...en.lessons.map((l) => at.lesson(l.id, 'en'))]));
		for (const id of en.missing) expect(xml, id).not.toContain(`<loc>${at.lesson(id, 'en')}</loc>`);
		const translated = en.lessons[0].id;
		expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="en" href="${at.lesson(translated, 'en')}"/>`);
		for (const page of ['gallery', 'review', 'settings']) expect(xml).not.toContain(`<loc>${at.file(`${page}/`)}</loc>`);
		expect(lastmod(lessons[0].id)).toMatch(/^\d{4}-\d\d-\d\d$/);
	});
	it('robots.txt allows crawling and names the sitemap', async () => {
		const txt = await (robots as () => Response)().text();
		expect(txt).toContain('User-agent: *');
		expect(txt).toContain(`Sitemap: ${at.file('sitemap.xml')}`);
	});
	it('llms.txt has one line per lesson: its link and its definition', () => {
		const txt = llmsTxt();
		expect(txt.startsWith('# Сквозь время\n\n> ')).toBe(true);
		for (const l of lessons) expect(txt).toContain(`- [${l.title}](${at.lesson(l.id)}): ${l.definition}`);
	});
	it('the English llms.txt lists the translated lessons only, in English', () => {
		const txt = llmsTxt('en');
		expect(txt.startsWith('# Through Time\n\n> ')).toBe(true);
		for (const l of en.lessons) expect(txt).toContain(`- [${l.title}](${at.lesson(l.id, 'en')}): ${l.definition}`);
		for (const id of en.missing) expect(txt).not.toContain(at.lesson(id, 'en'));
		expect(llmsFullTxt('en')).toContain(`# ${en.lessons[0].title}\n`);
	});
	it('llms-full.txt is every lesson as Markdown, without scripts or diagrams', () => {
		const txt = llmsFullTxt();
		for (const l of lessons) expect(txt).toContain(`# ${l.title}\n`);
		expect(txt).not.toMatch(/<script module|export const metadata|import \w+ from '\.\.\/\.\.\/diagrams/);
		expect(txt.length).toBeLessThan(4_000_000);
		expect(lessonMarkdown('<script module>\n\tx\n</script>\n<script>\n\ty\n</script>\na\n<Diagram items={[{ a: 1 }, { b: "}" }]} />\nb `<Counter />`\n```html\n<script>go()</script>\n```')).toBe(
			'a\n\nb `<Counter />`\n```html\n<script>go()</script>\n```'
		);
	});
});

describe('share links', () => {
	const url = at.lesson('02-html/01-first-page');
	const l = lessons.find((x) => x.id === '02-html/01-first-page')!;
	const text = lessonText(l.title, l.definition, 'Сквозь время');
	it('plain URLs to Telegram, VK, X and WhatsApp, the address and caption encoded', () => {
		const t = Object.fromEntries(targets({ url, title: l.title, text }).map((x) => [x.id, new URL(x.href)]));
		expect(t.telegram.origin + t.telegram.pathname).toBe('https://t.me/share/url');
		expect(t.telegram.searchParams.get('url')).toBe(url);
		expect(t.telegram.searchParams.get('text')).toBe(text);
		expect(t.vk.searchParams.get('url')).toBe(url);
		expect(t.vk.searchParams.get('title')).toBe(l.title);
		expect(t.x.origin + t.x.pathname).toBe('https://x.com/intent/post');
		expect(t.x.searchParams.get('url')).toBe(url);
		expect(t.whatsapp.searchParams.get('text')).toBe(`${text} ${url}`);
	});
	it('the caption is the title and the definition; on X it fits with the link', () => {
		expect(text).toContain(l.title);
		expect(text).toContain(l.definition);
		for (const x of lessons) expect(xText(x.title, lessonText(x.title, x.definition, 'Сквозь время')).length + 24).toBeLessThanOrEqual(280);
	});
});
