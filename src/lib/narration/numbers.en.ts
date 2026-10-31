/**
 * Numbers in words for the English narration, the counterpart of numbers.ts. English is simpler where
 * Russian is hard (no cases: «from nought to two hundred fifty-five» has one form) and has its own
 * traps: a year is read in pairs («nineteen ninety-five», not «one thousand nine hundred ninety-five»),
 * a decimal is read digit by digit after the point («zero point zero seven»), and a day of the month is
 * an ordinal («October twenty-seventh»).
 *
 * Like numbers.ts it spells out what the voice read unreliably in the pilot, and it leaves alone what it
 * cannot tell: «1500 pixels» is a number, «in 1995» a year.
 */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORD_ONES = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const ORD_TENS = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function below100(n: number): string {
	if (n < 20) return ONES[n];
	return n % 10 ? `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}` : TENS[n / 10];
}

function below1000(n: number): string {
	const h = Math.floor(n / 100);
	const r = n % 100;
	return [h ? `${ONES[h]} hundred` : '', r ? below100(r) : ''].filter(Boolean).join(' ');
}

/** A cardinal below a trillion in words: «two thousand forty-eight». */
export function cardinalEn(n: number): string {
	if (n === 0) return 'zero';
	const groups: [number, string][] = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
	const words: string[] = [];
	for (const [size, name] of groups) {
		const g = Math.floor(n / size) % 1000;
		if (g) words.push(below1000(g), name);
	}
	if (n % 1000) words.push(below1000(n % 1000));
	return words.join(' ');
}

/** An ordinal below a thousand: «twenty-seventh». */
export function ordinalEn(n: number): string {
	if (n < 20) return ORD_ONES[n];
	if (n < 100) return n % 10 ? `${TENS[Math.floor(n / 10)]}-${ORD_ONES[n % 10]}` : ORD_TENS[n / 10];
	const h = Math.floor(n / 100);
	const r = n % 100;
	return r ? `${ONES[h]} hundred ${ordinalEn(r)}` : `${ONES[h]} hundredth`;
}

/** A year in the pairs it is spoken in: 1995 «nineteen ninety-five», 2001 «two thousand one», 2010 «twenty ten». */
export function yearEn(y: number): string {
	if (y >= 2000 && y < 2010) return y === 2000 ? 'two thousand' : `two thousand ${ONES[y - 2000]}`;
	const hi = Math.floor(y / 100);
	const lo = y % 100;
	if (lo === 0) return `${below100(hi)} hundred`;
	return `${below100(hi)} ${lo < 10 ? `oh ${ONES[lo]}` : below100(lo)}`;
}

const YEAR = '(1\\d{3}|20\\d{2})';
// a year needs a reason to be one: these words, a decade's «s», a range, or parentheses
const BEFORE_YEAR = '(?:in|since|by|from|until|till|during|before|after|around|circa|early|late|mid|of|to|and|between|year|with)';

/** Years: «in 1995» → «in nineteen ninety-five», «1990s» → «nineteen nineties», «(1993)», «1995–2001». */
export function speakYearsEn(s: string): string {
	const decade = (y: number) => {
		const w = yearEn(y);
		return w.endsWith('y') ? `${w.slice(0, -1)}ies` : `${w}s`;
	};
	return s
		.replace(new RegExp(`(?<![\\d.,$£€])${YEAR}\\s?[–—-]\\s?${YEAR}(?![\\d])`, 'g'), (m, a, b) => `${yearEn(+a)} to ${yearEn(+b)}`)
		.replace(new RegExp(`(?<![\\d.,$£€])${YEAR}['’]?s(?![\\p{L}\\d])`, 'gu'), (m, y) => decade(+y))
		.replace(new RegExp(`(?<![\\p{L}\\d.,$£€])(${BEFORE_YEAR})\\s+${YEAR}(?![\\d]|[.,]\\d|\\s+(?:px|pixels?|words?|characters?|bytes?|ms|users?|people|requests?|KB|MB|GB))`, 'giu'), (m, p, y) => `${p} ${yearEn(+y)}`)
		.replace(new RegExp(`(?<![\\d.,$£€])\\(${YEAR}\\)`, 'g'), (m, y) => `(${yearEn(+y)})`)
		.replace(new RegExp(`(?<![\\p{L}\\d.,$£€])${YEAR}(?=\\s*[:;.!?]?(?:\\s|$))(?!\\s+(?:px|pixels?|words?|characters?|bytes?|ms|users?|people|requests?))`, 'gu'), (m, y, off: number, all: string) =>
			// a lone year only at the start of a sentence or before a colon: «1991: the first site»
			off === 0 || /[.!?]\s+$/.test(all.slice(0, off)) || all[off + m.length] === ':' ? yearEn(+y) : m
		);
}

