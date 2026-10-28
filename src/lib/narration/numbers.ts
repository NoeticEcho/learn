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

function cardinalBelow1000(n: number): string[] {
	const words: string[] = [];
	if (n >= 100) words.push(HUNDREDS[Math.floor(n / 100)]);
	const r = n % 100;
	if (r >= 20) {
		words.push(TENS[Math.floor(r / 10)]);
		if (r % 10) words.push(ONES[r % 10]);
	} else if (r >= 10) words.push(TEENS[r - 10]);
	else if (r) words.push(ONES[r]);
	return words;
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

/** A cardinal below a million in words, nominative (for tests and the odd count). */
export function cardinal(n: number): string {
	if (n === 0) return 'ноль';
	const th = Math.floor(n / 1000);
	const words: string[] = [];
	if (th) {
		const t = cardinalBelow1000(th);
		const last = th % 100 >= 10 && th % 100 < 20 ? 0 : th % 10;
		if (last === 1) t[t.length - 1] = 'одна';
		if (last === 2) t[t.length - 1] = 'две';
		words.push(...t, last === 1 ? 'тысяча' : last >= 2 && last <= 4 ? 'тысячи' : 'тысяч');
	}
	return [...words, ...cardinalBelow1000(n % 1000)].join(' ');
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
