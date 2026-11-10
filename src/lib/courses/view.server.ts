// What a page's server load gives the browser: one language's words of the catalog. Build-time only.
import { catalogue, homeIndex } from '#lib/content/catalogue.server.ts';
import { loadContent, loadEdition } from '#lib/content/load.ts';
import type { Locale } from '#lib/i18n/index.ts';
import { loadCourses } from './load.ts';
import { isPlanned, type Course } from './schema.ts';
import type { CatalogView, CourseNav, CourseRow, CourseView, CourseState } from './types.ts';
import { loadCourseLessons } from './lessons.ts';
import type { CourseLessonMeta } from '#lib/content/schema.ts';
import '#lib/i18n/all.server.ts';
import { t } from '#lib/i18n/index.ts';

/** How many lessons a course has, and how many are open. The web course's are all open. */
export function counts(c: Course, lang: Locale): { lessons: number; open: number } {
	if (!isPlanned(c)) {
		const n = lang === 'ru' ? loadContent().lessons.length : loadEdition(lang).lessons.length;
		return { lessons: n, open: n };
	}
	const all = c.parts.flatMap((p) => p.lessons);
	return { lessons: all.length, open: all.filter((l) => l.status === 'open').length };
}

const stateOf = (lessons: number, open: number): CourseState => (open === 0 ? 'planned' : open < lessons ? 'partly' : 'open');

function row(c: Course, lang: Locale): CourseRow {
	const { lessons, open } = counts(c, lang);
	return { id: c.id, title: c.title[lang], tagline: c.tagline[lang], lessons, open, state: stateOf(lessons, open) };
}

/** The catalog's page data: no lesson of any course, so it grows by a fixed amount per course. */
export function catalogView(lang: Locale): CatalogView {
	const { strands, courses } = loadCourses();
	const byId = new Map(courses.map((c) => [c.id, c]));
	return {
		strands: strands.map((s) => ({ id: s.id, title: s.title[lang], short: s.short[lang], summary: s.summary[lang], courses: s.courses.map((id) => row(byId.get(id)!, lang)) }))
	};
}

export function courseView(id: string, lang: Locale): CourseView | undefined {
	const c = loadCourses().courses.find((x) => x.id === id);
	if (!c) return undefined;
	const head = { title: c.title[lang], tagline: c.tagline[lang], about: c.about[lang] };
	if (isPlanned(c)) {
		const { lessons, open } = counts(c, lang);
		return {
			kind: 'planned',
			id: c.id,
			...head,
			lessons,
			open,
			parts: c.parts.map((p) => ({
				id: p.id,
				title: p.title[lang],
				summary: p.summary[lang],
				lessons: p.lessons.map((l) => ({ id: l.id, title: l.title[lang], summary: l.summary[lang], open: l.status === 'open' }))
			}))
		};
	}
	const { parts, lessons } = catalogue(lang);
	const { hash } = homeIndex(lang);
	return {
		kind: 'web',
		id: 'web',
		...head,
		lessons: lessons.length,
		first: lessons[0]?.id ?? null,
		index: hash,
		// Titles only: the summaries stay on the map, and this page is not paid for 154 times over.
		parts: parts.map((p) => ({
			number: p.number,
			title: p.title,
			summary: p.summary,
			lessons: lessons.filter((l) => l.part === p.number).map((l) => ({ id: l.id, title: l.title, ...(l.lang ? { lang: l.lang } : {}) }))
		}))
	};
}

/** The open lessons of courses other than the web one: their route entries. */
export const openCourseLessons = () => loadCourseLessons();

/**
 * A lesson of a course other than the web one, in an edition, with where it sits: its course, its
 * part and the lesson after it (spec 2026-11-01 §5.4). Undefined for a lesson that is not open.
 */
export function courseLessonView(id: string, lang: Locale): { lesson: CourseLessonMeta; nav: CourseNav } | undefined {
	const entry = loadCourseLessons().find((e) => e.id === id);
	if (!entry) return undefined;
	const c = loadCourses().courses.find((x) => x.id === entry.course);
	if (!c || !isPlanned(c)) return undefined;
	const part = c.parts[entry.partNumber - 1];
	const flat = c.parts.flatMap((p) => p.lessons.map((l) => ({ id: `${c.id}/${p.id}/${l.id}`, title: l.title[lang], open: l.status === 'open' })));
	const next = flat[flat.findIndex((l) => l.id === id) + 1] ?? null;
	return {
		lesson: entry.meta[lang],
		nav: {
			id: c.id,
			title: c.title[lang],
			place: t('course.place', { part: entry.partNumber, n: entry.order }, lang),
			part: { id: part.id, title: part.title[lang], number: entry.partNumber },
			next
		}
	};
}

/** The minutes of a course's open lessons: its workload, for its structured data. */
export function openMinutes(courseId: string): number {
	return loadCourseLessons()
		.filter((e) => e.course === courseId)
		.reduce((n, e) => n + e.meta.ru.minutes, 0);
}
