/**
 * The lessons of the courses other than the web one (docs/specs/2026-11-01-platform-design.md
 * §5.4): `content/courses/<course>/<lang>/<part>/<lesson>.svx`, one file per edition, validated
 * against the course's file and against each other. Build-time and test-time only: eager, like
 * the web course's loader (content/load.ts), and never imported by a component.
 *
 * The course file says which lessons exist and which are open; a body file says what an open
 * lesson teaches. So the rules run both ways:
 * - every open lesson has a body in both editions, and a body belongs to an open lesson. A
 *   planned lesson has no page (§3, «No thin URLs»), so a body for one is refused rather than
 *   left unpublished and unchecked;
 * - a body's id is its path, and its title is the course file's title in that language, so the
 *   table of contents, the feed and the page cannot name one lesson two ways;
 * - the editions mirror each other where a learner's store and the narration are keyed: the
 *   same card ids, the same number of sections, the same live diagrams. The words, the quiz and
 *   the sources are each edition's own, as in the web course;
 * - a card id is unique across the platform, because review keys a card by its id alone.
 */
import type { Locale } from '#lib/i18n/index.ts';
import { CourseLessonMeta, CourseLessonMetaEn, type CourseLessonMeta as Meta } from '#lib/content/schema.ts';
import { ContentError, loadContent } from '#lib/content/load.ts';
import { isPlanned, type Courses, type PlannedCourse } from './schema.ts';
import { loadCourses } from './load.ts';
import { lessonFile } from './types.ts';

type Module = { metadata?: unknown };

/** An open lesson of a course, in the course's order, with both editions' metadata. */
export type CourseLessonEntry = {
	id: string;
	course: string;
	part: string;
	/** The part's number in the course, from 1. */
	partNumber: number;
	lesson: string;
	/** The lesson's number in its part, from 1. */
	order: number;
	published: string;
	meta: Record<Locale, Meta>;
};

const LANGS: Locale[] = ['ru', 'en'];
const issues = (where: string, e: { issues: { path: PropertyKey[]; message: string }[] }) =>
	e.issues.map((i) => `${where}: ${i.path.map(String).join('.') || '(root)'}: ${i.message}`);

