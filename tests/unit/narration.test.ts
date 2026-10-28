// Narration (docs/narration.md): the script a lesson becomes, the hash that decides what is
// rendered again, the manifest that says what exists, and the WER that checks what was heard.
import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { cardinal, ordinal, speakPercents, speakYears } from '#lib/narration/numbers.ts';
import { narrate, sentences, speak, stressMark, bodyOf, type Lexicon } from '#lib/narration/script.ts';
import { match, script, sectionHash, manifest, type Manifest } from '#lib/narration/narration.server.ts';
import { align, wer, words } from '#lib/narration/wer.ts';
import { loadContent } from '#lib/content/load.ts';

const lex = parse(readFileSync('content/narration/ru.yaml', 'utf8')) as Lexicon;

describe('years in words', () => {
	test('ordinals in their case', () => {
		expect(ordinal(1995, 'prep')).toBe('тысяча девятьсот девяносто пятом');
		expect(ordinal(2001, 'dat')).toBe('две тысячи первому');
		expect(ordinal(2000, 'gen')).toBe('двухтысячного');
		expect(ordinal(1900)).toBe('тысяча девятисотый');
		expect(ordinal(1990, 'prep', true)).toBe('тысяча девятьсот девяностых');
		expect(ordinal(2003, 'inst')).toBe('две тысячи третьим');
		expect(ordinal(2040)).toBe('две тысячи сороковой');
		expect(ordinal(2016)).toBe('две тысячи шестнадцатый');
		expect(cardinal(2048)).toBe('две тысячи сорок восемь');
	});
	test('a year next to «год» takes the case the sentence gives it', () => {
		expect(speakYears('В 1995 году')).toBe('В тысяча девятьсот девяносто пятом году');
		expect(speakYears('к 2001 году')).toBe('к две тысячи первому году');
		expect(speakYears('с 1994 года')).toBe('с тысяча девятьсот девяносто четвёртого года');
		expect(speakYears('Что было не так с 2005 годом')).toBe('Что было не так с две тысячи пятым годом');
		expect(speakYears('в 1995–2001 годах')).toBe('в тысяча девятьсот девяносто пятом — две тысячи первом годах');
		expect(speakYears('в 1990-х')).toBe('в тысяча девятьсот девяностых');
		expect(speakYears('Веб 2.0 (с 2004)')).toBe('Веб 2.0 (с две тысячи четвёртого)');
		expect(speakYears('Mosaic (1993).')).toBe('Mosaic (тысяча девятьсот девяносто третий).');
	});
	test('a number that is not a year stays a number', () => {
		expect(speakYears('цена 2000 рублей')).toBe('цена 2000 рублей');
		expect(speakYears('например 2001:db8::1')).toBe('например 2001:db8::1');
		expect(speakYears('1500 пикселей')).toBe('1500 пикселей');
	});
	test('percents agree with their number', () => {
		expect(speakPercents('90%')).toBe('90 процентов');
		expect(speakPercents('21%')).toBe('21 процент');
		expect(speakPercents('3%')).toBe('3 процента');
		expect(speakPercents('12%')).toBe('12 процентов');
		expect(speakPercents('%D1%83')).toBe('%D1%83');
	});
});

describe('speaking', () => {
	test("the lesson's map wins over the course's, and an unmapped acronym is spelt", () => {
		expect(speak('Netscape и DNS', lex, { DNS: 'ди-эн-эс' })).toBe('нетскейп и ди-эн-эс');
		expect(speak('Протокол HTTPS', lex)).toBe('Протокол эйч-ти-ти-пи-эс');
		expect(speak('Версия HTTP/2', lex)).toBe('Версия эйч-ти-ти-пи 2');
		expect(speak('Формат JSON', lex)).toBe('Формат джейсон');
	});
	test('a domain is read with «точка»', () => {
		expect(speak('Имя example.com удобно', lex)).toBe('Имя экзампл точка ком удобно');
		expect(speak('Зона .ru создана', lex)).toBe('Зона точка ру создана');
	});
	test('units after a number', () => {
		expect(speak('отступ 16px', lex)).toBe('отступ 16 пикселей');
	});
	test('a stress mark becomes a capital vowel, which the engine reads without a glide', () => {
		expect(stressMark('за́мок')).toBe('зАмок');
		const withStress = { ...lex, stress: ['замо́к'] };
		expect(speak('Старый замок.', withStress)).toBe('Старый замОк.');
		expect(speak('Замок открыт.', withStress)).toBe('ЗамОк открыт.');
	});
	test('sentences: short ones are joined, long ones cut', () => {
		expect(sentences('Да. Это так. А вот это уже длинное предложение, которое стоит отдельно от прочих.')).toEqual([
			'Да. Это так. А вот это уже длинное предложение, которое стоит отдельно от прочих.'
		]);
		const long = `${'слово '.repeat(40)}; ${'другое '.repeat(30)}.`;
		expect(sentences(long).length).toBeGreaterThan(1);
		for (const s of sentences(long)) expect(s.length).toBeLessThanOrEqual(320);
	});
});

const SOURCE = `<script module>
	export const metadata = { id: 'x' };
</script>

<script>
	import Thing from '../../diagrams/Thing.svelte';
</script>

## Зачем это знать

Первый абзац урока про **DNS** и [ссылку](https://example.com/), достаточно длинный для отдельного предложения.

- Пункт списка, тоже достаточно длинный, чтобы стоять отдельно;
- Второй пункт списка с тегом \`<h1>\` внутри, и это тоже длинная строка.

\`\`\`html
<p>код не читается</p>
\`\`\`

<Thing
	prop="1"
/>

<details>
<summary>Проверьте себя: зачем это всё?</summary>

Затем, что так устроен веб, и ответ тоже читается вслух.

</details>

| Тон | Что чувствуется |
|---|---|
| деловой | собранность, доверие |

## Практика

Задание практики не читается: оно на странице, рядом с редактором.

## Что было не так раньше

Последний раздел урока, который читается, как и все остальные разделы.
`;

