import { it, expect } from 'vitest';
import { SEQUENCE, total, eraAt } from '#lib/prologue/sequence.ts';

it('lasts 60 to 90 seconds', () => {
	expect(total()).toBeGreaterThanOrEqual(60_000);
	expect(total()).toBeLessThanOrEqual(90_000);
});
it('runs in chronological order and ends with Искин', () => {
	const years = SEQUENCE.slice(0, -1).map((s) => Number(s.era));
	expect(years).toEqual([...years].sort((a, b) => a - b));
	expect(SEQUENCE.at(-1)?.era).toBe('iskin');
	expect(SEQUENCE.map((s) => s.era)).toEqual(['1991', '1996', '2000', '2005', '2014', '2025', 'iskin']);
});
it('finds the era at a moment', () => {
	expect(eraAt(0)).toBe(0);
	expect(eraAt(SEQUENCE[0].ms)).toBe(1);
	expect(eraAt(total() + 1)).toBe(SEQUENCE.length);
});
