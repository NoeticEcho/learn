/**
 * Years in words, for narration only. The voice reads a bare «2001» as it likes: in the pilot it
 * said «2021» once, and it dropped the second year of «1995–2001» altogether. A course about the
 * history of the web cannot get its dates wrong, so the years the lessons write (a four-digit
 * number from 1000 to 2099 next to «год», a decade, a range) are spelt out, in the case the
 * sentence needs. Other numbers stay digits: the voice reads them correctly, and their case would
 * need a parser this module does not pretend to be.
 */

export type Case = 'nom' | 'gen' | 'dat' | 'inst' | 'prep';

const ONES = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
const TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

// Ordinal stems; the ending follows from the stem's last letters (ending below).
const ORD_ONES = ['', 'перв', 'втор', 'трет', 'четвёрт', 'пят', 'шест', 'седьм', 'восьм', 'девят'];
const ORD_TEENS = ['десят', 'одиннадцат', 'двенадцат', 'тринадцат', 'четырнадцат', 'пятнадцат', 'шестнадцат', 'семнадцат', 'восемнадцат', 'девятнадцат'];
const ORD_TENS = ['', '', 'двадцат', 'тридцат', 'сороков', 'пятидесят', 'шестидесят', 'семидесят', 'восьмидесят', 'девяност'];
const ORD_HUNDREDS = ['', 'сот', 'двухсот', 'трёхсот', 'четырёхсот', 'пятисот', 'шестисот', 'семисот', 'восьмисот', 'девятисот'];
// «второй», «шестой», «седьмой», «восьмой», «сороковой» are stressed on the ending
const STRESSED = new Set(['втор', 'шест', 'седьм', 'восьм', 'сороков']);

function ending(stem: string, c: Case, plural: boolean): string {
	if (stem === 'трет')
		return plural
			? { nom: 'третьи', gen: 'третьих', dat: 'третьим', inst: 'третьими', prep: 'третьих' }[c]
			: { nom: 'третий', gen: 'третьего', dat: 'третьему', inst: 'третьим', prep: 'третьем' }[c];
	if (plural) return stem + { nom: 'ые', gen: 'ых', dat: 'ым', inst: 'ыми', prep: 'ых' }[c];
	return stem + { nom: STRESSED.has(stem) ? 'ой' : 'ый', gen: 'ого', dat: 'ому', inst: 'ым', prep: 'ом' }[c];
}

/** An ordinal from 1 to 2999 in words: «тысяча девятьсот девяносто пятом» for (1995, 'prep'). */
export function ordinal(n: number, c: Case = 'nom', plural = false): string {
	if (!Number.isInteger(n) || n < 1 || n > 2999) throw new RangeError(`ordinal: ${n}`);
	const th = Math.floor(n / 1000);
	const rest = n % 1000;
	if (rest === 0) return ending(th === 1 ? 'тысячн' : 'двухтысячн', c, plural);
	const words: string[] = [];
	if (th) words.push(th === 1 ? 'тысяча' : 'две тысячи');
	const h = Math.floor(rest / 100);
	const r = rest % 100;
	if (r === 0) return [...words, ending(ORD_HUNDREDS[h], c, plural)].join(' ');
	if (h) words.push(HUNDREDS[h]);
	let stem: string;
	if (r >= 20 && r % 10) {
		words.push(TENS[Math.floor(r / 10)]);
		stem = ORD_ONES[r % 10];
	} else if (r >= 20) stem = ORD_TENS[r / 10];
	else if (r >= 10) stem = ORD_TEENS[r - 10];
	else stem = ORD_ONES[r];
	return [...words, ending(stem, c, plural)].join(' ');
}

// The genitive, for what follows «от», «до», «около», «из»: «от нуля до двухсот пятидесяти пяти».
const GEN_ONES = ['', 'одного', 'двух', 'трёх', 'четырёх', 'пяти', 'шести', 'семи', 'восьми', 'девяти'];
const GEN_TEENS = ['десяти', 'одиннадцати', 'двенадцати', 'тринадцати', 'четырнадцати', 'пятнадцати', 'шестнадцати', 'семнадцати', 'восемнадцати', 'девятнадцати'];
const GEN_TENS = ['', '', 'двадцати', 'тридцати', 'сорока', 'пятидесяти', 'шестидесяти', 'семидесяти', 'восьмидесяти', 'девяноста'];
const GEN_HUNDREDS = ['', 'ста', 'двухсот', 'трёхсот', 'четырёхсот', 'пятисот', 'шестисот', 'семисот', 'восьмисот', 'девятисот'];