describe('the script', () => {
	const lesson = { title: 'Урок', summary: 'Зачем этот урок нужен человеку, в одном предложении.', definition: 'Урок — это пример для теста, с определением.' };
	const s = narrate(SOURCE, lesson, lex);
	test('an intro, then every section but the practice', () => {
		expect(s.map((x) => x.key)).toEqual(['intro', '1', '3']);
		expect(s.map((x) => x.heading)).toEqual(['Урок', 'Зачем это знать', 'Что было не так раньше']);
		expect(s[0].sentences[0]).toBe('Урок.');
	});
	test('code becomes one phrase; a component is not read; a self-check is read with its answer', () => {
		const said = s[1].sentences.join(' ');
		expect(said).toContain('Пример кода.');
		expect(said).not.toContain('код не читается');
		expect(said).not.toContain('Thing');
		expect(said).toContain('Проверьте себя: зачем это всё?');
		expect(said).toContain('Ответ: Затем, что так устроен веб');
		expect(said).toContain('деловой: что чувствуется: собранность, доверие.');
		expect(said).toContain('ди-эн-эс');
		expect(said).toContain('ссылку,');
		expect(said).toContain('тэгом аш один внутри');
		expect(said).not.toContain('Задание практики');
	});
	test('the body starts after the scripts', () => {
		expect(bodyOf(SOURCE).trimStart().startsWith('## Зачем')).toBe(true);
	});
	test('deterministic: the same text gives the same hash; a changed word changes only its section', () => {
		const again = narrate(SOURCE, lesson, lex);
		expect(again.map((x) => sectionHash(x.sentences))).toEqual(s.map((x) => sectionHash(x.sentences)));
		const edited = narrate(SOURCE.replace('Последний раздел', 'Заключительный раздел'), lesson, lex);
		const before = s.map((x) => sectionHash(x.sentences));
		const after = edited.map((x) => sectionHash(x.sentences));
		expect(after[0]).toBe(before[0]);
		expect(after[1]).toBe(before[1]);
		expect(after[2]).not.toBe(before[2]);
	});
});

describe('the manifest', () => {
	const sections = narrate(SOURCE, { title: 'Урок', summary: 'Зачем.', definition: 'Определение.' }, lex).map((x) => ({ ...x, hash: sectionHash(x.sentences) }));
	const m: Manifest = {
		version: 1,
		voice: {},
		base: '/learn-audio/',
		lessons: { x: { sections: sections.map((x) => ({ key: x.key, hash: x.hash, file: `ru/x/${x.key}-${x.hash}.opus`, duration: 10.4 })) } }
	};
	test('a lesson is offered when every section has audio of its current text', () => {
		const n = match('x', sections, m)!;
		expect(n.sections).toHaveLength(sections.length);
		expect(n.duration).toBe(Math.round(10.4 * sections.length));
		expect(n.sections[0].file).toBe(`ru/x/intro-${sections[0].hash}.opus`);
	});
	test('and not when one section changed since', () => {
		const changed = [...sections.slice(0, -1), { ...sections.at(-1)!, hash: 'f'.repeat(16) }];
		expect(match('x', changed, m)).toBeNull();
		expect(match('y', sections, m)).toBeNull();
	});
	test('the committed manifest names lessons that exist, with files named by their hash', () => {
		const real = manifest('ru')!;
		const ids = new Set(loadContent().lessons.map((l) => l.id));
		for (const [id, entry] of Object.entries(real.lessons)) {
			expect(ids.has(id), id).toBe(true);
			for (const s of entry.sections) {
				expect(s.file).toBe(`ru/${id}/${s.key}-${s.hash}.opus`);
				expect(s.duration).toBeGreaterThan(0);
			}
		}
	});
	test('every lesson has a script, and no section of it is empty', () => {
		for (const l of loadContent().lessons) {
			const sc = script(l, 'ru')!;
			expect(sc[0].key, l.id).toBe('intro');
			for (const s of sc) for (const t of s.sentences) expect(t.trim().length, `${l.id}#${s.key}`).toBeGreaterThan(0);
		}
	});
});

describe('the listening test', () => {
	test('words are compared without case, ё, hyphens or punctuation', () => {
		expect(words('Ди-эн-эс, ёлка!')).toEqual(['ди', 'эн', 'эс', 'елка']);
		expect(words('8 эпох')).toEqual(['восемь', 'эпох']);
		expect(wer('один два три четыре', 'один два три четыре')).toBe(0);
		expect(wer('один два три четыре', 'один три четыре')).toBe(0.25);
		expect(align(['а', 'б'], ['а', 'в']).ops.map((o) => o.op)).toEqual(['ok', 'sub']);
	});
});

// The narration code reads the lesson files directly; keep it honest about which there are.
test('every Russian lesson file is a lesson', () => {
	const files = readdirSync('content/ru', { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.svx'));
	expect(files.length).toBe(loadContent().lessons.length);
});

test('a number fused to letters by a hyphen is said with a pause, and a year keeps its suffix', () => {
	expect(speak('Закон 152-ФЗ.', lex, { ФЗ: 'эф-зэ' })).toBe('Закон 152 эф-зэ.');
	expect(speak('В 1990-х годах тег был главным.', lex)).toBe('В тысяча девятьсот девяностых годах тэг был главным.');
});
