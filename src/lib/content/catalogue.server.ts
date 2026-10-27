// Build-time only (the `.server` suffix keeps it out of the browser): the catalogue from content.
import { createHash } from 'node:crypto';
import { loadContent } from './load.ts';
import { homeLessons, summarise, type Catalogue, type HomeLesson } from './catalogue.ts';

export function catalogue(): Catalogue {
	const { curriculum, lessons } = loadContent();
	return {
		parts: curriculum.parts,
		concepts: curriculum.concepts,
		lessons: lessons.map((l) => summarise(l, curriculum.parts)).sort((a, b) => a.part - b.part || a.order - b.order)
	};
}

/**
 * The returning home's lesson list, as a file of its own named by its content's hash
 * (`data/home-<hash>.json`). Home's inline data names the file instead of carrying the list, so
 * the first page stays the same size however long the course grows; the hash lets the service
 * worker serve it cache-first, as it does the build's immutable files.
 */
export function homeIndex(): { lessons: HomeLesson[]; json: string; hash: string } {
	const lessons = homeLessons(catalogue().lessons);
	const json = JSON.stringify(lessons);
	return { lessons, json, hash: createHash('sha256').update(json).digest('hex').slice(0, 12) };
}
