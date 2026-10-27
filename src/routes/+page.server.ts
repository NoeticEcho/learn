import { homeIndex } from '#lib/content/catalogue.server.ts';

/**
 * Only what home's first paint uses: it is inlined into the first page, so every byte here is on
 * every first visit. That is the first lesson (the prologue's «Начать») and the count; the
 * returning home's lesson list is fetched from `data/home-<index>.json`, a hashed file, once the store says the
 * person has been here before. Its size does not grow with the course (tests/unit/home-data.test.ts).
 */
export function load() {
	const { lessons, hash } = homeIndex();
	return { home: { first: lessons[0]?.id ?? null, total: lessons.length, index: hash } };
}
