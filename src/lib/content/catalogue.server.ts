// Build-time only (the `.server` suffix keeps it out of the browser): the catalogue from content.
import { createHash } from 'node:crypto';
import type { Locale } from '#lib/i18n/index.ts';
import { loadContent, loadEdition } from './load.ts';
import { homeLessons, summarise, type Catalogue, type HomeLesson, type LessonSummary } from './catalogue.ts';

/**
 * An edition's catalogue: its parts and concepts in its own words, and every lesson of the
 * course, in its words where it is translated and in Russian (marked `lang: 'ru'`) where it is
 * not yet, so the map of every edition shows the whole course.
 */
export function catalogue(lang: Locale = 'ru'): Catalogue {
	const { lessons } = loadContent();
	const e = loadEdition(lang);
	const own = new Map(e.lessons.map((l) => [l.id, l]));
	const summaries: LessonSummary[] = lessons.map((ru) => {
		const l = own.get(ru.id);
		return l ? summarise(l, e.curriculum.parts) : { ...summarise(ru, e.curriculum.parts), lang: 'ru' as const };
	});
	return {
		parts: e.curriculum.parts,
		concepts: e.curriculum.concepts,
		lessons: summaries.sort((a, b) => a.part - b.part || a.order - b.order)
	};
}

/**
 * The returning home's lesson list, as a file of its own named by its content's hash
 * (`data/home-<hash>.json`), one per edition. Home's inline data names the file instead of
 * carrying the list, so the first page stays the same size however long the course grows; the
 * hash lets the service worker serve it cache-first, as it does the build's immutable files.
 */
export function homeIndex(lang: Locale = 'ru'): { lessons: HomeLesson[]; json: string; hash: string } {
	const lessons = homeLessons(catalogue(lang).lessons);
	const json = JSON.stringify(lessons);
	return { lessons, json, hash: createHash('sha256').update(json).digest('hex').slice(0, 12) };
}
