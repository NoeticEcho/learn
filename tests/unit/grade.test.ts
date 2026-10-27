import { it, expect } from 'vitest';
import { grade, shuffle } from '#lib/quiz/grade.ts';

const single = { type: 'single', prompt: 'p', options: ['a', 'b'], answer: 1, why: ['нет, потому что A', 'да'] } as const;

it('single right and wrong with why', () => {
	expect(grade(single as never, 1)).toEqual({ correct: true });
	expect(grade(single as never, 0)).toEqual({ correct: false, why: 'нет, потому что A' });
});
it('multiple needs the exact set', () => {
	const q = { type: 'multiple', prompt: 'p', options: ['a', 'b', 'c'], answer: [0, 2], why: ['', 'b — нет', 'c — да'] };
	expect(grade(q as never, [2, 0]).correct).toBe(true);
	expect(grade(q as never, [0]).correct).toBe(false);
	expect(grade(q as never, [0, 1, 2])).toEqual({ correct: false, why: 'b — нет' });
	expect(grade(q as never, [0])).toEqual({ correct: false, why: 'c — да' });
});
it('order compares sequences', () => {
	const q = { type: 'order', prompt: 'p', items: ['DNS', 'TCP', 'HTTP'] };
	expect(grade(q as never, ['DNS', 'TCP', 'HTTP']).correct).toBe(true);
	expect(grade(q as never, ['TCP', 'DNS', 'HTTP']).correct).toBe(false);
});
it('match ignores pair order', () => {
	const q = { type: 'match', prompt: 'p', pairs: [['A', '1'], ['B', '2']] };
	expect(grade(q as never, [['B', '2'], ['A', '1']]).correct).toBe(true);
	expect(grade(q as never, [['A', '2'], ['B', '1']]).correct).toBe(false);
});
it('junk responses are wrong, not errors', () => {
	expect(grade(single as never, 'x').correct).toBe(false);
	expect(grade({ type: 'order', prompt: 'p', items: ['a', 'b'] } as never, null).correct).toBe(false);
});
it('shuffle is deterministic per seed and never returns the answer order for 2+ items', () => {
	const items = ['a', 'b', 'c', 'd'];
	expect(shuffle(items, 'seed')).toEqual(shuffle(items, 'seed'));
	expect(shuffle(items, 'seed')).not.toEqual(items);
	expect([...shuffle(items, 'seed')].sort()).toEqual(items);
});
