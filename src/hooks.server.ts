// The document's language, in app.html's <html lang="%learn.lang%">, from the page's edition: the
// prerendered HTML says it before any script runs, as a screen reader, a search engine and the
// browser's translate offer need. The base is for app.html's pre-paint script, which sends a
// person who chose English from the Russian home to the English one.
import type { Handle } from '@sveltejs/kit/hooks';
import { BASE, editionOf } from '#lib/seo/site.ts';

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%learn.lang%', editionOf(event.url.pathname)).replaceAll('%learn.base%', BASE)
	});
