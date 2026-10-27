// sitemap.xml: every page worth indexing (home, the map, every lesson) with the date its content
// last changed. The learner's own screens (review, gallery, settings) say noindex and are not here.
import { loadContent } from '#lib/content/load.ts';
import { courseLastmod, lastmod } from '#lib/seo/pages.server.ts';
import { at } from '#lib/seo/site.ts';

export const prerender = true;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function GET() {
	const course = courseLastmod();
	const pages = [
		{ loc: at.home(), lastmod: course },
		{ loc: at.map(), lastmod: course },
		...loadContent()
			.lessons.toSorted((a, b) => a.part - b.part || a.order - b.order)
			.map((l) => ({ loc: at.lesson(l.id), lastmod: lastmod(l.id) }))
	];
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		pages.map((p) => `  <url><loc>${esc(p.loc)}</loc><lastmod>${p.lastmod}</lastmod></url>`).join('\n') +
		'\n</urlset>\n';
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
