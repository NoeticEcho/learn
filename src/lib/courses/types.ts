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
