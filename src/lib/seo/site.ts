/**
 * What every page's head says about the site: its public address, its name, its licence and
 * which editions exist. Used by the head (Seo.svelte), the structured data, the sitemap, the
 * Open Graph images and llms.txt, so the address is written once.
 *
 * The origin is where GitHub Pages serves the course; the path below it is the build's base
 * (`BASE_PATH`, `/learn` by default), which `$app/paths` already carries for internal links.
 */
export const ORIGIN = 'https://open.noeticecho.space';
export const SITE_NAME = 'Сквозь время';
export const LOCALE = 'ru_RU';
export const LANG = 'ru';
export const LICENCE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
export const PUBLISHER = { name: 'NoeticEcho', url: 'https://open.noeticecho.space' };

/** The build's base path: `/learn`, or '' when built for the root. */
export const BASE = __BASE_PATH__;

/** An absolute URL for a site path that already carries the base (`/learn/...`). */
export const absolute = (path: string) => new URL(path, ORIGIN).href;

/**
 * Absolute URLs of the course's pages. `$app/paths` is not used for these: while prerendering it
 * gives relative links (`../../map/`), right for an `href` and wrong for a canonical address.
 */
export const at = {
	home: () => absolute(`${BASE}/`),
	map: () => absolute(`${BASE}/map/`),
	lesson: (id: string) => absolute(`${BASE}/lesson/${id}/`),
	file: (path: string) => absolute(`${BASE}/${path}`)
};

/**
 * The course's editions, by language. Only Russian exists, so no page emits `hreflang` yet: an
 * alternate pointing at a page that does not exist is an error to a search engine. When the
 * English edition lands, add `en` here with its base, and `alternates` gives every page its
 * `ru`, `en` and `x-default` links (the Russian edition stays the default).
 */
export const EDITIONS: { lang: string; base: string }[] = [{ lang: 'ru', base: '/learn' }];

export type Alternate = { hreflang: string; href: string };

/** The alternates of a page, given its path inside an edition ('/lesson/02-html/01-first-page/'). */
export function alternates(inner: string): Alternate[] {
	if (EDITIONS.length < 2) return [];
	const links = EDITIONS.map((e) => ({ hreflang: e.lang, href: absolute(`${e.base}${inner}`) }));
	return [...links, { hreflang: 'x-default', href: links[0].href }];
}

/**
 * A meta description of at most `max` characters: the text itself when it fits, else its first
 * sentence when that fits and says something, else the text cut at a word with an ellipsis.
 */
export function describe(text: string, max = 160): string {
	const t = text.replace(/\s+/g, ' ').trim();
	if (t.length <= max) return t;
	const first = t.match(/^.+?[.!?…](?=\s|$)/)?.[0];
	if (first && first.length >= 50 && first.length <= max) return first;
	const cut = t.slice(0, max - 1);
	const at = cut.lastIndexOf(' ');
	return `${(at > max / 2 ? cut.slice(0, at) : cut).replace(/[\s,;:—–-]+$/, '')}…`;
}

/** The era of Эхо's ring, by number (design/mascot/README.md). */
export const ERAS = ['1991', '1996', '2000', '2005', '2014', '2019', '2025', 'Искин'] as const;
export const eraLabel = (era: number | null | undefined) => (era ? ERAS[era - 1] : undefined);
