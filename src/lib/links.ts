/**
 * Every internal link, with the base path and the trailing slash the static build needs
 * (`trailingSlash: 'always'`), so a link never costs a redirect on GitHub Pages.
 */
import { resolve } from '$app/paths';

export const home = () => resolve('/');
export const map = () => `${resolve('/map')}/`;
