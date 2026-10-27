import { error } from '@sveltejs/kit';
import { loadContent } from '#lib/content/load.ts';
import { catalogue } from '#lib/content/catalogue.server.ts';
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
	return { lesson, part, catalogue: catalogue() };
};
