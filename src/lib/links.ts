/**
 * Every internal link, with the base path and the trailing slash the static build needs
 * (`trailingSlash: 'always'`), so a link never costs a redirect on GitHub Pages.
 */
import { resolve } from '$app/paths';

export const home = () => resolve('/');
export const map = () => `${resolve('/map')}/`;
export const review = () => `${resolve('/review')}/`;
export const gallery = () => `${resolve('/gallery')}/`;
export const settings = () => `${resolve('/settings')}/`;
export const lesson = (id: string) => {
	const [part, lesson] = id.split('/');
	return `${resolve('/lesson/[part]/[lesson]', { part, lesson })}/`;
};
/** The returning home's lesson list, named by its content's hash (catalogue.server.ts homeIndex). */
export const homeIndex = (hash: string) => resolve('/data/home-[hash].json', { hash });
