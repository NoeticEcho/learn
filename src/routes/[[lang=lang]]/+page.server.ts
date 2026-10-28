import { homeIndex } from '#lib/content/catalogue.server.ts';
import { loadContent } from '#lib/content/load.ts';
import { homeCard, og } from '#lib/seo/pages.server.ts';
import type { EntryGenerator } from './$types';

// Russian is found by the crawl from the base; English is named.
export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

/**
 * Only what home's first paint uses: it is inlined into the first page, so every byte here is on
 * every first visit. That is the first lesson (the prologue's «Начать») and the count; the
 * returning home's lesson list is fetched from `data/home-<index>.json`, a hashed file, once the store says the
 * person has been here before. Its size does not grow with the course (tests/unit/home-data.test.ts).
 * The head's share: the card's file (its alt text is a fixed string) and the course's minutes.
 */
export function load({ params }: { params: { lang?: string } }) {
	const lang = params.lang === 'en' ? 'en' : 'ru';
	const { lessons, hash } = homeIndex(lang);
	const minutes = loadContent().lessons.reduce((n, l) => n + l.minutes, 0);
	return { home: { first: lessons[0]?.id ?? null, total: lessons.length, index: hash }, seo: { og: og(homeCard(lang)).file, minutes } };
}
