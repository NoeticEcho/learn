// The returning home's lesson list of each edition (catalogue.server.ts homeIndex), prerendered as a static file.
import { error } from '@sveltejs/kit';
import { homeIndex } from '#lib/content/catalogue.server.ts';
import { LOCALES } from '#lib/i18n/index.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => LOCALES.map((l) => ({ hash: homeIndex(l).hash }));

export const GET: RequestHandler = ({ params }) => {
	const index = LOCALES.map((l) => homeIndex(l)).find((i) => i.hash === params.hash);
	if (!index) error(404, 'Not found');
	return new Response(index.json, { headers: { 'content-type': 'application/json' } });
};
