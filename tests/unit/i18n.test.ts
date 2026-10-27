import { describe, it, expect } from 'vitest';
import { t, plural } from '#lib/i18n';

describe('i18n', () => {
	it('reads a key', () => expect(t('app.title')).toBe('Сеть насквозь'));
	it('fills vars', () => expect(t('game.xp', { n: 5 })).toBe('5 XP'));
	it('throws on a missing key in dev', () => expect(() => t('nope')).toThrow(/nope/));
	it('plural ru', () => {
		const f: [string, string, string] = ['урок', 'урока', 'уроков'];
		expect([1, 2, 5, 11, 21, 22, 25].map((n) => plural(n, f))).toEqual([
			'урок', 'урока', 'уроков', 'уроков', 'урок', 'урока', 'уроков'
		]);
	});
});
