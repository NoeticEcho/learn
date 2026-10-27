// The Open Graph cards (lib/seo/og.server.ts), drawn at prerender and written as static PNGs.
import { error } from '@sveltejs/kit';
import { ogPng } from '#lib/seo/og.server.ts';
import { cards } from '#lib/seo/pages.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => [...cards().keys()].map((file) => ({ name: file.replace(/\.png$/, '') }));

export const GET: RequestHandler = async ({ params }) => {
	const card = cards().get(`${params.name}.png`);
	if (!card) error(404, 'Not found');
	const png = await ogPng(card);
	return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