/** Dates: «October 27, 2026», «27 October 2026», «2026-10-27». The day is an ordinal. */
export function speakDatesEn(s: string): string {
	const month = MONTHS.join('|');
	const y = (v?: string) => (v ? `, ${yearEn(+v)}` : '');
	return s
		.replace(new RegExp(`(?<![\\d.,])(\\d{4})-(\\d{2})-(\\d{2})(?![\\d])`, 'g'), (m, yy, mm, dd) => (+mm >= 1 && +mm <= 12 && +dd >= 1 && +dd <= 31 ? `${MONTHS[+mm - 1]} ${ordinalEn(+dd)}, ${yearEn(+yy)}` : m))
		.replace(new RegExp(`\\b(${month})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:])(?:,?\\s+(1\\d{3}|20\\d{2})(?![\\d]))?`, 'g'), (m, mo, d, yy) => (+d >= 1 && +d <= 31 ? `${mo} ${ordinalEn(+d)}${y(yy)}` : m))
		.replace(new RegExp(`(?<![\\d.,])(\\d{1,2})(?:st|nd|rd|th)?\\s+(${month})\\b(?:,?\\s+(1\\d{3}|20\\d{2})(?![\\d]))?`, 'g'), (m, d, mo, yy) => (+d >= 1 && +d <= 31 ? `the ${ordinalEn(+d)} of ${mo}${y(yy)}` : m))
		// «in October 2026»
		.replace(new RegExp(`\\b(${month})\\s+(1\\d{3}|20\\d{2})(?![\\d]|[.,]\\d)`, 'g'), (m, mo, yy) => `${mo} ${yearEn(+yy)}`);
}

/** «90%» → «90 percent». */
export function speakPercentsEn(s: string): string {
	return s.replace(/(?<![\p{L}\d.,])(\d+(?:\.\d+)?)\s*%/gu, '$1 percent');
}

const CURRENCY: Record<string, [string, string]> = { $: ['dollar', 'dollars'], '€': ['euro', 'euros'], '£': ['pound', 'pounds'] };

/**
 * Every number left, in words. A dotted number is read part by part with «point», which is also how
 * a decimal is read (digit by digit after the point, so «0.07» keeps its zero), a version
 * («HTTP 1.1»), a criterion («1.4.3») and an address («8.8.8.8»). A thousands comma is dropped.
 * A range, «45–75», is «45 to 75»; a ratio, «4.5:1», «four point five to one».
 */
export function speakNumbersEn(s: string): string {
	const card = (n: string) => (n.length <= 12 ? cardinalEn(Number(n)) : n.split('').map((d) => ONES[+d]).join(' '));
	const digits = (n: string) => n.split('').map((d) => ONES[+d]).join(' ');
	return s
		.replace(/(?<![\p{L}\d.,])(\d{1,3}(?:,\d{3})+)(?![\p{L}\d]|,\d)/gu, (m) => m.replace(/,/g, ''))
		.replace(/(?<![\p{L}\d.,])([$€£])(\d+(?:\.\d+)?)\s?(million|billion|thousand)\b/gu, (m, c: string, n: string, mag: string) => `${n} ${mag} ${CURRENCY[c][1]}`)
		.replace(/(?<![\p{L}\d.,])([$€£])(\d+(?:\.\d+)?)(?![\d])/gu, (m, c: string, n: string) => `${n} ${Number(n) === 1 ? CURRENCY[c][0] : CURRENCY[c][1]}`)
		.replace(/(?<![\p{L}\d.,])(\d+(?:\.\d+)?)\s?[–—]\s?(\d+(?:\.\d+)?)(?![\d]|\.\d)/gu, '$1 to $2')
		.replace(/(?<![\p{L}\d.,])(\d+(?:\.\d+)?)\s?:\s?1(?![\d:])/gu, '$1 to one')
		.replace(/(?<![\p{L}\d])(\d+)(st|nd|rd|th)(?![\p{L}\d])/gu, (m, n: string) => (+n >= 0 && +n < 1000 ? ordinalEn(+n) : m))
		.replace(/(?<![\p{L}\d.])(\d+(?:\.\d+)+)(?![\p{L}\d]|\.\d)/gu, (m) => {
			const parts = m.split('.');
			// «4.5», «0.07», «1.1»: the fraction is read digit by digit; «1.4.3», «8.8.8.8»: each part is a number
			return parts.length === 2 ? `${card(parts[0])} point ${digits(parts[1])}` : parts.map(card).join(' point ');
		})
		.replace(/(?<![\p{L}\d])\d+(?![\d])/gu, (n) => card(n));
}