export type CardinalCase = 'nom' | 'gen';

/** A group of up to three digits. «один» and «два» are feminine in the thousands and before a feminine noun. */
function below1000(n: number, c: CardinalCase, fem: boolean): string[] {
	const gen = c === 'gen';
	const one = (d: number) => (fem && d === 1 ? (gen ? 'одной' : 'одна') : fem && d === 2 && !gen ? 'две' : (gen ? GEN_ONES : ONES)[d]);
	const words: string[] = [];
	if (n >= 100) words.push((gen ? GEN_HUNDREDS : HUNDREDS)[Math.floor(n / 100)]);
	const r = n % 100;
	if (r >= 20) {
		words.push((gen ? GEN_TENS : TENS)[Math.floor(r / 10)]);
		if (r % 10) words.push(one(r % 10));
	} else if (r >= 10) words.push((gen ? GEN_TEENS : TEENS)[r - 10]);
	else if (r) words.push(one(r));
	return words;
}

/**
 * A cardinal below a billion in words. Nominative by default; the genitive follows «от», «до»,
 * «около» (`speakNumbers`). `fem` is for the last «один» of a number counting a feminine noun
 * («до одной секунды»); the thousands are feminine whatever it says.
 */
export function cardinal(n: number, c: CardinalCase = 'nom', fem = false): string {
	const gen = c === 'gen';
	if (n === 0) return gen ? 'нуля' : 'ноль';
	const words: string[] = [];
	// the noun counted after a group: «один миллион», «два миллиона», «пять миллионов»; after «один» in the genitive, «миллиона»
	const noun = (last: number, forms: [string, string, string], genOne: string, genMany: string) =>
		gen ? (last === 1 ? genOne : genMany) : last === 1 ? forms[0] : last >= 2 && last <= 4 ? forms[1] : forms[2];
	const lastDigit = (g: number) => (g % 100 >= 10 && g % 100 < 20 ? 0 : g % 10);
	if (n >= 1_000_000) {
		const mil = Math.floor(n / 1_000_000);
		words.push(...below1000(mil % 1000, c, false), noun(lastDigit(mil), ['миллион', 'миллиона', 'миллионов'], 'миллиона', 'миллионов'));
		n %= 1_000_000;
		if (!n) return words.join(' ');
	}
	const th = Math.floor(n / 1000);
	if (th) words.push(...below1000(th, c, true), noun(lastDigit(th), ['тысяча', 'тысячи', 'тысяч'], 'тысячи', 'тысяч'));
	return [...words, ...below1000(n % 1000, c, fem)].join(' ');
}

// «одна десятая», «пять сотых»: the stem of the fraction's name, by the number of digits after the comma
const FRACTION = ['', 'десят', 'сот', 'тысячн', 'десятитысячн', 'стотысячн', 'миллионн'];

/**
 * A decimal fraction in words: «4,5» is «четыре и пять десятых», «0,05» «ноль и пять сотых», «1,01»
 * «один и одна сотая». The numerator agrees with the feminine fraction («одна десятая», «две десятых»), and
 * the leading zeros of «0,05» are kept by the denominator, not lost to the numerator. The whole is
 * said with «и», not «целых», because «и» has no case to get wrong: «в один и семь десятых раза»,
 * «от одного и четырёх десятых» need only the numbers inflected. A fraction of more than six digits is
 * read as digits.
 */
export function decimal(whole: string, frac: string, c: CardinalCase = 'nom'): string {
	const card = (n: string, cc: CardinalCase = c, fem = false) => (n.length <= 9 ? cardinal(Number(n), cc, fem) : n.split('').map((d) => cardinal(Number(d))).join(' '));
	if (frac.length >= FRACTION.length) return `${card(whole)} запятая ${frac.split('').map((d) => cardinal(Number(d))).join(' ')}`;
	const num = Number(frac);
	const one = num % 10 === 1 && num % 100 !== 11;
	const stem = FRACTION[frac.length];
	const noun = c === 'gen' ? (one ? `${stem}ой` : `${stem}ых`) : one ? `${stem}ая` : `${stem}ых`;
	return `${card(whole)} и ${cardinal(num, c, true)} ${noun}`;
}

