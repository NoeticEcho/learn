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
import { Curriculum, LessonMeta } from './schema.ts';
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

export function loadContent(): Content {
	if (!cached) {
		const modules = import.meta.glob<Module>('/content/ru/**/*.svx', { eager: true });
		cached = validate(modules, curriculumSource);
	}
	return cached;
}
