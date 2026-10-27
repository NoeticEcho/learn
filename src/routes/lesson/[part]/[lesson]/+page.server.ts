import { error } from '@sveltejs/kit';
import { loadContent } from '#lib/content/load.ts';
import { homeIndex } from '#lib/content/catalogue.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () =>
	loadContent().lessons.map((l) => {
		const [part, lesson] = l.id.split('/');
		return { part, lesson };
	});

export const load: PageServerLoad = ({ params }) => {
	const id = `${params.part}/${params.lesson}`;
	const { lessons, curriculum } = loadContent();
	const lesson = lessons.find((l) => l.id === id);
	if (!lesson) error(404);
	const part = curriculum.parts.find((p) => p.number === lesson.part)!;
	// Not the whole catalogue: inline in every lesson it was 29 KB gzipped and growing with the
	// course, and it tipped the HTML past a slow-start window (+150 ms LCP). The lesson names
	// the concepts it teaches, and «Дальше» reads which lessons it opens from the home's hashed
	// lesson list, fetched after mount and cached by the service worker.
	const concepts = lesson.teaches.map((c) => curriculum.concepts.find((x) => x.id === c)?.title ?? c);
	return { lesson, part, concepts, index: homeIndex().hash };
};
