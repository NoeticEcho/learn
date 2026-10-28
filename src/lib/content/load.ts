/**
 * Loads every lesson and the curriculum, validates them with the schema, and builds the graph.
 * Throws with every error at once, so one run of the build names every broken lesson.
 *
 * Eager by design, so it belongs to build-time code only: server loads (prerendered), the
 * content CLI and the tests. The browser gets the validated data from those loads, and imports
 * a lesson's body lazily; this module must not be imported by a component.
 */
import { parse } from 'yaml';
import curriculumSource from '../../../content/curriculum.yaml?raw';
import curriculumEnSource from '../../../content/en/curriculum.yaml?raw';
import type { Locale } from '#lib/i18n/index.ts';
import { Curriculum, CurriculumWords, LessonMeta, LessonMetaEn } from './schema.ts';
import { buildGraph, type Graph } from './graph.ts';

type Module = { metadata?: unknown; default?: unknown };

export type Content = { curriculum: Curriculum; lessons: LessonMeta[]; graph: Graph<LessonMeta> };

export class ContentError extends Error {
	constructor(public problems: string[]) {
		super(`content: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
	}
}

const issues = (where: string, e: { issues: { path: PropertyKey[]; message: string }[] }) =>
	e.issues.map((i) => `${where}: ${i.path.map(String).join('.') || '(root)'}: ${i.message}`);

export function validate(modules: Record<string, Module>, yamlSource: string): Content {
	const problems: string[] = [];

	const cur = Curriculum.safeParse(parse(yamlSource));
	if (!cur.success) problems.push(...issues('content/curriculum.yaml', cur.error));

	const lessons: LessonMeta[] = [];
	for (const [file, mod] of Object.entries(modules)) {
		const r = LessonMeta.safeParse(mod.metadata);
		if (!r.success) {
			problems.push(...issues(file, r.error));
			continue;
		}
		const expected = file.replace(/^.*\/content\/ru\//, '').replace(/\.svx$/, '');
		if (r.data.id !== expected) problems.push(`${file}: id ${r.data.id} does not match its path ${expected}`);
		const slug = expected.split('/')[0];
		if (cur.success) {
			const part = cur.data.parts.find((p) => p.slug === slug);
			if (!part) problems.push(`${file}: no part with slug ${slug}`);
			else if (part.number !== r.data.part) problems.push(`${file}: part ${r.data.part} but ${slug} is ${part.number}`);
		}
		lessons.push(r.data);
	}

	problems.push(...practiceProblems(lessons));

	const curriculum = cur.success ? cur.data : { parts: [], concepts: [] };
	const graph = buildGraph(lessons, curriculum);
	problems.push(...graph.errors);

	if (problems.length) throw new ContentError(problems);
	return { curriculum, lessons, graph };
}

/**
 * Practice is saved by step id, so an id is unique across the course; and a step that
 * `continues` another names an earlier step (in curriculum order) of the same era.
 */
export function practiceProblems(lessons: LessonMeta[]): string[] {
	const problems: string[] = [];
	const ordered = [...lessons].sort((a, b) => a.part - b.part || a.order - b.order);
	const seen = new Map<string, { lesson: string; era: number }>();
	for (const l of ordered) {
		const p = l.practice;
		if (!p) continue;
		const prior = seen.get(p.id);
		if (prior) problems.push(`${l.id}: practice id ${p.id} is already used by ${prior.lesson}`);
		if (p.continues) {
			const from = seen.get(p.continues);
			if (!from) problems.push(`${l.id}: practice continues ${p.continues}, which is no earlier step`);
			else if (from.era !== p.era) problems.push(`${l.id}: practice continues ${p.continues} of era ${from.era}, not era ${p.era}`);
		}
		if (!prior) seen.set(p.id, { lesson: l.id, era: p.era });
	}
	return problems;
}

let cached: Content | undefined;

/** The Russian edition: the source of the course's structure, its graph and every lesson. */
export function loadContent(): Content {
	if (!cached) {
		const modules = import.meta.glob<Module>('/content/ru/**/*.svx', { eager: true });
		cached = validate(modules, curriculumSource);
	}
	return cached;
}

/**
 * An edition of the course (docs/content-plan/README.md, «English edition»). Its curriculum is
 * the Russian one with the edition's words for parts and concepts; its lessons are the ones
 * written in it, each the counterpart of a Russian lesson with the same id; `missing` is every
 * Russian lesson it has no translation of yet, in curriculum order.
 */
export type Edition = { lang: Locale; curriculum: Curriculum; lessons: LessonMeta[]; missing: string[] };

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const sameSet = (a: readonly string[], b: readonly string[]) => sameList([...a].sort(), [...b].sort());

/**
 * Validates the English edition against the Russian one. A translation keeps everything that
 * progress and the graph are keyed by, so a learner who switches language keeps their work:
 * the id and its place (part, order), the concepts it teaches and requires, its practice step's
 * id, era, `continues` and check ids, and its card ids. Its words, its quiz and its sources are
 * its own. Every part and concept needs an English title (content/en/curriculum.yaml).
 */
export function validateEdition(modules: Record<string, Module>, wordsSource: string, ru: Content, lang: Locale = 'en'): Edition {
	const problems: string[] = [];
	const where = `content/${lang}/curriculum.yaml`;
	const w = CurriculumWords.safeParse(parse(wordsSource));
	if (!w.success) problems.push(...issues(where, w.error));
	const words = w.success ? w.data : { parts: {}, concepts: {} };
	for (const p of ru.curriculum.parts) if (!words.parts[p.slug]) problems.push(`${where}: no title for part ${p.slug}`);
	for (const slug of Object.keys(words.parts))
		if (!ru.curriculum.parts.some((p) => p.slug === slug)) problems.push(`${where}: no part ${slug} in content/curriculum.yaml`);
	for (const c of ru.curriculum.concepts) if (!words.concepts[c.id]) problems.push(`${where}: no title for concept ${c.id}`);
	for (const id of Object.keys(words.concepts))
		if (!ru.curriculum.concepts.some((c) => c.id === id)) problems.push(`${where}: no concept ${id} in content/curriculum.yaml`);

	const byId = new Map(ru.lessons.map((l) => [l.id, l]));
	const lessons: LessonMeta[] = [];
	for (const [file, mod] of Object.entries(modules)) {
		const r = LessonMetaEn.safeParse(mod.metadata);
		if (!r.success) {
			problems.push(...issues(file, r.error));
			continue;
		}
		const l = r.data;
		const expected = file.replace(new RegExp(`^.*/content/${lang}/`), '').replace(/\.svx$/, '');
		if (l.id !== expected) problems.push(`${file}: id ${l.id} does not match its path ${expected}`);
		const src = byId.get(l.id);
		if (!src) {
			problems.push(`${file}: no Russian lesson ${l.id} to be the translation of`);
			continue;
		}
		const differ = (what: string, a: unknown, b: unknown) => problems.push(`${file}: ${what} is ${JSON.stringify(a)}, the Russian lesson's is ${JSON.stringify(b)}`);
		if (l.part !== src.part) differ('part', l.part, src.part);
		if (l.order !== src.order) differ('order', l.order, src.order);
		if (!sameList(l.teaches, src.teaches)) differ('teaches', l.teaches, src.teaches);
		if (!sameList(l.requires, src.requires)) differ('requires', l.requires, src.requires);
		const cards = (x: LessonMeta) => x.cards.map((c) => c.id);
		if (!sameSet(cards(l), cards(src))) differ('card ids', cards(l), cards(src));
		const step = (x: LessonMeta) => x.practice && { id: x.practice.id, era: x.practice.era, continues: x.practice.continues ?? null };
		if (JSON.stringify(step(l)) !== JSON.stringify(step(src))) differ('practice', step(l), step(src));
		const checks = (x: LessonMeta) => x.practice?.checks.map((c) => c.id) ?? [];
		if (!sameSet(checks(l), checks(src))) differ('practice check ids', checks(l), checks(src));
		if (!l.sources.some((s) => s.lang === lang))
			problems.push(`${file}: no source in ${lang}; the edition cites its own language first (docs/content-plan/README.md, «English edition»)`);
		lessons.push(l);
	}
	if (problems.length) throw new ContentError(problems);

	const curriculum: Curriculum = {
		parts: ru.curriculum.parts.map((p) => ({ ...p, ...words.parts[p.slug] })),
		concepts: ru.curriculum.concepts.map((c) => ({ ...c, title: words.concepts[c.id] ?? c.title }))
	};
	const have = new Set(lessons.map((l) => l.id));
	const order = (a: LessonMeta, b: LessonMeta) => a.part - b.part || a.order - b.order;
	return {
		lang,
		curriculum,
		lessons: lessons.sort(order),
		missing: [...ru.lessons].sort(order).filter((l) => !have.has(l.id)).map((l) => l.id)
	};
}

const editions = new Map<Locale, Edition>();

export function loadEdition(lang: Locale): Edition {
	if (lang === 'ru') {
		const { curriculum, lessons } = loadContent();
		return { lang, curriculum, lessons, missing: [] };
	}
	let e = editions.get(lang);
	if (!e) {
		const modules = import.meta.glob<Module>('/content/en/**/*.svx', { eager: true });
		e = validateEdition(modules, curriculumEnSource, loadContent(), 'en');
		editions.set(lang, e);
	}
	return e;
}
