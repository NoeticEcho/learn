/**
 * The textbook's own short stop-word dictionaries (part 10), shared by the diagrams that read a
 * text with them. They find candidates; whether a flagged word stands for a fact is for a person.
 * Licence of this file: Apache-2.0.
 *
 * Two editions: the Russian dictionary (the source) and the English one, which is written for English
 * rather than translated: English officialese is "utilize" and "in accordance with", not a stem of
 * Russian verbal nouns. `mark(text)` reads the page's locale.
 */
import { getLocale, type Locale } from '#lib/i18n/index.ts';

export type Cat = 'appraisal' | 'amplifier' | 'officialese' | 'empty' | 'cliche' | 'chain';
const L = '[\\p{L}]*';
const start = '(?<![\\p{L}])';
type Dict = Record<Cat, { label: string; ask: string; words: string[] }>;
const ruDict: Dict = {
	appraisal: {
		label: 'Оценка без факта',
		ask: 'Что за этим стоит? Число, срок, документ, пример?',
		words: ['лучш' + L, 'качествен' + L, 'уникальн' + L, 'профессиональн' + L, 'высококвалифицирован' + L, 'надёжн' + L, 'эффективн' + L, 'современн' + L, 'индивидуальн' + L + ' подход' + L, 'оптимальн' + L, 'комфортн' + L]
	},
	amplifier: {
		label: 'Усилитель или вводное слово',
		ask: 'Что изменится, если слово убрать? Обычно ничего.',
		words: ['очень', 'действительно', 'безусловно', 'разумеется', 'конечно', 'несомненно', 'как известно', 'на самом деле', 'максимально', 'абсолютно', 'крайне']
	},
	officialese: {
		label: 'Канцелярит',
		ask: 'Какой глагол спрятан в этом слове? Скажите его.',
		words: ['осуществля' + L, 'является', 'являются', 'в целях', 'в рамках', 'предоставля' + L, 'обеспечива' + L, 'оказыва' + L, 'данн' + L, 'в соответствии с', 'посредством', 'в случае необходимости']
	},
	empty: {
		label: 'Пустой оборот',
		ask: 'Это слово несёт сведения? Если нет, уберите.',
		words: ['на сегодняшний день', 'в настоящее время', 'в наши дни', 'так называемый', 'своего рода', 'в сфере', 'в области', 'на рынке']
	},
	cliche: {
		label: 'Штамп',
		ask: 'Скажите то же простыми словами или назовите факт.',
		words: ['команд' + L + ' профессионалов', 'богат' + L + ' опыт' + L, 'широк' + L + ' спектр' + L, 'полный комплекс', 'динамично развива' + L, 'ваш надёжный партнёр', 'мы рады приветствовать', 'добро пожаловать', 'клиентоориентирован' + L]
	},
	chain: {
		label: 'Цепочка существительных',
		ask: 'Верните глагол: не «осуществление проверки», а «проверяем».',
		words: ['осуществлени' + L + ' \\p{L}+ни' + L, 'проведени' + L + ' \\p{L}+ни' + L, 'производств' + L + ' \\p{L}+ни' + L, 'обеспечени' + L + ' \\p{L}+ни' + L]
	}
};

