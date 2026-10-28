/**
 * Every internal link, with the base path and the trailing slash the static build needs
 * (`trailingSlash: 'always'`), so a link never costs a redirect on GitHub Pages.
 *
 * A link stays in the edition it is made in: on an English page `map()` is `/learn/en/map/`, on a
 * Russian one `/learn/map/`. `in` names another edition, which only the language switch and the
 * «not yet translated» page do (`counterpart`).
 */
import { resolve } from '$app/paths';
import { getLocale, type Locale } from '#lib/i18n/index.ts';

const lang = (l: Locale): { lang?: 'en' } => (l === 'en' ? { lang: 'en' } : {});
const slash = (p: string) => (p.endsWith('/') ? p : `${p}/`);

export const home = (l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]', lang(l)));
export const map = (l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]/map', lang(l)));
export const review = (l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]/review', lang(l)));
export const gallery = (l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]/gallery', lang(l)));
export const settings = (l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]/settings', lang(l)));
export const lesson = (id: string, l: Locale = getLocale()) => {
	const [part, lesson] = id.split('/');
	return slash(resolve('/[[lang=lang]]/lesson/[part]/[lesson]', { ...lang(l), part, lesson }));
};
/** The returning home's lesson list, named by its content's hash (catalogue.server.ts homeIndex). */
export const homeIndex = (hash: string) => resolve('/data/home-[hash].json', { hash });

/**
 * The same page in the other edition, from a path inside this one (`/lesson/00-start/01-x/`,
 * without the base or the `/en` prefix): every screen exists in both, and a lesson's page exists
 * in both too, as the lesson or as the «not yet translated» page (routes/[[lang=lang]]/lesson).
 */
export function counterpart(inner: string, to: Locale): string {
	const m = inner.match(/^\/lesson\/([^/]+)\/([^/]+)\/?$/);
	if (m) return lesson(`${m[1]}/${m[2]}`, to);
	const screen = inner.replace(/^\/+|\/+$/g, '');
	if (screen === 'map') return map(to);
	if (screen === 'review') return review(to);
	if (screen === 'gallery') return gallery(to);
	if (screen === 'settings') return settings(to);
	return home(to);
}