/** The `##` sections of a body, as the narration and the page split it. */
const sections = (raw: string) => [...raw.matchAll(/^## /gm)].length;
/** The live diagrams a body imports. */
const diagrams = (raw: string) => [...raw.matchAll(/^\s*import (\w+) from ['"][^'"]*\/diagrams\/[^'"]+['"]/gm)].map((m) => m[1]).sort();

/**
 * Validates the bodies against the catalog and each other, and throws every problem at once.
 * `modules` and `raw` are keyed by the file's path from the root (`/content/courses/…`);
 * `cardIds` are the card ids already taken (the web course's), with the lesson that took each.
 */
export function validateCourseLessons(
	modules: Record<string, Module>,
	raw: Record<string, string>,
	{ courses }: Pick<Courses, 'courses'>,
	cardIds: Map<string, string> = new Map()
): CourseLessonEntry[] {
	const problems: string[] = [];
	const planned = courses.filter(isPlanned);
	const found = new Map<string, Partial<Record<Locale, Meta>>>();

	for (const [path, mod] of Object.entries(modules)) {
		const file = path.replace(/^\//, '');
		const m = file.match(/^content\/courses\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)\.svx$/);
		if (!m) {
			problems.push(`${file}: a lesson lives at content/courses/<course>/<lang>/<part>/<lesson>.svx`);
			continue;
		}
		const [, courseId, lang, partId, lessonId] = m;
		if (lang !== 'ru' && lang !== 'en') {
			problems.push(`${file}: no edition ${lang}; the editions are ru and en`);
			continue;
		}
		const id = `${courseId}/${partId}/${lessonId}`;
		const course = planned.find((c) => c.id === courseId);
		const lesson = course?.parts.find((p) => p.id === partId)?.lessons.find((l) => l.id === lessonId);
		if (!lesson) {
			problems.push(`${file}: content/courses/${courseId}.yaml has no lesson ${lessonId} in a part ${partId}`);
			continue;
		}
		if (lesson.status !== 'open')
			problems.push(`${file}: ${id} is planned in content/courses/${courseId}.yaml; a planned lesson has no page, so its body waits off main until it opens`);
		const r = (lang === 'ru' ? CourseLessonMeta : CourseLessonMetaEn).safeParse(mod.metadata);
		if (!r.success) {
			problems.push(...issues(file, r.error));
			continue;
		}
		const l = r.data;
		if (l.id !== id) problems.push(`${file}: id ${l.id} does not match its path ${id}`);
		if (l.title !== lesson.title[lang]) problems.push(`${file}: title «${l.title}» is not the course file's «${lesson.title[lang]}»`);
		if (lang === 'en' && !l.sources.some((s) => s.lang === 'en')) problems.push(`${file}: no source in English; the edition cites its own language first`);
		found.set(id, { ...found.get(id), [lang]: l });
	}

	const entries: CourseLessonEntry[] = [];
	const taken = new Map(cardIds);
	for (const c of planned as PlannedCourse[])
		c.parts.forEach((p, pi) =>
			p.lessons.forEach((l, li) => {
				if (l.status !== 'open') return;
				const id = `${c.id}/${p.id}/${l.id}`;
				const both = found.get(id) ?? {};
				const missing = LANGS.filter((lang) => !both[lang]);
				for (const lang of missing) problems.push(`content/courses/${c.id}.yaml: ${id} is open and has no body ${lessonFile(id, lang)}`);
				if (missing.length) return;
				const [ru, en] = [both.ru!, both.en!];
				const cards = (x: Meta) => x.cards.map((k) => k.id).sort();
				if (JSON.stringify(cards(ru)) !== JSON.stringify(cards(en)))
					problems.push(`${lessonFile(id, 'en')}: card ids are ${JSON.stringify(cards(en))}, the Russian lesson's are ${JSON.stringify(cards(ru))}`);
				const [rawRu, rawEn] = [raw[`/${lessonFile(id, 'ru')}`] ?? '', raw[`/${lessonFile(id, 'en')}`] ?? ''];
				if (sections(rawRu) !== sections(rawEn))
					problems.push(`${lessonFile(id, 'en')}: ${sections(rawEn)} sections, the Russian lesson has ${sections(rawRu)}`);
				if (JSON.stringify(diagrams(rawRu)) !== JSON.stringify(diagrams(rawEn)))
					problems.push(`${lessonFile(id, 'en')}: diagrams ${JSON.stringify(diagrams(rawEn))}, the Russian lesson's are ${JSON.stringify(diagrams(rawRu))}`);
				for (const k of ru.cards) {
					const prior = taken.get(k.id);
					if (prior) problems.push(`${lessonFile(id, 'ru')}: card id ${k.id} is already ${prior}'s; review keys a card by its id alone`);
					taken.set(k.id, id);
				}
				entries.push({ id, course: c.id, part: p.id, partNumber: pi + 1, lesson: l.id, order: li + 1, published: l.published!, meta: { ru, en } });
			})
		);

	if (problems.length) throw new ContentError(problems);
	return entries;
}

let cached: CourseLessonEntry[] | undefined;

/** Every open lesson of every course but the web one, in catalog order, validated. */
export function loadCourseLessons(): CourseLessonEntry[] {
	if (!cached) {
		const modules = import.meta.glob<Module>('/content/courses/**/*.svx', { eager: true });
		const raw = import.meta.glob<string>('/content/courses/**/*.svx', { query: '?raw', import: 'default', eager: true });
		const web = new Map(loadContent().lessons.flatMap((l) => l.cards.map((k) => [k.id, l.id] as const)));
		cached = validateCourseLessons(modules, raw, loadCourses(), web);
	}
	return cached;
}
