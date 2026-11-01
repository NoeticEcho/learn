/**
 * Loads and validates the catalog's content. Eager, so build-time and test-time only: a server
 * load, the content CLI, the tests. The browser gets what a page needs as page data.
 */
import { parse } from 'yaml';
import { validateCourses, type Courses } from './schema.ts';

const raw = import.meta.glob<string>('/content/courses/*.yaml', { query: '?raw', import: 'default', eager: true });

let cached: Courses | undefined;

export function loadCourses(): Courses {
	if (cached) return cached;
	let index: unknown;
	let news: unknown;
	const files: Record<string, unknown> = {};
	for (const [path, src] of Object.entries(raw)) {
		const name = path.replace(/^.*\/|\.yaml$/g, '');
		if (name === 'index') index = parse(src);
		else if (name === 'news') news = parse(src);
		else files[name] = parse(src);
	}
	cached = validateCourses(index, files, news);
	return cached;
}
