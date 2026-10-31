// Narration (docs/narration.md): the script a lesson becomes, the hash that decides what is
// rendered again, the manifest that says what exists, and the WER that checks what was heard.
import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { cardinal, decimal, ordinal, speakDates, speakNumbers, speakPercents, speakYears } from '#lib/narration/numbers.ts';
import { narrate, plain, sentences, speak, speakHex, stressMark, bodyOf, type Lexicon } from '#lib/narration/script.ts';
import { heardAs, match, script, sectionHash, manifest, type Manifest } from '#lib/narration/narration.server.ts';
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
		expect(cardinal(4_294_967_296 % 1e9)).toBe('двести девяносто четыре миллиона девятьсот шестьдесят семь тысяч двести девяносто шесть');
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
	test('every other number in words', () => {
		expect(speakNumbers('порт 65535')).toBe('порт шестьдесят пять тысяч пятьсот тридцать пять');
		expect(speakNumbers('301 Moved')).toBe('триста один Moved');
		expect(speakNumbers('адрес 8.8.8.8')).toBe('адрес восемь точка восемь точка восемь точка восемь');
		expect(speakNumbers('около 4,3 миллиарда')).toBe('около четырёх и трёх десятых миллиарда');
		expect(speakNumbers('1 000 000 строк')).toBe('один миллион строк');
		expect(speakNumbers('в 3-м уроке, 2-го числа')).toBe('в третьем уроке, второго числа');
		expect(speakNumbers('HTTP 1.1')).toBe('HTTP один точка один');
	});
	test('percents agree with their number', () => {
		expect(speakPercents('90%')).toBe('90 процентов');
		expect(speakPercents('21%')).toBe('21 процент');
		expect(speakPercents('3%')).toBe('3 процента');
		expect(speakPercents('12%')).toBe('12 процентов');
		expect(speakPercents('%D1%83')).toBe('%D1%83');
	});
});

