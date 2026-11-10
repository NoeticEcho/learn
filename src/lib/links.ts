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
/**
 * A lesson's page. The web course's ids have two segments and keep `/lesson/<part>/<lesson>/`; any
 * other course's have three and live below its page, `/course/<course>/<part>/<lesson>/` (spec
 * 2026-11-01 §2, `courseOf`).
 */
export const lesson = (id: string, l: Locale = getLocale()) => {
	const segments = id.split('/');
	if (segments.length === 3) {
		const [course, part, lesson] = segments;
		return slash(resolve('/[[lang=lang]]/course/[course]/[part]/[lesson]', { ...lang(l), course, part, lesson }));
	}
	const [part, lesson] = segments;
	return slash(resolve('/[[lang=lang]]/lesson/[part]/[lesson]', { ...lang(l), part, lesson }));
};
/** A course's page. The web course's lessons, map and gallery keep the addresses above. */
export const course = (id: string, l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]/course/[course]', { ...lang(l), course: id }));
/** The web course's prologue. */
export const prologue = (l: Locale = getLocale()) => slash(resolve('/[[lang=lang]]/course/web/prologue', lang(l)));
/** The Atom feed of new lessons. */
export const feed = (l: Locale = getLocale()) => resolve('/[[lang=lang]]/feed.xml', lang(l));
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
	if (/^\/course\/web\/prologue\/?$/.test(inner)) return prologue(to);
	// a new course's lesson exists in both editions (courses/lessons.ts holds it to that)
	const cl = inner.match(/^\/course\/([^/]+)\/([^/]+)\/([^/]+)\/?$/);
	if (cl) return lesson(`${cl[1]}/${cl[2]}/${cl[3]}`, to);
	const c = inner.match(/^\/course\/([^/]+)\/?$/);
	if (c) return course(c[1], to);
	const screen = inner.replace(/^\/+|\/+$/g, '');
	if (screen === 'map') return map(to);
	if (screen === 'review') return review(to);
	if (screen === 'gallery') return gallery(to);
	if (screen === 'settings') return settings(to);
	return home(to);
}
