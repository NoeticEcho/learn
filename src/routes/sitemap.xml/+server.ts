// sitemap.xml: every page worth indexing, in both editions (home, the map, every lesson written in
// that edition), with the date its content last changed and, for a page that exists in both, its
// alternates (xhtml:link hreflang, as Google reads them in a sitemap). An English page of a lesson
// not yet translated says noindex and is not here; nor are the learner's own screens (review,
// gallery, settings).
import { loadContent, loadEdition } from '#lib/content/load.ts';
import type { Locale } from '#lib/i18n/index.ts';
import { courseLastmod, lastmod } from '#lib/seo/pages.server.ts';
import { alternates, at } from '#lib/seo/site.ts';

export const prerender = true;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

type Page = { loc: string; lastmod: string; inner: string; langs: Locale[] };

export function GET() {
	const translated = new Set(loadEdition('en').lessons.map((l) => l.id));
	const lessons = loadContent().lessons.toSorted((a, b) => a.part - b.part || a.order - b.order);
	const both: Locale[] = ['ru', 'en'];
	const pages: Page[] = [];
	for (const lang of both) {
		const course = courseLastmod(lang);
		pages.push({ loc: at.home(lang), lastmod: course, inner: '/', langs: both }, { loc: at.map(lang), lastmod: course, inner: '/map/', langs: both });
		for (const l of lessons) {
			const langs: Locale[] = translated.has(l.id) ? both : ['ru'];
			if (langs.includes(lang)) pages.push({ loc: at.lesson(l.id, lang), lastmod: lastmod(l.id, lang), inner: `/lesson/${l.id}/`, langs });
		}
	}
	const url = (p: Page) =>
		`  <url><loc>${esc(p.loc)}</loc><lastmod>${p.lastmod}</lastmod>` +
		alternates(p.inner, p.langs)
			.map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}"/>`)
			.join('') +
		'</url>';
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
		pages.map(url).join('\n') +
		'\n</urlset>\n';
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
