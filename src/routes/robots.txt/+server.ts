// robots.txt: everything may be crawled; the sitemap lists what should be. Crawlers read
// robots.txt at the host's root only, so this file at <base>/robots.txt is a pointer for people
// and tools; the host's own robots.txt (open.noeticecho.space/robots.txt) must name the sitemap
// too, and the sitemap is also given to Яндекс Вебмастер and Google Search Console by hand.
import { at } from '#lib/seo/site.ts';

export const prerender = true;

export function GET() {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${at.file('sitemap.xml')}\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
