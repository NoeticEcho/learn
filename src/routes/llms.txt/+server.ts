// llms.txt for answer engines (lib/seo/llms.server.ts).
import { llmsTxt } from '#lib/seo/llms.server.ts';

export const prerender = true;

export function GET() {
	return new Response(llmsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
