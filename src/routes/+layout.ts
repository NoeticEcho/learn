import { loadCatalogue, type Locale } from '#lib/i18n/index.ts';
import { editionOf } from '#lib/seo/site.ts';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const trailingSlash = 'always';

/**
 * The page's edition, from its URL: `/learn/en/…` is English, everything else Russian. The
 * English catalogue is a chunk of its own, loaded here so that it is there before anything
 * renders; the layout component then makes it the locale (not this load, which SvelteKit also
 * runs to preload a page the pointer hovers over, while the current page is still on screen).
 */
// From the path rather than the route's parameter, so an address no route matches (the 404 page)
// still speaks the edition it was under.
export const load: LayoutLoad = async ({ url }) => {
	const lang: Locale = editionOf(url.pathname);
	await loadCatalogue(lang);
	return { lang };
};
