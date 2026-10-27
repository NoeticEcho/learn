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