const YEAR = '(1\\d{3}|20\\d{2})';
const DASH = '\\s*[–—-]\\s*';
// The noun after a year, and the case its ordinal takes.
const NOUN: Record<string, Case> = { год: 'nom', года: 'gen', году: 'prep', годом: 'inst', годах: 'prep', годов: 'gen', годы: 'nom', годам: 'dat', годами: 'inst' };
const DATIVE_BEFORE = /(?:^|\s)(?:к|по|благодаря|согласно)\s*$/i;

function caseFor(noun: string, before: string): Case {
	const c = NOUN[noun.toLowerCase()];
	if (noun.toLowerCase() === 'году' && DATIVE_BEFORE.test(before)) return 'dat';
	return c;
}

// «1990-е», «1990-х», «1996-м», «2000-го» : the suffix names the form.
const SUFFIX: Record<string, [Case, boolean]> = { е: ['nom', true], х: ['prep', true], м: ['prep', false], го: ['gen', false], й: ['nom', false], ми: ['prep', true] };

/**
 * Spells out the years in a sentence. A year must look like one: next to «год» in some form, with
 * a suffix («1990-е», «в 1996-м»), as a range of two years, or alone in parentheses. A number
 * that only happens to have four digits («1500 рублей», «2048 пикселей») is left as it is.
 */
export function speakYears(s: string): string {
	// a range: «в 1995–2001 годах», «1995–2001»
	s = s.replace(new RegExp(`${YEAR}${DASH}${YEAR}(\\s+(год[а-я]*))?`, 'g'), (m, a, b, tail, noun, off, all: string) => {
		const before = all.slice(0, off);
		const c: Case = noun && NOUN[noun.toLowerCase()] ? caseFor(noun, before) : /(?:^|\s)(?:в|с)\s*$/i.test(before) ? 'prep' : 'nom';
		const cs: Case = c === 'nom' && !noun ? 'nom' : c;
		return `${ordinal(+a, cs)} — ${ordinal(+b, cs)}${tail ?? ''}`;
	});
	// a year with its noun: «в 1995 году», «к 2001 году», «с 1994 года»
	s = s.replace(new RegExp(`(?<!\\d)${YEAR}\\s+(год(?:а|у|ом|ах|ов|ы|ами|ам)?)(?![а-яё])`, 'gi'), (m, y, noun, off, all: string) => `${ordinal(+y, caseFor(noun, all.slice(0, off)))} ${noun}`);
	// a year with a suffix: «1990-е», «в 1990-х», «в 1996-м»
	s = s.replace(new RegExp(`(?<!\\d)${YEAR}-(ми|го|е|х|м|й)(?![а-яё])`, 'g'), (m, y, suf) => {
		const [c, plural] = SUFFIX[suf];
		return ordinal(+y, c, plural);
	});
	// a year after a preposition, its noun left out: «(с 2004)», «до 2010», «в эпохе 2005»
	s = s.replace(new RegExp(`(?<![\\p{L}])(с|со|до|после|около|от|к|в|эпох[а-я]*)\\s+${YEAR}(?![\\d\\p{L}-])(?!\\s+[а-яё])`, 'giu'), (m, p: string, y) => {
		const c: Case = /^(к)$/i.test(p) ? 'dat' : /^в$/i.test(p) ? 'prep' : 'gen';
		return `${p} ${ordinal(+y, c)}`;
	});
	// a year alone: «Mosaic (1993)», «1991: первый сайт». Only 1900–2099, and only before
	// punctuation or the end, so «2000 рублей» stays a number.
	s = s.replace(/(?<![\d\p{L},.])(19\d{2}|20\d{2})(?=\s*[),;.!?](?![\p{L}\d])|:\s|\s*$)/gu, (m, y) => ordinal(+y));
	return s;
}

/** «90%» → «90 процентов», with the noun agreeing with the number. */
export function speakPercents(s: string): string {
	return s.replace(/(?<![\p{L}\d.,])(\d+(?:[.,]\d+)?)\s*%/gu, (m, n: string) => {
		if (/[.,]/.test(n)) return `${n} процента`;
		const v = +n % 100;
		const last = v % 10;
		const word = v >= 11 && v <= 14 ? 'процентов' : last === 1 ? 'процент' : last >= 2 && last <= 4 ? 'процента' : 'процентов';
		return `${n} ${word}`;
	});
}

