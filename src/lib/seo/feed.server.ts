/**
 * The Atom feed: what is new, from `content/courses/news.yaml` and every open lesson's `published`.
 * An entry's id is a `tag:` URI built from its own stable id and date, so a reader never shows
 * an entry as new twice. Build-time only.
 */
import { loadCourses } from '#lib/courses/load.ts';
import { isPlanned, type Courses } from '#lib/courses/schema.ts';
import type { Locale } from '#lib/i18n/index.ts';
import { SITE_NAMES, at, PUBLISHER } from './site.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HOST = new URL(PUBLISHER.url).host;
const tag = (date: string, id: string) => `tag:${HOST},${date}:/learn/${id}`;
const stamp = (date: string) => `${date}T00:00:00Z`;

export type FeedEntry = { id: string; date: string; title: string; summary: string; url: string; category?: string };

/** Every entry of an edition, newest first. Takes the catalog, so a test can give it an open lesson. */
export function feedEntries(lang: Locale, { courses, news }: Pick<Courses, 'courses' | 'news'> = loadCourses()): FeedEntry[] {
	const out: FeedEntry[] = news.map((n) => ({
		id: tag(n.date, `news/${n.id}`),
		date: n.date,
		title: n.title[lang],
		summary: n.summary[lang],
		url: n.course ? at.course(n.course, lang) : at.home(lang),
		...(n.course ? { category: n.course } : {})
	}));
	for (const c of courses) {
		if (!isPlanned(c)) continue;
		for (const p of c.parts)
			for (const l of p.lessons) {
				if (l.status !== 'open' || !l.published) continue;
				out.push({
					id: tag(l.published, `lesson/${c.id}/${p.id}/${l.id}`),
					date: l.published,
					title: `${c.title[lang]}: ${l.title[lang]}`,
					summary: l.summary[lang],
					url: `${at.course(c.id, lang)}${p.id}/${l.id}/`,
					category: c.id
				});
			}
	}
	return out.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function atomFeed(lang: Locale): string {
	const entries = feedEntries(lang);
	const updated = entries[0]?.date ?? '2026-11-01';
	const title = lang === 'ru' ? `${SITE_NAMES.ru}: новые уроки` : `${SITE_NAMES.en}: new lessons`;
	return [
		'<?xml version="1.0" encoding="utf-8"?>',
		`<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}">`,
		`  <title>${esc(title)}</title>`,
		`  <id>${esc(tag('2026-11-01', `feed/${lang}`))}</id>`,
		`  <link rel="self" type="application/atom+xml" href="${esc(at.editionFile('feed.xml', lang))}"/>`,
		`  <link rel="alternate" type="text/html" href="${esc(at.home(lang))}"/>`,
		`  <updated>${stamp(updated)}</updated>`,
		`  <author><name>${esc(PUBLISHER.name)}</name><uri>${esc(PUBLISHER.url)}</uri></author>`,
		...entries.flatMap((e) => [
			'  <entry>',
			`    <title>${esc(e.title)}</title>`,
			`    <id>${esc(e.id)}</id>`,
			`    <link rel="alternate" type="text/html" href="${esc(e.url)}"/>`,
			`    <updated>${stamp(e.date)}</updated>`,
			...(e.category ? [`    <category term="${esc(e.category)}"/>`] : []),
			`    <summary>${esc(e.summary)}</summary>`,
			'  </entry>'
		]),
		'</feed>',
		''
	].join('\n');
}
