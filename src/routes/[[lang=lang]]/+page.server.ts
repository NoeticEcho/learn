import { catalogView, courseView } from '#lib/courses/view.server.ts';
import { catalogCard, og } from '#lib/seo/pages.server.ts';
import type { EntryGenerator } from './$types';

// Russian is found by the crawl from the base; English is named.
export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

/**
 * The catalog (docs/specs/2026-11-01-platform-design.md §5.1). What it carries is inlined into the
 * first page, so it holds each course's line and two counts, and no lesson of any course. A
 * returning person's next lesson comes from the hashed lesson list, fetched once the store says
 * they have been here before.
 */
export function load({ params }: { params: { lang?: string } }) {
	const lang = params.lang === 'en' ? 'en' : 'ru';
	const web = courseView('web', lang);
	return { catalog: catalogView(lang), index: web?.kind === 'web' ? web.index : '', seo: { og: og(catalogCard(lang)) } };
}
