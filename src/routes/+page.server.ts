import { catalogue } from '#lib/content/catalogue.server.ts';
import { homeLessons } from '#lib/content/catalogue.ts';

// Only what home uses: it is inlined into the first page, so every byte here is on every first visit.
export function load() {
	return { home: { lessons: homeLessons(catalogue().lessons) } };
}
