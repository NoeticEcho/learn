/**
 * The catalog's content (docs/specs/2026-11-01-platform-design.md §4): `content/courses/index.yaml`,
 * one `content/courses/<id>.yaml` per course, and `news.yaml`. Both languages sit side by side in
 * one file, so a table of contents cannot drift between editions: there is one list of ids, and
 * the schema refuses a line in one language only.
 *
 * Build-time and test-time only: the browser gets the validated data from a server load.
 */
import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'a lowercase slug, without a leading number');

/** A title: short, no full stop at the end. */
const Title = z
	.object({ ru: z.string().min(2).max(90), en: z.string().min(2).max(90) })
	.strict()
	.refine((t) => !/\.$/.test(t.ru) && !/\.$/.test(t.en), 'a title has no full stop');

const sentence = (max: number) =>
	z
		.string()
		.min(20)
		.max(max)
		.regex(/[.!?]$|[.!?]»$|[.!?]”$/, 'ends a sentence');
const Sentence = (max: number) => z.object({ ru: sentence(max), en: sentence(max) }).strict();

export const CourseLesson = z
	.object({
		id: slug,
		title: Title,
		summary: Sentence(220),
		status: z.enum(['planned', 'open']).default('planned'),
		/** When the lesson opened; the feed's date. Required of an open lesson. */
		published: z.string().regex(/^\d{4}-\d\d-\d\d$/).optional(),
		/** The last lesson of a course that looks into the near future. */
		ahead: z.literal(true).optional()
	})
	.strict();
export type CourseLesson = z.infer<typeof CourseLesson>;

export const CoursePart = z.object({ id: slug, title: Title, summary: Sentence(220), lessons: z.array(CourseLesson).min(2) }).strict();
export type CoursePart = z.infer<typeof CoursePart>;

const CourseHead = {
	id: slug,
	title: Title,
	/** One sentence: the catalog's line and the meta description. */
	tagline: z.object({ ru: sentence(160).min(50), en: sentence(160).min(50) }).strict(),
	/** Up to three sentences: who it is for and what they can do after it. */
	about: Sentence(520)
};

/** The web course: its table of contents is the curriculum and the written lessons. */
export const SourcedCourse = z.object({ ...CourseHead, source: z.literal('curriculum') }).strict();
export const PlannedCourse = z.object({ ...CourseHead, history: z.boolean(), parts: z.array(CoursePart).min(2) }).strict();
export const Course = z.union([SourcedCourse, PlannedCourse]);
export type SourcedCourse = z.infer<typeof SourcedCourse>;
export type PlannedCourse = z.infer<typeof PlannedCourse>;
export type Course = z.infer<typeof Course>;

/** `short` is the strand's name on a card, beside the course's lesson count: one or two words. */
export const Strand = z
	.object({ id: slug, title: Title, short: z.object({ ru: z.string().min(2).max(24), en: z.string().min(2).max(24) }).strict(), summary: Sentence(280), courses: z.array(slug).min(1) })
	.strict();
export const CourseIndex = z.object({ strands: z.array(Strand).min(2) }).strict();
export type Strand = z.infer<typeof Strand>;

export const NewsItem = z
	.object({
		id: slug,
		date: z.string().regex(/^\d{4}-\d\d-\d\d$/),
		title: Title,
		summary: Sentence(400),
		/** The course it is about; the entry links to its page. Without it, the catalog. */
		course: slug.optional()
	})
	.strict();
export const News = z.object({ items: z.array(NewsItem) }).strict();
export type NewsItem = z.infer<typeof NewsItem>;

export const MIN_COURSES = 15;
export const MAX_COURSES = 28;

export const isPlanned = (c: Course): c is PlannedCourse => 'parts' in c;

export type Courses = { strands: Strand[]; courses: Course[]; news: NewsItem[] };

