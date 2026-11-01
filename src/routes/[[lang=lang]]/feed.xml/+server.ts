// The Atom feed of new lessons (docs/specs/2026-11-01-platform-design.md §5.5), one per edition:
// /learn/feed.xml and /learn/en/feed.xml. There are no accounts and no e-mail, so this is how a
// person follows new lessons without being tracked: their reader asks a static file.
import { atomFeed } from '#lib/seo/feed.server.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

export const GET: RequestHandler = ({ params }) =>
	new Response(atomFeed(params.lang === 'en' ? 'en' : 'ru'), { headers: { 'content-type': 'application/atom+xml; charset=utf-8' } });
