import { describe, it, expect } from 'vitest';
import { buildGraph, unmet, nextLessons } from '#lib/content/graph.ts';

const L = (id: string, part: number, order: number, teaches: string[], requires: string[]) =>
	({ id, part, order, teaches, requires }) as never;
const cur = { parts: [], concepts: ['a', 'b', 'c'].map((id) => ({ id, title: id, part: 0 })) } as never;

describe('graph', () => {
	it('orders the next lessons by prerequisites', () => {
		const g = buildGraph([L('x', 0, 1, ['a'], []), L('y', 0, 2, ['b'], ['a'])], cur);
		expect(g.errors).toEqual([]);
		expect(nextLessons(g, new Set())).toEqual(['x']);
		expect(nextLessons(g, new Set(['x']))).toEqual(['y']);
	});
	it('reports a concept taught twice', () =>
		expect(buildGraph([L('x', 0, 1, ['a'], []), L('y', 0, 2, ['a'], [])], cur).errors[0]).toMatch(/taught twice/));
	it('reports an unknown concept', () =>
		expect(buildGraph([L('x', 0, 1, ['zz'], [])], cur).errors[0]).toMatch(/unknown concept zz/));
	it('reports a requirement nobody teaches', () =>
		expect(buildGraph([L('x', 0, 1, ['a'], ['c'])], cur).errors[0]).toMatch(/nobody teaches c/));
	it('reports a cycle', () => {
		const g = buildGraph([L('x', 0, 1, ['a'], ['b']), L('y', 0, 2, ['b'], ['a'])], cur);
		expect(g.errors.join()).toMatch(/cycle/);
	});
	it('lists unmet requirements', () => {
		const g = buildGraph([L('x', 0, 1, ['a'], []), L('y', 0, 2, ['b'], ['a'])], cur);
		expect(unmet(g, 'y', new Set())).toEqual(['a']);
	});
	it('sorts by part, then order', () => {
		const g = buildGraph([L('late', 2, 1, ['b'], []), L('early', 0, 3, ['a'], []), L('mid', 0, 4, ['c'], [])], cur);
		expect(nextLessons(g, new Set())).toEqual(['early', 'mid', 'late']);
	});
});
