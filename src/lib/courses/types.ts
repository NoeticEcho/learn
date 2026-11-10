/**
 * What the browser gets about the catalog: one language's words, as page data. The YAML and its
 * schema stay on the server (load.ts, schema.ts). `courseOf` is here because the store needs it.
 */
export type CourseState = 'open' | 'partly' | 'planned';

export type CourseRow = { id: string; title: string; tagline: string; lessons: number; open: number; state: CourseState };
export type StrandView = { id: string; title: string; short: string; summary: string; courses: CourseRow[] };
export type CatalogView = { strands: StrandView[] };

export type PlannedLessonView = { id: string; title: string; summary: string; open: boolean };
export type PlannedPartView = { id: string; title: string; summary: string; lessons: PlannedLessonView[] };
export type PlannedCourseView = {
	kind: 'planned';
	id: string;
	title: string;
	tagline: string;
	about: string;
	lessons: number;
	open: number;
	parts: PlannedPartView[];
};

export type WebLessonView = { id: string; title: string; lang?: 'ru' };
export type WebPartView = { number: number; title: string; summary: string; lessons: WebLessonView[] };
export type WebCourseView = {
	kind: 'web';
	id: 'web';
	title: string;
	tagline: string;
	about: string;
	lessons: number;
	/** The first lesson, and the hashed lesson list a returning person's next lesson is read from. */
	first: string | null;
	index: string;
	parts: WebPartView[];
};
export type CourseView = PlannedCourseView | WebCourseView;

/**
 * The course a lesson belongs to, from its id alone. The web course's ids have two segments
 * (`02-html/01-first-page`), as they always had, so no key in a learner's store changes; a new
 * course's have three (`ai/symbols/eliza`), so they cannot collide with them.
 */
export const WEB = 'web';
export const courseOf = (lessonId: string): string => {
	const parts = lessonId.split('/');
	return parts.length === 3 ? parts[0] : WEB;
};

/**
 * The file that holds a lesson's body in an edition, from its id alone, relative to the
 * repository's root: `content/<lang>/<part>/<lesson>.svx` for the web course, and
 * `content/courses/<course>/<lang>/<part>/<lesson>.svx` for any other (spec 2026-11-01 §5.4).
 */
export const lessonFile = (id: string, lang: string): string => {
	const p = id.split('/');
	return p.length === 3 ? `content/courses/${p[0]}/${lang}/${p[1]}/${p[2]}.svx` : `content/${lang}/${id}.svx`;
};

/**
 * Where a lesson of a course other than the web one sits, for its page: the course and its page,
 * the part, and the lesson after it in the course's order, which may not be open yet. The web
 * course's lessons have none of this: their map and their concept graph say it.
 */
export type CourseNav = {
	id: string;
	title: string;
	/** «Часть 1, урок 2»: the lesson's place, in the page's language. */
	place: string;
	part: { id: string; title: string; number: number };
	/** The next lesson in the course's order: a link when it is open, its title and «скоро» when not. */
	next: { id: string; title: string; open: boolean } | null;
};