describe('numbers as a person says them', () => {
	test('the genitive, which «от», «до», «около» and «из» ask for', () => {
		expect(cardinal(0, 'gen')).toBe('нуля');
		expect(cardinal(255, 'gen')).toBe('двухсот пятидесяти пяти');
		expect(cardinal(1, 'gen')).toBe('одного');
		expect(cardinal(1, 'gen', true)).toBe('одной');
		expect(cardinal(21_000, 'gen')).toBe('двадцати одной тысячи');
		expect(cardinal(12_000, 'gen')).toBe('двенадцати тысяч');
		expect(cardinal(2_000_000, 'gen')).toBe('двух миллионов');
		// the nominative is what it was
		expect(cardinal(1001)).toBe('одна тысяча один');
		expect(cardinal(0)).toBe('ноль');
	});
	test('a decimal fraction agrees: «одна десятая», «две десятых», and keeps its leading zeros', () => {
		expect(decimal('4', '5')).toBe('четыре и пять десятых');
		expect(decimal('0', '05')).toBe('ноль и пять сотых');
		expect(decimal('1', '1')).toBe('один и одна десятая');
		expect(decimal('1', '2')).toBe('один и две десятых');
		expect(decimal('1', '21')).toBe('один и двадцать одна сотая');
		expect(decimal('1', '333')).toBe('один и триста тридцать три тысячных');
		expect(decimal('0', '0001')).toBe('ноль и одна десятитысячная');
		expect(decimal('1', '4', 'gen')).toBe('одного и четырёх десятых');
		expect(decimal('0', '5', 'gen')).toBe('нуля и пяти десятых');
		// no name for the denominator: the digits
		expect(decimal('1', '0000001')).toBe('один запятая ноль ноль ноль ноль ноль ноль один');
	});
	test('a decimal comma is «и … десятых», not «точка»', () => {
		expect(speakNumbers('p = 0,05')).toBe('p = ноль и пять сотых');
		expect(speakNumbers('99,9 процента')).toBe('девяносто девять и девять десятых процента');
		expect(speakNumbers('коэффициент 1,25')).toBe('коэффициент один и двадцать пять сотых');
		expect(speakNumbers('Impact: 0,25, 0,5, 1')).toBe('Impact: ноль и двадцать пять сотых, ноль и пять десятых, один');
		expect(speakNumbers('1,2,3')).toBe('один,два,три'); // a list is not a decimal
	});
	test('a number after «от», «до», «около», «из», «больше» is in the genitive', () => {
		expect(speakNumbers('от 0 до 255')).toBe('от нуля до двухсот пятидесяти пяти');
		expect(speakNumbers('из 12 колонок')).toBe('из двенадцати колонок');
		expect(speakNumbers('не больше 15')).toBe('не больше пятнадцати');
		expect(speakNumbers('у 96 процентов')).toBe('у девяноста шести процентов');
		expect(speakNumbers('около 18,66 пикселя')).toBe('около восемнадцати и шестидесяти шести сотых пикселя');
		expect(speakNumbers('до 1 секунды')).toBe('до одной секунды');
		expect(speakNumbers('до 1 пикселя')).toBe('до одного пикселя');
		expect(speakNumbers('от 24 пикселей')).toBe('от двадцати четырёх пикселей');
		expect(speakNumbers('из 1000')).toBe('из одной тысячи');
		expect(speakNumbers('с 60 процентов до 20 процентов')).toBe('с шестидесяти процентов до двадцати процентов');
		expect(speakNumbers('«10k+ клиентов»')).toBe('«десять тысяч плюс клиентов»');
		// …and nowhere else
		expect(speakNumbers('в 3 раза, на 12 колонок')).toBe('в три раза, на двенадцать колонок');
		expect(speakNumbers('в 3-м уроке')).toBe('в третьем уроке');
	});
	test('a range is «от … до …»', () => {
		expect(speakNumbers('Ширина строки 45–75 знаков')).toBe('Ширина строки от сорока пяти до семидесяти пяти знаков');
		expect(speakNumbers('в пределах 45–75 знаков')).toBe('в пределах от сорока пяти до семидесяти пяти знаков');
		expect(speakNumbers('видно около 155–160 знаков')).toBe('видно от ста пятидесяти пяти до ста шестидесяти знаков');
		expect(speakNumbers('Интерлиньяж 1,4–1,7 от размера')).toBe('Интерлиньяж от одного и четырёх десятых до одного и семи десятых от размера');
		expect(speakNumbers('в шагах 3–6')).toBe('в шагах от трёх до шести');
		// after a preposition «от … до …» would say it twice
		expect(speakNumbers('для 1–3 материал')).toBe('для одного — трёх материал');
		// a year range is the years' (speakYears), not this
		expect(speakYears('в 1995–2001 годах')).toBe('в тысяча девятьсот девяносто пятом — две тысячи первом годах');
	});
	test('a ratio ends in «к одному»', () => {
		expect(speakNumbers('4,5 к 1 для текста')).toBe('четыре и пять десятых к одному для текста');
		expect(speakNumbers('7 к 1 и 3 к 1')).toBe('семь к одному и три к одному');
		expect(speakNumbers('от 1 к 1 до 21 к 1')).toBe('от одного к одному до двадцати одного к одному');
		expect(speakNumbers('к 10 годам')).toBe('к десять годам'); // not a ratio
	});
	test('a version, an article and a criterion are read with «точка»; a decimal is not', () => {
		expect(speak('HTTP/1.1', lex)).toBe('эйч-ти-ти-пи один точка один');
		expect(speak('GPT-4.5', lex)).toBe('джи-пи-ти четыре точка пять');
		expect(speak('PHP 5.5 и WordPress 5.9', lex)).toBe('пи-эйч-пи пять точка пять и вордпресс пять точка девять');
		expect(speakNumbers('статья 18.1 и статья 13.11')).toBe('статья восемнадцать точка один и статья тринадцать точка одиннадцать');
		expect(speakNumbers('критерий 1.4.3')).toBe('критерий один точка четыре точка три');
		expect(speakNumbers('адрес 192.168.…')).toBe('адрес сто девяносто два точка сто шестьдесят восемь.…');
		expect(speakNumbers('3.14 и 42')).toBe('три точка четырнадцать и сорок два');
		// a leading zero, three digits after the point, a percent, a value after a colon
		expect(speakNumbers('0.07')).toBe('ноль и семь сотых');
		expect(speakNumbers('--ratio 1.333')).toBe('--ratio один и триста тридцать три тысячных');
		expect(speakNumbers('99.9 процента')).toBe('девяносто девять и девять десятых процента');
		expect(speakNumbers('line-height: 1.6;')).toBe('line-height: один и шесть десятых;');
	});
	test('a space before three digits after a decimal point does not make a thousand', () => {
		// «oklch(45% 0.07 200)» was «ноль точка семь тысяч двести»
		expect(speakNumbers('0.07 200')).toBe('ноль и семь сотых двести');
		expect(speakNumbers('7 600 человек')).toBe('семь тысяч шестьсот человек');
	});
	test('a date has its day in the genitive', () => {
		expect(speakDates('С 1 января')).toBe('С первого января');
		expect(speakNumbers(speakDates('27 октября'))).toBe('двадцать седьмого октября');
		expect(speakNumbers(speakDates('Закон от 24.06.2025 №'))).toBe('Закон от двадцать четвёртого июня две тысячи двадцать пятого года №');
		expect(speakNumbers(speakDates('срок («до 15.11»)'))).toBe('срок («до пятнадцатого ноября»)');
		// 13.11 is an article and 5.5 a version, whatever they look like
		expect(speakDates('статья 13.11, версия 5.5, к 2.2')).toBe('статья 13.11, версия 5.5, к 2.2');
		expect(speakDates('в 32 января')).toBe('в 32 января');
		expect(speak('С 1 января 1983 года сеть', lex)).toBe('С первого января тысяча девятьсот восемьдесят третьего года сеть');
	});
	test('a hex colour is read character by character', () => {
		expect(speakHex('цвет #0b5cad', lex.letters)).toBe('цвет решётка ноль би пять си эй ди');
		expect(speakHex('#fff и #767676', lex.letters)).toBe('решётка эф эф эф и решётка семь шесть семь шесть семь шесть');
		expect(speakHex('якорь #cafe и #contacts', lex.letters)).toBe('якорь #cafe и #contacts');
		expect(speak('(#0b5cad)', lex)).toBe('(решётка ноль би пять си эй ди)');
	});
	test('a version’s «v» and a list’s «A01»', () => {
		expect(speak('лицензия v3.0, пути v1/items', lex)).toBe('лицензия ви три точка ноль, пути ви один items');
		expect(speak('A01 Нарушение, A10 и F12', lex)).toBe('эй ноль один Нарушение, A10 и эф двенадцать');
	});
});

