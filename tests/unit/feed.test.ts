// The Atom feed (docs/specs/2026-11-01-platform-design.md §5.5): well-formed, with stable ids, and
// an open lesson makes its own entry. Read with jsdom's XML parser, which refuses what is not XML.
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { atomFeed, feedEntries } from '#lib/seo/feed.server.ts';
import { loadCourses } from '#lib/courses/load.ts';
import type { PlannedCourse } from '#lib/courses/schema.ts';

const parse = (xml: string) => {
	const doc = new DOMParser().parseFromString(xml, 'application/xml');
	expect(doc.querySelector('parsererror')).toBeNull();
	return doc;
};

describe.each(['ru', 'en'] as const)('the feed (%s)', (lang) => {
	const doc = parse(atomFeed(lang));
	const feed = doc.documentElement;
	const child = (e: Element, n: string) => [...e.children].find((c) => c.localName === n);

	it('is an Atom feed with the fields RFC 4287 requires', () => {
		expect(feed.localName).toBe('feed');
		expect(feed.namespaceURI).toBe('http://www.w3.org/2005/Atom');
		for (const n of ['title', 'id', 'updated', 'author']) expect(child(feed, n), n).toBeTruthy();
		expect(child(feed, 'updated')!.textContent).toMatch(/^\d{4}-\d\d-\d\dT00:00:00Z$/);
		expect(feed.getAttribute('xml:lang')).toBe(lang);
		const self = [...feed.children].find((c) => c.localName === 'link' && c.getAttribute('rel') === 'self')!;
		expect(self.getAttribute('href')).toBe(lang === 'ru' ? 'https://open.noeticecho.space/learn/feed.xml' : 'https://open.noeticecho.space/learn/en/feed.xml');
	});
	it('has at least the entry for today’s catalog, and each entry has what it must', () => {
		const entries = [...feed.children].filter((c) => c.localName === 'entry');
		expect(entries.length).toBeGreaterThanOrEqual(1);
		for (const e of entries) {
			for (const n of ['title', 'id', 'updated', 'summary', 'link']) expect(child(e, n), n).toBeTruthy();
			expect(child(e, 'id')!.textContent).toMatch(/^tag:open\.noeticecho\.space,\d{4}-\d\d-\d\d:\/learn\//);
		}
	});
});

describe('entries', () => {
	const { courses, news } = loadCourses();
	it('an open lesson makes an entry with a stable id, and a planned one does not', () => {
		const ai = structuredClone(courses.find((c) => c.id === 'ai')) as PlannedCourse;
		// the course as it would be with nothing open
		for (const p of ai.parts) for (const x of p.lessons) Object.assign(x, { status: 'planned', published: undefined });
		const l = ai.parts[0].lessons[0];
		expect(feedEntries('ru', { courses: [ai], news: [] })).toEqual([]);
		l.status = 'open';
		l.published = '2026-12-01';
		const [e] = feedEntries('ru', { courses: [ai], news: [] });
		expect(e).toMatchObject({ date: '2026-12-01', category: 'ai', id: `tag:open.noeticecho.space,2026-12-01:/learn/lesson/ai/${ai.parts[0].id}/${l.id}` });
		expect(e.url).toBe(`https://open.noeticecho.space/learn/course/ai/${ai.parts[0].id}/${l.id}/`);
	});
	it('the catalog as written: one entry per open lesson, besides the news', () => {
		const open = courses.flatMap((c) => ('parts' in c ? c.parts.flatMap((p) => p.lessons.filter((l) => l.status === 'open').map((l) => ({ c, p, l }))) : []));
		expect(open.length).toBeGreaterThan(0);
		const entries = feedEntries('en', { courses, news });
		expect(entries.length).toBe(news.length + open.length);
		for (const { c, p, l } of open)
			expect(entries.find((e) => e.url === `https://open.noeticecho.space/learn/en/course/${c.id}/${p.id}/${l.id}/`), l.id).toMatchObject({ date: l.published, title: `${c.title.en}: ${l.title.en}` });
	});
	it('escapes what XML would choke on', () => {
		const n = { ...news[0], title: { ru: 'A & B <c>', en: 'A & B <c>' } };
		expect(feedEntries('en', { courses: [], news: [n] })[0].title).toBe('A & B <c>');
	});
});
