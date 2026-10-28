// llms.txt for answer engines (lib/seo/llms.server.ts), one per edition: /learn/llms.txt and /learn/en/llms.txt.
import { llmsTxt } from '#lib/seo/llms.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

export const GET: RequestHandler = ({ params }) =>
	new Response(llmsTxt(params.lang === 'en' ? 'en' : 'ru'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
