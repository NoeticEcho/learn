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

describe('the English edition', async () => {
	const ru = (await import('#lib/i18n/ru.json')).default as Record<string, string>;
	const en = (await import('#lib/i18n/en.json')).default as Record<string, string>;
	const { registerCatalogue, t: tr, pl: plural2, midSentence, pick, getLocale, setLocale } = await import('#lib/i18n/index.ts');
	registerCatalogue('en', en);
	const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

	it('has exactly the keys Russian has (index.ts KeysMatch checks it at compile time too)', () => {
		expect(Object.keys(en).sort()).toEqual(Object.keys(ru).sort());
	});
	it('fills the same placeholders in every string, and leaves none empty', () => {
		for (const k of Object.keys(ru)) {
			expect(vars(en[k]), k).toEqual(vars(ru[k]));
			expect(en[k].trim(), k).not.toBe('');
		}
	});
	it('has no Cyrillic except where it names the Russian edition', () => {
		const allowed = new Set(['lang.switch', 'settings.language.ru']);
		for (const [k, v] of Object.entries(en)) if (!allowed.has(k)) expect(v, k).not.toMatch(/[А-Яа-яЁё]/);
	});
	it('typographic apostrophes and quotes, as the English house style asks (code keeps its own)', () => {
		for (const [k, v] of Object.entries(en)) expect(v.replace(/lang="\{lang\}"/, ''), k).not.toMatch(/['"]/);
	});
	it('plural forms: three in Russian, two in English', () => {
		for (const k of Object.keys(ru).filter((k) => k.endsWith('.forms'))) {
			expect(ru[k].split('|'), k).toHaveLength(3);
			expect(en[k].split('|'), k).toHaveLength(2);
		}
		expect([1, 2, 21].map((n) => plural2(n, 'day.forms', 'en'))).toEqual(['day', 'days', 'days']);
		expect([1, 2, 21].map((n) => plural2(n, 'day.forms', 'ru'))).toEqual(['день', 'дня', 'день']);
	});
	it('reads the locale it is given, or the current one', () => {
		expect(tr('app.title', {}, 'en')).toBe('Through Time');
		const was = getLocale();
		setLocale('en');
		try {
			expect(tr('nav.map')).toBe('Map');
			expect(pick({ ru: 'а', en: 'b' })).toBe('b');
		} finally {
			setLocale(was);
		}
		expect(pick({ ru: 'а' }, 'en')).toBe('а');
	});
	it('a title mid-sentence in English lowers a common word and keeps a name', () => {
		expect(midSentence('The concept map and the order of lessons', 'en')).toBe('the concept map and the order of lessons');
		expect(midSentence('HTML and CSS', 'en')).toBe('HTML and CSS');
		expect(midSentence('WordPress: themes, plugins', 'en')).toBe('WordPress: themes, plugins');
		expect(midSentence('Google and Yandex: what they share', 'en')).toBe('Google and Yandex: what they share');
		expect(midSentence('Echo, the guide', 'en')).toBe('Echo, the guide');
	});
});
