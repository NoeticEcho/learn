/**
 * The concept graph (spec §3.3). Each lesson teaches concepts and requires concepts; a lesson
 * is open once every concept it requires is taught by a lesson the person has finished.
 *
 * Pure and framework-free, and it imports only types, so the map and the home page can use it
 * in the browser without pulling the schema (Zod) into the first route's bundle.
 */
import type { Curriculum } from './schema.ts';

/** The fields of a lesson the graph needs; full `LessonMeta` satisfies it. */
export type GraphLesson = { id: string; part: number; order: number; teaches: string[]; requires: string[] };

export type Graph<L extends GraphLesson = GraphLesson> = {
	lessons: Map<string, L>;
	/** concept id → the id of the lesson that teaches it */
	teaches: Map<string, string>;
	errors: string[];
};

const byPartOrder = (a: GraphLesson, b: GraphLesson) => a.part - b.part || a.order - b.order;

export function buildGraph<L extends GraphLesson>(lessons: L[], curriculum: Pick<Curriculum, 'concepts'>): Graph<L> {
	const errors: string[] = [];
	const known = new Set(curriculum.concepts.map((c) => c.id));
	const map = new Map<string, L>();
	const teaches = new Map<string, string>();

	for (const l of [...lessons].sort(byPartOrder)) {
		if (map.has(l.id)) errors.push(`lesson ${l.id} is defined twice`);
		map.set(l.id, l);
		for (const c of l.teaches) {
			if (!known.has(c)) errors.push(`${l.id}: unknown concept ${c}`);
			const prior = teaches.get(c);
			if (prior) errors.push(`concept ${c} taught twice: by ${prior} and ${l.id}`);
			else teaches.set(c, l.id);
		}
	}

	for (const l of map.values())
		for (const c of l.requires) {
			if (!known.has(c)) errors.push(`${l.id}: unknown concept ${c}`);
			else if (!teaches.has(c)) errors.push(`${l.id}: requires ${c}, but nobody teaches ${c}`);
			if (l.teaches.includes(c)) errors.push(`${l.id}: requires ${c}, which it teaches itself (a cycle)`);
		}

	// Edges run from the lesson that teaches a required concept to the lesson that requires it.
	const edges = new Map<string, string[]>();
	for (const l of map.values())
		edges.set(
			l.id,
			l.requires.map((c) => teaches.get(c)).filter((t): t is string => !!t && t !== l.id)
		);
	const WHITE = 0,
		GREY = 1,
		BLACK = 2;
	const colour = new Map<string, number>([...map.keys()].map((k) => [k, WHITE]));
	const stack: string[] = [];
	const visit = (id: string) => {
		colour.set(id, GREY);
		stack.push(id);
		for (const dep of edges.get(id) ?? []) {
			if (colour.get(dep) === GREY) {
				const loop = stack.slice(stack.indexOf(dep)).concat(dep);
				errors.push(`cycle: ${loop.join(' → ')}`);
			} else if (colour.get(dep) === WHITE) visit(dep);
		}
		stack.pop();
		colour.set(id, BLACK);
	};
	for (const id of map.keys()) if (colour.get(id) === WHITE) visit(id);

	return { lessons: map, teaches, errors };
}

/** The concepts `lessonId` requires that no finished lesson teaches yet. */
export function unmet(graph: Graph, lessonId: string, done: Set<string>): string[] {
	const l = graph.lessons.get(lessonId);
	if (!l) return [];
	return l.requires.filter((c) => {
		const by = graph.teaches.get(c);
		return !by || !done.has(by);
	});
}

/** Lessons not done whose requirements are all met, by part, then order. */
export function nextLessons(graph: Graph, done: Set<string>): string[] {
	return [...graph.lessons.values()]
		.filter((l) => !done.has(l.id) && unmet(graph, l.id, done).length === 0)
		.sort(byPartOrder)
		.map((l) => l.id);
}

export type LessonStatus = 'done' | 'open' | 'locked';

export function status(graph: Graph, lessonId: string, done: Set<string>): LessonStatus {
	if (done.has(lessonId)) return 'done';
	return unmet(graph, lessonId, done).length === 0 ? 'open' : 'locked';
}
