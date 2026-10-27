// llms-full.txt for answer engines (lib/seo/llms.server.ts).
import { llmsFullTxt } from '#lib/seo/llms.server.ts';

export const prerender = true;

export function GET() {
	return new Response(llmsFullTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