const A = "[’']";
const enDict: Dict = {
	appraisal: {
		label: 'Appraisal with no fact behind it',
		ask: 'What stands behind it? A number, a date, a document, an example?',
		words: ['best', 'high-quality', 'quality', 'unique', 'professional' + L, 'highly qualified', 'reliable', 'efficient', 'cutting-edge', 'state-of-the-art', 'innovative', 'world-class', 'top-notch', 'leading', 'premier', 'personali[sz]ed (?:service|approach)', 'individual approach', 'optimal', 'comfortable', 'affordable', 'excellent', 'great', 'amazing']
	},
	amplifier: {
		label: 'Amplifier or filler',
		ask: 'What changes if you take the word out? Usually nothing.',
		words: ['very', 'really', 'truly', 'absolutely', 'definitely', 'of course', 'obviously', 'clearly', 'basically', 'actually', 'as you know', 'extremely', 'totally', 'literally', 'highly', 'quite']
	},
	officialese: {
		label: 'Officialese',
		ask: 'What plain verb is hiding in this word? Say that one.',
		words: ['utili[sz]' + L, 'leverag' + L, 'facilitat' + L, 'commenc' + L, 'endeavo' + L, 'in order to', 'pursuant to', 'in accordance with', 'prior to', 'subsequent to', 'with regard to', 'with respect to', 'in the event (?:that|of)', 'by means of', 'aforementioned', 'provid(?:e|es|ing|ed)', 'ensur(?:e|es|ing)', 'carr(?:y|ies|ying) out', 'is able to', 'comprise[sd]? of']
	},
	empty: {
		label: 'Empty phrase',
		ask: 'Does this carry any information? If not, cut it.',
		words: ['at this point in time', 'at the present time', 'at present', 'currently', 'in today' + A + 's world', 'in this day and age', 'so-called', 'a kind of', 'a sort of', 'in the field of', 'in the area of', 'in the sphere of', 'on the market', 'due to the fact that', 'the fact that', 'for the purpose of', 'it should be noted that', 'needless to say']
	},
	cliche: {
		label: 'Cliché',
		ask: 'Say the same thing in plain words, or give the fact.',
		words: ['team of (?:dedicated )?professionals', 'wealth of experience', 'wide range of', 'full range of', 'comprehensive (?:solutions?|services?)', 'one-stop shop', 'dynamic' + L + ' growing', 'your trusted partner', 'we are (?:pleased|delighted|happy) to welcome', 'welcome to', 'customer-centric', 'passionate about', 'synerg' + L, 'next level', 'game-changer', 'seamless' + L, 'robust', 'tailored', 'holistic' + L, 'best-in-class']
	},
	chain: {
		label: 'Chain of nouns',
		ask: 'Bring the verb back: not “the performance of an inspection”, but “we inspect”.',
		words: ['(?:the )?(?:implementation|provision|performance|conducting|conduct|undertaking|carrying out) of (?:the |an? )?\\p{L}+', '(?:the )?(?:execution|completion) of (?:the |an? )?\\p{L}+']
	}
};

const dicts: Record<Locale, Dict> = { ru: ruDict, en: enDict };
/** `end` closes an English word so “best” does not light up “bestow”; Russian words are stems. */
const ends: Record<Locale, string> = { ru: '', en: '(?![\\p{L}])' };
export const dictFor = (l: Locale = getLocale()): Dict => dicts[l];
export const cats = Object.keys(ruDict) as Cat[];
const cache: Partial<Record<Locale, Record<Cat, RegExp>>> = {};
const reFor = (l: Locale): Record<Cat, RegExp> =>
	(cache[l] ??= Object.fromEntries(cats.map((c) => [c, new RegExp(start + '(?:' + dicts[l][c].words.join('|') + ')' + ends[l], 'giu')])) as Record<Cat, RegExp>);

export type Seg = { text: string; cat?: Cat };

/** The text cut into plain and flagged pieces, flagged ones by kind; overlaps go to the first and longest. */
export function mark(text: string, l: Locale = getLocale()): Seg[] {
	const hits: { s: number; e: number; cat: Cat }[] = [];
	const re = reFor(l);
	for (const c of cats) for (const m of text.matchAll(re[c])) hits.push({ s: m.index, e: m.index + m[0].length, cat: c });
	hits.sort((a, b) => a.s - b.s || b.e - a.e);
	const out: Seg[] = [];
	let at = 0;
	for (const h of hits) {
		if (h.s < at) continue;
		if (h.s > at) out.push({ text: text.slice(at, h.s) });
		out.push({ text: text.slice(h.s, h.e), cat: h.cat });
		at = h.e;
	}
	if (at < text.length) out.push({ text: text.slice(at) });
	return out;
}

/** Words in a text (letters and digits). */
export const words = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
