/**
 * The textbook's own short stop-word dictionaries (part 10), shared by the diagrams that read a
 * text with them. They find candidates; whether a flagged word stands for a fact is for a person.
 * Licence of this file: Apache-2.0.
 */
export type Cat = 'appraisal' | 'amplifier' | 'officialese' | 'empty' | 'cliche' | 'chain';
const L = '[\\p{L}]*';
const start = '(?<![\\p{L}])';
export const dict: Record<Cat, { label: string; ask: string; words: string[] }> = {
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
export const cats = Object.keys(dict) as Cat[];
export const re = Object.fromEntries(cats.map((c) => [c, new RegExp(start + '(?:' + dict[c].words.join('|') + ')', 'giu')])) as Record<Cat, RegExp>;

export type Seg = { text: string; cat?: Cat };

/** The text cut into plain and flagged pieces, flagged ones by kind; overlaps go to the first and longest. */
export function mark(text: string): Seg[] {
	const hits: { s: number; e: number; cat: Cat }[] = [];
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