export class CoursesError extends Error {
	constructor(public problems: string[]) {
		super(`courses: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
	}
}

const issues = (where: string, e: z.ZodError) => e.issues.map((i) => `${where}: ${i.path.map(String).join('.') || '(root)'}: ${i.message}`);
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Validates everything at once and throws every problem, so one run names them all. `files` maps a
 * course id, taken from its file's name, to its parsed YAML; a key of `index` and `news` is not a course.
 */
export function validateCourses(index: unknown, files: Record<string, unknown>, news: unknown = { items: [] }): Courses {
	const problems: string[] = [];
	const ix = CourseIndex.safeParse(index);
	if (!ix.success) problems.push(...issues('content/courses/index.yaml', ix.error));
	const ns = News.safeParse(news);
	if (!ns.success) problems.push(...issues('content/courses/news.yaml', ns.error));

	const byId = new Map<string, Course>();
	const titles = new Map<string, string>();
	for (const [id, raw] of Object.entries(files)) {
		const where = `content/courses/${id}.yaml`;
		const r = Course.safeParse(raw);
		if (!r.success) {
			// the union's message says only that neither fits: name the fields of the one this file means
			const meant = raw && typeof raw === 'object' && 'source' in raw ? SourcedCourse : PlannedCourse;
			const m = meant.safeParse(raw);
			problems.push(...issues(where, m.success ? r.error : m.error));
			continue;
		}
		const c = r.data;
		if (c.id !== id) problems.push(`${where}: id ${c.id} does not match its file's name`);
		byId.set(c.id, c);
		if (!isPlanned(c)) continue;

		const partIds = new Set<string>();
		const lessonIds = new Set<string>();
		const all = c.parts.flatMap((p) => p.lessons);
		for (const p of c.parts) {
			if (partIds.has(p.id)) problems.push(`${where}: part id ${p.id} is used twice`);
			partIds.add(p.id);
			for (const l of p.lessons) {
				if (lessonIds.has(l.id)) problems.push(`${where}: lesson id ${l.id} is used twice`);
				lessonIds.add(l.id);
				if (l.status === 'open' && !l.published) problems.push(`${where}: lesson ${l.id} is open and has no published date`);
				if (l.status === 'planned' && l.published) problems.push(`${where}: lesson ${l.id} is planned and has a published date`);
				if (l.ahead && l !== all.at(-1)) problems.push(`${where}: lesson ${l.id} looks ahead and is not the last`);
				for (const lang of ['ru', 'en'] as const) {
					const key = `${lang}:${norm(l.title[lang])}`;
					const prior = titles.get(key);
					if (prior) problems.push(`${where}: lesson ${l.id}'s ${lang} title is also ${prior}'s: «${l.title[lang]}»`);
					titles.set(key, `${c.id}/${l.id}`);
				}
			}
		}
		if (c.history && !all.at(-1)?.ahead) problems.push(`${where}: it tells a history, and its last lesson does not look ahead (ahead: true)`);
	}

	const listed = ix.success ? ix.data.strands.flatMap((s) => s.courses) : [];
	if (ix.success) {
		const seen = new Set<string>();
		for (const id of listed) {
			if (seen.has(id)) problems.push(`content/courses/index.yaml: ${id} is listed twice`);
			seen.add(id);
			if (!(id in files)) problems.push(`content/courses/index.yaml: no file content/courses/${id}.yaml`);
		}
		for (const id of Object.keys(files)) if (!seen.has(id)) problems.push(`content/courses/${id}.yaml: not in index.yaml`);
		if (listed[0] !== 'web') problems.push('content/courses/index.yaml: the web course must be first');
		if (listed[1] !== 'ai') problems.push('content/courses/index.yaml: the AI course must be second');
		if (listed.length < MIN_COURSES || listed.length > MAX_COURSES) problems.push(`content/courses/index.yaml: ${listed.length} courses, and the catalog holds ${MIN_COURSES} to ${MAX_COURSES}`);
	}
	if (ns.success) for (const n of ns.data.items) if (n.course && !(n.course in files)) problems.push(`content/courses/news.yaml: ${n.id} names no course ${n.course}`);

	if (problems.length) throw new CoursesError(problems);
	return { strands: ix.data!.strands, courses: listed.map((id) => byId.get(id)!), news: ns.data!.items };
}
