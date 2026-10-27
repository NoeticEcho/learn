import { describe, it, expect } from 'vitest';
import { t, plural } from '#lib/i18n/index.ts';

describe('i18n', () => {
	it('reads a key', () => expect(t('app.title')).toBe('Сквозь время'));
	it('fills vars', () => expect(t('game.xp', { n: 5 })).toBe('5 XP'));
	it('throws on a missing key in dev', () => expect(() => t('nope')).toThrow(/nope/));
	it('plural ru', () => {
		const f: [string, string, string] = ['урок', 'урока', 'уроков'];
		expect([1, 2, 5, 11, 21, 22, 25].map((n) => plural(n, f))).toEqual([
			'урок', 'урока', 'уроков', 'уроков', 'урок', 'урока', 'уроков'
		]);
	});
});

describe('midSentence', () => {
	it('lowers a Russian common noun and keeps acronyms, Latin names and proper names', async () => {
		const { midSentence } = await import('#lib/i18n/index.ts');
		expect(midSentence('Структура HTML-документа')).toBe('структура HTML-документа');
		expect(midSentence('ИИ-конструкторы')).toBe('ИИ-конструкторы');
		expect(midSentence('HTML')).toBe('HTML');
		expect(midSentence('Flexbox')).toBe('Flexbox');
		expect(midSentence('Яндекс Метрика')).toBe('Яндекс Метрика');
	});
});
