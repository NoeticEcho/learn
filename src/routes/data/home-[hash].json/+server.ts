// The returning home's lesson list (catalogue.server.ts homeIndex), prerendered as a static file.
import { error } from '@sveltejs/kit';
import { homeIndex } from '#lib/content/catalogue.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => [{ hash: homeIndex().hash }];

export const GET: RequestHandler = ({ params }) => {
	const { json, hash } = homeIndex();
	if (params.hash !== hash) error(404, 'Not found');
	return new Response(json, { headers: { 'content-type': 'application/json' } });
};
