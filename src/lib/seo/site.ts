/**
 * What every page's head says about the site: its public address, its name, its licence and
 * which editions exist. Used by the head (Seo.svelte), the structured data, the sitemap, the
 * Open Graph images and llms.txt, so the address is written once.
 *
 * The origin is where GitHub Pages serves the course; the path below it is the build's base
 * (`BASE_PATH`, `/learn` by default), which `$app/paths` already carries for internal links.
 */
import type { Locale } from '#lib/i18n/index.ts';

export const ORIGIN = 'https://open.noeticecho.space';
/** The course's name in each edition: the brand that heads every title, card and llms.txt. */
export const SITE_NAMES: Record<Locale, string> = { ru: 'Сквозь время', en: 'Through Time' };
export const SITE_NAME = SITE_NAMES.ru;
/** Open Graph's locale of each edition. */
export const OG_LOCALES: Record<Locale, string> = { ru: 'ru_RU', en: 'en_US' };
export const LOCALE = OG_LOCALES.ru;
export const LANG = 'ru';
export const LICENCE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
export const PUBLISHER = { name: 'NoeticEcho', url: 'https://open.noeticecho.space' };

/** The build's base path: `/learn`, or '' when built for the root. */
export const BASE = __BASE_PATH__;

/**
 * The course's editions, by language, and the path each lives under, below the base. Russian is
 * the source and the default (`x-default`), at the base itself; English is under `/en`.
 */
export const EDITIONS: { lang: Locale; prefix: string }[] = [
	{ lang: 'ru', prefix: '' },
	{ lang: 'en', prefix: '/en' }
];
const prefix = (l: Locale) => EDITIONS.find((e) => e.lang === l)!.prefix;

/** The edition a site path (with the base) belongs to. */
export const editionOf = (pathname: string): Locale =>
	pathname === `${BASE}/en` || pathname.startsWith(`${BASE}/en/`) ? 'en' : 'ru';

/** A site path (with the base) inside its edition: `/learn/en/map/` → `/map/`, `/learn/` → `/`. */
export const innerPath = (pathname: string) => {
	const rest = pathname.slice(BASE.length);
	return (editionOf(pathname) === 'en' ? rest.slice(3) : rest) || '/';
};

/** An absolute URL for a site path that already carries the base (`/learn/...`). */
export const absolute = (path: string) => new URL(path, ORIGIN).href;

/**
 * Absolute URLs of the course's pages, in an edition (Russian by default). `$app/paths` is not
 * used for these: while prerendering it gives relative links (`../../map/`), right for an `href`
 * and wrong for a canonical address.
 */
export const at = {
	home: (l: Locale = 'ru') => absolute(`${BASE}${prefix(l)}/`),
	map: (l: Locale = 'ru') => absolute(`${BASE}${prefix(l)}/map/`),
	lesson: (id: string, l: Locale = 'ru') => absolute(`${BASE}${prefix(l)}/lesson/${id}/`),
	/** A file at the site's root (`og/…png`, `sitemap.xml`), shared by both editions. */
	file: (path: string) => absolute(`${BASE}/${path}`),
	/** A file of an edition (`llms.txt`). */
	editionFile: (path: string, l: Locale = 'ru') => absolute(`${BASE}${prefix(l)}/${path}`)
};

export type Alternate = { hreflang: string; href: string };

/**
 * The alternates of a page, given its path inside an edition ('/lesson/02-html/01-first-page/')
 * and the editions it exists in: one link per edition and `x-default` for Russian. A page that
 * exists in one edition only (a lesson not yet translated) has none: an alternate pointing at a
 * page that is not the same content is an error to a search engine.
 */
export function alternates(inner: string, langs: readonly Locale[] = EDITIONS.map((e) => e.lang)): Alternate[] {
	const present = EDITIONS.filter((e) => langs.includes(e.lang));
	if (present.length < 2) return [];
	const links = present.map((e) => ({ hreflang: e.lang, href: absolute(`${BASE}${e.prefix}${inner}`) }));
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

/** The era of Эхо's ring, by number (design/mascot/README.md); the last is Искин, Iskin in English. */
export const ERAS = ['1991', '1996', '2000', '2005', '2014', '2019', '2025', 'Искин'] as const;
export const eraLabel = (era: number | null | undefined, l: Locale = 'ru') =>
	era ? (era === 8 && l === 'en' ? 'Iskin' : ERAS[era - 1]) : undefined;
