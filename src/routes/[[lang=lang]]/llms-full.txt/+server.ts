// llms-full.txt for answer engines (lib/seo/llms.server.ts), one per edition: /learn/llms-full.txt and /learn/en/llms-full.txt.
import { llmsFullTxt } from '#lib/seo/llms.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

export const GET: RequestHandler = ({ params }) =>
	new Response(llmsFullTxt(params.lang === 'en' ? 'en' : 'ru'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
