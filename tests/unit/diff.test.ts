import { it, expect } from 'vitest';
import { lineDiff } from '#lib/practice/diff.ts';

it('marks kept, removed and added lines', () => {
	expect(lineDiff('a\nb\nc', 'a\nx\nc')).toEqual([
		{ op: ' ', text: 'a' },
		{ op: '-', text: 'b' },
		{ op: '+', text: 'x' },
		{ op: ' ', text: 'c' }
	]);
});
it('identical texts have no changes', () => expect(lineDiff('a\nb', 'a\nb').every((l) => l.op === ' ')).toBe(true));
