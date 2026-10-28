/**
 * What the map, the home page and a lesson's «Дальше» need about every lesson: a summary, not
 * the whole lesson. Built at prerender from the validated content and shipped as page data, so
 * the browser never loads the schema or every lesson's body to draw the map.
 */
import type { Concept, LessonMeta, Part } from './schema.ts';

export type LessonSummary = {
	id: string;
	part: number;
	order: number;
	title: string;
	summary: string;
	minutes: number;
	teaches: string[];
	requires: string[];
	era: number | null;
	practice: boolean;
	/** Set when the lesson is shown in another edition's words: an English map's lesson not yet translated is `ru`. */
	lang?: 'ru';
};

export type Catalogue = { parts: Part[]; concepts: Concept[]; lessons: LessonSummary[] };

export function summarise(l: LessonMeta, parts: Part[]): LessonSummary {
	return {
		id: l.id,
		part: l.part,
		order: l.order,
		title: l.title,
		summary: l.summary,
		minutes: l.minutes,
		teaches: l.teaches,
		requires: l.requires,
		era: l.practice?.era ?? parts.find((p) => p.number === l.part)?.era ?? null,
		practice: !!l.practice
	};
}

/** The URL parts of a lesson id: "02-html/01-first-page" → { part: "02-html", lesson: "01-first-page" }. */
export const lessonParams = (id: string) => {
	const [part, lesson] = id.split('/');
	return { part, lesson };
};

/**
 * What the home page needs about a lesson: its id, its title, and the lessons it waits for (the
 * ones that teach a concept it requires). Home is prerendered with its data inline, so this is
 * paid by every first visit, and it grows with every lesson: no summaries, concepts or parts.
 */
export type HomeLesson = { id: string; title: string; after: string[]; lang?: 'ru' };

/** In curriculum order. The graph has been validated at build time, so every requirement has a teacher. */
export function homeLessons(lessons: LessonSummary[]): HomeLesson[] {
	const teacher = new Map<string, string>();
	for (const l of lessons) for (const c of l.teaches) teacher.set(c, l.id);
	return [...lessons]
		.sort((a, b) => a.part - b.part || a.order - b.order)
		.map((l) => ({
			id: l.id,
			title: l.title,
			...(l.lang ? { lang: l.lang } : {}),
			after: [...new Set(l.requires.map((c) => teacher.get(c)).filter((id): id is string => !!id && id !== l.id))]
		}));
}

/** The first lesson, in curriculum order, not done and waiting for nothing undone (graph.ts nextLessons). */
export function nextHome(lessons: HomeLesson[], done: Set<string>): HomeLesson | undefined {
	return lessons.find((l) => !done.has(l.id) && l.after.every((id) => done.has(id)));
}