// «1-й», «2-го», «в 3-м», «в 90-х»: an ordinal suffix names the case (feminine and neuter forms are left as digits)
const SMALL_SUFFIX: Record<string, [Case, boolean]> = { й: ['nom', false], го: ['gen', false], му: ['dat', false], м: ['prep', false], х: ['prep', true], ми: ['inst', true] };
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

/**
 * Dates. The pilot's voice was given «С 1 января» as «с один января» and «28.10.2026» as «двадцать
 * восемь точка десять точка две тысячи двадцать шесть»; a reader says «с первого января» and
 * «двадцать восьмого октября две тысячи двадцать шестого года». A day is read only next to the
 * name of a month, and «15.11» only after «до»: elsewhere «13.11» is an article of a code and
 * «5.5» a version.
 */
export function speakDates(s: string): string {
	return s
		.replace(/(?<![\p{L}\d.,])(\d{1,2})\.(\d{1,2})\.(\d{4})(?![\p{L}\d]|\.\d)/gu, (m, d: string, mo: string, y: string) =>
			+d >= 1 && +d <= 31 && +mo >= 1 && +mo <= 12 && +y >= 1000 && +y <= 2999 ? `${ordinal(+d, 'gen')} ${MONTHS[+mo - 1]} ${ordinal(+y, 'gen')} года` : m
		)
		.replace(/(?<=(?:^|[\s(«"])до\s)(\d{1,2})\.(\d{1,2})(?![\p{L}\d.,])/giu, (m, d: string, mo: string) =>
			+d >= 1 && +d <= 31 && +mo >= 1 && +mo <= 12 ? `${ordinal(+d, 'gen')} ${MONTHS[+mo - 1]}` : m
		)
		.replace(new RegExp(`(?<![\\p{L}\\d.,])(\\d{1,2})\\s+(${MONTHS.join('|')})(?![\\p{L}])`, 'giu'), (m, d: string, mo: string) => (+d >= 1 && +d <= 31 ? `${ordinal(+d, 'gen')} ${mo}` : m));
}

const NUM = '\\d+(?:,\\d+)?';
// What governs the genitive when a number follows: «от нуля», «около десяти процентов», «не больше пятнадцати».
const GENITIVE = 'от|до|около|из|без|для|у|свыше|более|менее|больше|меньше|после|кроме';
// A feminine noun in the genitive singular: «до одной секунды», against «до одного пикселя».
const FEMININE_GENITIVE = /^[а-яё]{4,}[ыи]$/i;

/** A number written with digits, in words: «4,5» → «четыре и пять десятых», in the genitive after «от» and its like. */
function say(n: string, gen: boolean, next: string): string {
	const c: CardinalCase = gen ? 'gen' : 'nom';
	if (n.includes(',')) {
		const [a, b] = n.split(',');
		return decimal(a, b, c);
	}
	if (n.length > 9) return n.split('').map((d) => cardinal(Number(d))).join(' ');
	const fem = gen && FEMININE_GENITIVE.test(/^\s*([а-яё]+)/i.exec(next)?.[1] ?? '');
	return cardinal(Number(n), c, fem);
}

// A dot between digits is a version («HTTP 1.1», «WCAG 2.2», «PHP 5.5»), an article («статья 13.11») or a
// criterion («1.4.3»), and is read «точка», as people read them. It is a decimal only when it says so:
// a leading zero («0.07»), three digits after the point («1.333», but not the «192.168.…» of an address), a percent after it («99.9 процента»), or a
// value after a colon («line-height: 1.6»). A decimal is read as one written with a comma.
function isDecimalDot(a: string, b: string, before: string, after: string): boolean {
	// «192.168.…» is the start of an address, not 192 and 168 thousandths
	const address = a.length > 2 || /^\.(?!\s|$)/.test(after);
	return a === '0' || (b.length >= 3 && !address) || /^\s+процент/.test(after) || /:\s*$/.test(before);
}

/**
 * Every number left after the years and percents, in words. The voice read digits unreliably
 * in the pilot («65535» as «пять тысяч пятьсот», «301 Moved Permanently» drifting into syllables
 * of no language), so nothing reaches it as digits. Cardinals are nominative, except after «от», «до»,
 * «около», «из» and the like, where a number is in the genitive («от нуля до двухсот пятидесяти пяти»):
 * that is the one case a sentence this course writes puts a number in over and over. A range, «50–160 знаков»,
 * is «от пятидесяти до ста шестидесяти знаков»: the dash alone was a pause, and «45–75» came out as one
 * number run into the next. A ratio, «4,5 к 1», ends in «к одному». Dotted numbers (addresses, versions, a criterion's
 * «1.4.3») are read part by part with «точка»; a decimal, with a comma or by the rule of `isDecimalDot`,
 * as «и … десятых».
 */
export function speakNumbers(s: string): string {
	const card = (n: string) => (n.length <= 9 ? cardinal(Number(n)) : n.split('').map((d) => cardinal(Number(d))).join(' '));
	const GENITIVE_PREPOSITION = new RegExp(`^(?:${GENITIVE})$`, 'iu');
	return s
		.replace(/(?<![\p{L}\d.,])(\d{1,3})(?:[  ](\d{3}))+(?![\p{L}\d])/gu, (m) => m.replace(/[  ]/g, ''))
		// «10k+ клиентов»
		.replace(/(?<![\p{L}\d.,])(\d{1,3})[kK](\+?)(?![\p{L}\d])/gu, (m, n: string, plus: string) => `${cardinal(Number(n) * 1000)}${plus ? ' плюс' : ''}`)
		.replace(/(?<=\d)(\s+к\s+)1(?![\d]|[.,]\d)/gu, '$1одному')
		// a range: «45–75 знаков», «около 155–160», «в шагах 3–6»
		.replace(new RegExp(`(?<![\\p{L}\\d.,])(?:(?:около|от)\\s+)?(${NUM})\\s?–\\s?(${NUM})(?![\\d]|[.,]\\d)`, 'giu'), (m, a: string, b: string, off: number, all: string) => {
			const lead = /(\p{L}+)\s+$/u.exec(all.slice(0, off))?.[1] ?? '';
			const rest = all.slice(off + m.length);
			// after a preposition («для 1–3») «от … до …» would say it twice
			if (lead && /^(?:для|на|в|во|с|со|по|за|при|к|о|об|из|у|без|между|под|над|через)$/iu.test(lead)) {
				const gen = GENITIVE_PREPOSITION.test(lead);
				return `${say(a, gen, '')} — ${say(b, gen, rest)}`;
			}
			return `от ${say(a, true, '')} до ${say(b, true, rest)}`;
		})
		// «с 60 процентов до 20»: a number between «с» and a «до» that follows within a noun or two
		.replace(new RegExp(`(?<![\\p{L}\\d])(со?)(\\s+)(${NUM})(?=(?:\\s+\\p{L}+){0,2}\\s+до\\s)(?![\\d]|[.,]\\d|-\\p{L})`, 'giu'), (m, p: string, sp: string, n: string, off: number, all: string) => `${p}${sp}${say(n, true, all.slice(off + m.length))}`)
		.replace(new RegExp(`(?<![\\p{L}\\d])(${GENITIVE})(\\s+)(${NUM})(?![\\d]|[.,]\\d|-\\p{L})`, 'giu'), (m, p: string, sp: string, n: string, off: number, all: string) => `${p}${sp}${say(n, true, all.slice(off + m.length))}`)
		.replace(/(?<![\p{L}\d.])(\d+(?:\.\d+){2,})(?![\p{L}\d])/gu, (m) => m.split('.').map(card).join(' точка '))
		.replace(/(?<![\p{L}\d.,])(\d+),(\d{1,6})(?![\p{L}\d]|[.,]\d)/gu, (m, a: string, b: string) => decimal(a, b))
		.replace(/(?<![\p{L}\d.])(\d+)\.(\d+)(?![\p{L}\d])/gu, (m, a: string, b: string, off: number, all: string) =>
			isDecimalDot(a, b, all.slice(0, off), all.slice(off + m.length)) && b.length <= 6 ? decimal(a, b) : `${card(a)} точка ${card(b)}`
		)
		.replace(/(?<![\p{L}\d])(\d{1,4})-(й|го|му|м|х|ми)(?![\p{L}])/gu, (m, n: string, suf: string) => {
			const [c, plural] = SMALL_SUFFIX[suf];
			return +n >= 1 && +n <= 2999 ? ordinal(+n, c, plural) : m;
		})
		.replace(/(?<![\p{L}\d])\d+(?![\d])/gu, (n) => card(n));
}