describe('speaking', () => {
	test("the lesson's map wins over the course's, and an unmapped acronym is spelt", () => {
		expect(speak('Netscape и DNS', lex, { DNS: 'ди-эн-эс' })).toBe('нетскейп и ди-эн-эс');
		expect(speak('Протокол HTTPS', lex)).toBe('Протокол эйч-ти-ти-пи-эс');
		expect(speak('Версия HTTP/2', lex)).toBe('Версия эйч-ти-ти-пи два');
		expect(speak('Формат JSON', lex)).toBe('Формат джейсон');
	});
	test('a domain is read with «точка»', () => {
		expect(speak('Имя example.com удобно', lex)).toBe('Имя экзампл точка ком удобно');
		expect(speak('Зона .ru создана', lex)).toBe('Зона точка ру создана');
	});
	test('an address is read aloud as a person would', () => {
		expect(speak('пишет на name@example.ru', lex)).toBe('пишет на name собака экзампл точка ру');
		expect(plain('адрес `/page?id=7384&x=1` длинный')).toBe('адрес page вопрос id равно 7384 и x равно 1 длинный');
		expect(plain('атрибут `rel="noopener"`')).toBe('атрибут rel равно noopener');
	});
	test('units after a number', () => {
		expect(speak('отступ 16px', lex)).toBe('отступ шестнадцать пикселей');
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
		for (const x of s) for (const t of x.sentences) expect(t[0], t).toBe(t[0].toUpperCase());
	});
	test('code becomes one phrase; a component is not read; a self-check is read with its answer', () => {
		const said = s[1].sentences.join(' ');
		expect(said).toContain('Пример кода.');
		expect(said).not.toContain('код не читается');
		expect(said).not.toContain('Thing');
		expect(said).toContain('Проверьте себя: зачем это всё?');
		expect(said).toContain('Ответ: Затем, что так устроен веб');
		expect(said).toContain('Деловой: что чувствуется: собранность, доверие.');
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
	test('a term counts as heard however Whisper spelt it', () => {
		const say = { say: { 'Content-Type': 'контент-тайп' } };
		expect(words(heardAs('заголовок content type и certbot', say, 'ru'))).toEqual(words('заголовок контент-тайп и сертбот'));
		expect(words(heardAs('GitHub и DNS', {}, 'ru'))).toEqual(words('гитхаб и ди-эн-эс'));
	});
	test('words are compared without case, ё, hyphens or punctuation', () => {
		expect(words('Ди-эн-эс, ёлка!')).toEqual(['диэнэс', 'елка']);
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
	expect(speak('Закон 152-ФЗ.', lex, { ФЗ: 'эф-зэ' })).toBe('Закон сто пятьдесят два эф-зэ.');
	expect(speak('В 1990-х годах тег был главным.', lex)).toBe('В тысяча девятьсот девяностых годах тэг был главным.');
});
