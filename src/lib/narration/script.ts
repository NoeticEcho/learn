/**
 * A lesson's narration script (spec §4.9): what the voice says, section by section. Pure and
 * deterministic, so the same lesson text always gives the same script, and a section's hash
 * (narration.server.ts) changes only when what is said in it changes.
 *
 * What is read: the title, the «Зачем» and the definition (the `intro` section), then every
 * `##` section of the body: its heading, paragraphs, list items, tables row by row, and the
 * «Проверьте себя» questions with their answers. What is not: the practice section (its task is
 * on the page, beside the editor), code (a code block becomes «Пример кода.»), diagrams and other
 * components (the text around them already says what they show), the comic, the quiz.
 *
 * The spoken form is not the displayed one. The lesson's own `say` map and the course's lexicon
 * (content/narration/ru.yaml) turn written forms into how a person says them («DNS» → «ди-эн-эс»,
 * «example.com» → «экзампл точка ком»); an unmapped Latin acronym is spelt letter by letter; years
 * are spelt out in their case (numbers.ts); a word the voice stresses wrongly is given its stress.
 * None of this reaches the page: the displayed text is never touched.
 */
import { cardinal, speakDates, speakNumbers, speakPercents, speakYears } from './numbers.ts';
import { cardinalEn, speakDatesEn, speakNumbersEn, speakPercentsEn, speakYearsEn } from './numbers.en.ts';

export type Lexicon = {
	/** How each Latin letter is named when an acronym is spelt out: { A: 'эй', … }. */
	letters: Record<string, string>;
	/** Written form → spoken form, for the whole course. A lesson's `say` wins over it. */
	words: Record<string, string>;
	/** Words the voice stresses wrongly, written with a combining acute (U+0301) after the stressed vowel. */
	stress: string[];
	/** Acronyms read as words rather than spelt: { JSON: 'джейсон' } lives in `words`; these are left alone. */
	keep: string[];
};

export type Section = {
	/** `intro`, or the section's position among the body's `##` headings, from 1. */
	key: string;
	/** The heading as the page shows it (the intro's is the lesson title); the player finds it by this. */
	heading: string;
	/** What is said, sentence by sentence; the first is the heading. */
	sentences: string[];
};

export type LessonText = { title: string; summary: string; definition: string; say?: Record<string, string> };

export type Lang = 'ru' | 'en';

/** What the script says in its own words, which is the one thing about it that depends on the language. */
type Strings = {
	/** Sections whose heading matches are not read. */
	skip: RegExp;
	code: string;
	table: string;
	answer: string;
	/** The head of a table's column, lower-cased when the sentence goes on: «Тон: деловой». */
	capitalised: RegExp;
	equals: string;
	and: string;
	query: string;
	closing: string;
	dot: string;
	at: string;
	number: string;
	plus: string;
	by: string;
	divide: string;
	approx: string;
	minus: string;
	squared: string;
	hash: string;
	version: string;
	zero: string;
	xx: string;
	xn: string;
	/** Between the letters of a spelt acronym. */
	spell: string;
	units: Record<string, string>;
};

const STRINGS: Record<Lang, Strings> = {
	ru: {
		skip: /^Практика$/,
		code: 'Пример кода.',
		table: 'На странице таблица.',
		answer: 'Ответ:',
		capitalised: /^[А-ЯЁ][а-яё]/,
		equals: 'равно',
		and: 'и',
		query: 'вопрос',
		closing: 'закрывающий',
		dot: 'точка',
		at: 'собака',
		number: 'номер',
		plus: 'плюс',
		by: 'на',
		divide: 'разделить на',
		approx: 'примерно равно',
		minus: 'минус',
		squared: 'в квадрате',
		hash: 'решётка',
		version: 'ви',
		zero: 'ноль',
		xx: '-икс-икс',
		xn: 'набор латинских букв, который начинается с икс-эн и двух дефисов',
		spell: '-',
		units: { px: 'пикселей', rem: 'рем', em: 'эм', fr: 'эф-эр', vh: 'ви-эйч', vw: 'ви-дабл-ю', ch: 'си-эйч', ms: 'миллисекунд', кб: 'килобайт', kb: 'килобайт', мб: 'мегабайт', mb: 'мегабайт', гб: 'гигабайт', gb: 'гигабайт' }
	},
	en: {
		skip: /^Practice$/,
		code: 'Code example.',
		table: 'There is a table on the page.',
		answer: 'Answer:',
		capitalised: /^[A-Z][a-z]/,
		equals: 'equals',
		and: 'and',
		query: 'question mark',
		closing: 'closing',
		dot: 'dot',
		at: 'at',
		number: 'number',
		plus: 'plus',
		by: 'by',
		divide: 'divided by',
		approx: 'is about',
		minus: 'minus',
		squared: 'squared',
		hash: 'hash',
		version: 'version',
		zero: 'zero',
		xx: ' X X',
		xn: 'a string of Latin letters that starts with x, n and two hyphens',
		spell: ' ',
		units: { px: 'pixels', rem: 'rem', em: 'em', fr: 'F R', vh: 'V H', vw: 'V W', ch: 'C H', ms: 'milliseconds', kb: 'kilobytes', mb: 'megabytes', gb: 'gigabytes' }
	}
};
// One utterance should not be a single word: alone, the voice mangles short items (in the probe
// «Мука.» came out five seconds long). Shorter sentences are joined to their neighbour.
const MIN_SENTENCE = 40;
// and not a paragraph: a long sentence is cut at a semicolon, a colon or a dash.
const MAX_SENTENCE = 320;

/** The lesson's body: what follows its `<script module>` and `<script>` blocks. */
export function bodyOf(source: string): string {
	let s = source.trimStart();
	for (let m; s.startsWith('<script') && (m = /^<\/script>$/m.exec(s)); ) s = s.slice(m.index + m[0].length).trimStart();
	return s;
}

const ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', shy: '' };

/** Inline code, as a person reads it aloud: the words in it, without the punctuation of code. */
function speakCode(code: string, lang: Lang = 'ru'): string {
	const T = STRINGS[lang];
	const closing = /^<\/\w/.test(code);
	const words = code
		.replace(/^<\/?|\/?>$/g, '')
		.replace(/^\/(?=\p{L})/u, '')
		.replace(/\s*=\s*/g, ` ${T.equals} `)
		.replace(/\s*&\s*/g, ` ${T.and} `)
		.replace(/(?<=\p{L})\?(?=\p{L})/gu, ` ${T.query} `)
		.replace(/[<>{}()[\];"'`*$\\|^~]+/g, ' ')
		.replace(/^[:!.#@-]+(?=\w)/, '')
		.replace(/:\/\/$/, '')
		.replace(/\s+/g, ' ')
		.trim();
	return closing ? `${T.closing} ${words}` : words;
}

/** Markdown and HTML inline markup → plain text. */
export function plain(s: string, lang: Lang = 'ru'): string {
	return s
		.replace(/`([^`]+)`/g, (_, c: string) => speakCode(c, lang))
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/&(#\d+|[a-z]+);/g, (m, e: string) => (e.startsWith('#') ? String.fromCodePoint(+e.slice(1)) : (ENTITIES[e] ?? m)))
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, '$1')
		.replace(/(?<![\wА-Яа-яЁё])_([^_\n]+)_(?![\wА-Яа-яЁё])/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

const terminal = (s: string) => (/[.!?…]["»)]*$/.test(s) ? s : `${s.replace(/[:;,]+$/, '')}.`);

type Block = { kind: 'heading'; text: string } | { kind: 'text'; text: string };

/** The body's blocks, in order: headings and the sentences-to-be of everything readable. */
function blocks(body: string, lang: Lang = 'ru'): Block[] {
	const T = STRINGS[lang];
	const plain_ = (s: string) => plain(s, lang);
	const out: Block[] = [];
	const lines = body.split('\n');
	let para: string[] = [];
	const flush = () => {
		if (para.length) out.push({ kind: 'text', text: plain_(para.join(' ')) });
		para = [];
	};
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const t = line.trim();
		if (/^(```|~~~)/.test(t)) {
			flush();
			const fence = t.slice(0, 3);
			while (++i < lines.length && !lines[i].trim().startsWith(fence));
			out.push({ kind: 'text', text: T.code });
			continue;
		}
		if (!t) {
			flush();
			continue;
		}
		if (/^<(script|style)\b/.test(t)) {
			flush();
			while (i < lines.length && !/<\/(script|style)>/.test(lines[i])) i++;
			continue;
		}
		// a component: <WebTimeline />, or one spread over several lines, or with children
		if (/^<[A-Z]/.test(t)) {
			flush();
			const name = /^<([A-Za-z.]+)/.exec(t)![1];
			let j = i;
			let text = t;
			while (!/\/>\s*$/.test(text) && !new RegExp(`</${name}>`).test(text) && !(j > i && /^>\s*$/.test(lines[j].trim())) && j + 1 < lines.length) text += '\n' + lines[++j];
			// a component with children (<X>…</X>) is skipped whole
			if (!/\/>\s*$/.test(text) && !new RegExp(`</${name}>`).test(text)) while (j + 1 < lines.length && !new RegExp(`</${name}>`).test(lines[j])) j++;
			i = j;
			continue;
		}
		const h = /^(#{2,4})\s+(.*)$/.exec(t);
		if (h) {
			flush();
			if (h[1] === '##') out.push({ kind: 'heading', text: plain_(h[2]) });
			else out.push({ kind: 'text', text: terminal(plain_(h[2])) });
			continue;
		}
		if (/^<details\b/.test(t) || /^<\/details>/.test(t)) {
			flush();
			continue;
		}
		const summary = /^<summary>(.*)<\/summary>$/.exec(t);
		if (summary) {
			flush();
			out.push({ kind: 'text', text: terminal(plain_(summary[1])) });
			// the answer follows: «Ответ:» before its first paragraph
			let j = i + 1;
			while (j < lines.length && !lines[j].trim()) j++;
			if (j < lines.length && !/^<\/details>/.test(lines[j].trim())) lines[j] = `${T.answer} ${lines[j].trim()}`;
			continue;
		}
		if (/^\|/.test(t)) {
			flush();
			const rows: string[][] = [];
			while (i < lines.length && /^\|/.test(lines[i].trim())) {
				const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => plain_(c));
				if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
				i++;
			}
			i--;
			out.push(...table(rows, lang));
			continue;
		}
		const item = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(t);
		if (item) {
			flush();
			para = [item[1]];
			// a list item's continuation lines are indented
			while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && !/^\s*(?:[-*+]|\d+[.)])\s/.test(lines[i + 1])) para.push(lines[++i].trim());
			out.push({ kind: 'text', text: terminal(plain_(para.join(' '))) });
			para = [];
			continue;
		}
		para.push(t.replace(/^>\s?/, ''));
	}
	flush();
	return out.filter((b) => b.text.replace(/[.\s]/g, ''));
}

/** A table, row by row: «Тон: деловой; что чувствуется: собранность, доверие.» A table of data reads as one line. */
function table(rows: string[][], lang: Lang = 'ru'): Block[] {
	const T = STRINGS[lang];
	if (!rows.length) return [];
	const [head, ...body] = rows;
	const cells = body.flat();
	const numeric = cells.filter((c) => /^[\d\s.,%₽$€:–—-]*$/.test(c)).length;
	if (!body.length || numeric / Math.max(1, cells.length) > 0.3) return [{ kind: 'text', text: T.table }];
	const lower = (s: string) => (T.capitalised.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
	return body.map((r) => ({
		kind: 'text' as const,
		text: terminal(r.map((c, k) => (k === 0 ? c : head[k] ? `${lower(head[k])}: ${c}` : c)).filter(Boolean).join('; ').replace(/^(.*?);/, '$1:'))
	}));
}

/** Splits text into sentences, then joins the short ones and cuts the long ones. */
export function sentences(text: string): string[] {
	const raw = text
		.split(/(?<=[.!?…]["»)]*)\s+(?=[«"“‘(]?[А-ЯЁA-Z0-9])/)
		.map((s) => s.trim())
		.filter(Boolean);
	const cut: string[] = [];
	for (const s of raw) {
		let rest = s;
		while (rest.length > MAX_SENTENCE) {
			const window = rest.slice(80, MAX_SENTENCE);
			const at = Math.max(window.lastIndexOf('; '), window.lastIndexOf(': '), window.lastIndexOf(' — '));
			const comma = window.lastIndexOf(', ');
			const k = at >= 0 ? at : comma;
			if (k < 0) break;
			const end = 80 + k + 1;
			cut.push(rest.slice(0, end).replace(/[;:,]$/, '.').trim());
			rest = rest.slice(end).trim();
			rest = rest.replace(/^—\s*/, '');
			rest = rest[0].toUpperCase() + rest.slice(1);
		}
		cut.push(rest);
	}
	const out: string[] = [];
	for (const s of cut) {
		const last = out.length - 1;
		if (last >= 0 && (out[last].length < MIN_SENTENCE || s.length < MIN_SENTENCE) && out[last].length + s.length < MAX_SENTENCE) out[last] = `${out[last]} ${s}`;
		else out.push(s);
	}
	return out;
}

const LATIN_CAPS =/(?<![\p{L}\p{N}])([A-Z]{2,6})(\d{0,2})(?![\p{L}])/gu;

/** Applies a map of written → spoken forms, longest key first, at word boundaries. */
function applyMap(s: string, map: Record<string, string>): string {
	const keys = Object.keys(map).sort((a, b) => b.length - a.length);
	if (!keys.length) return s;
	const esc = (k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const rx = new RegExp(`(?<![\\p{L}\\p{N}])(?:${keys.map(esc).join('|')})(?![\\p{L}\\p{N}])`, 'gu');
	return s.replace(rx, (m) => map[m]);
}

/** Domain names and URLs: «www.example.ru» → «www точка example точка ru», «.ru» → «точка ru». */
function speakDomains(s: string, lang: Lang = 'ru'): string {
	const T = STRINGS[lang];
	return s
		.replace(/(?<![\p{L}\p{N}])([\p{L}\p{N}._-]+)@(?=[\p{L}\p{N}-]+\.)/gu, `$1 ${T.at} `)
		.replace(/\bhttps?:\/\/(?=\S)/g, (m) => (m.startsWith('https') ? 'HTTPS ' : 'HTTP '))
		.replace(/(?<![\p{L}\p{N}@])((?:[a-zа-яё0-9-]+\.)+[a-zа-яё]{2,})(?:\/\S*)?(?![\p{L}\p{N}])/giu, (m, host: string) =>
			/\.(html|css|js|json|svg|png|jpg|txt|md|xml|webp|woff2|ts|py)$/i.test(host) || !/\./.test(host) ? m.replace(/\./g, ` ${T.dot} `) : host.split('.').join(` ${T.dot} `)
		)
		.replace(/(?<![\p{L}\p{N}])\.([a-zа-яё]{2,6})(?![\p{L}\p{N}])/giu, `${T.dot} $1`);
}

/** The stress dictionary: «замо́к» → the voice's own way of being told (see `stressMark`). */
function stressMap(words: string[]): Record<string, string> {
	const map: Record<string, string> = {};
	for (const w of words) {
		const bare = w.replace(/́/g, '');
		map[bare] = w;
		map[bare[0].toUpperCase() + bare.slice(1)] = w[0].toUpperCase() + w.slice(1);
	}
	return map;
}

/**
 * The engine reads a combining acute as a sound of its own («за́мок» came out «заемок»), so an
 * authored stress mark is given to it as a capital vowel instead («зАмок»), which it reads
 * without damage. Whether it then moves the stress is for a listener to say.
 */
export function stressMark(s: string): string {
	return s.replace(/([аеёиоуыэюяАЕЁИОУЫЭЮЯ])́/g, (_, v: string) => v.toUpperCase());
}

/**
 * A colour in hex, «#0b5cad», character by character: «решётка ноль би пять си эй ди». Read as a number it came
 * out «нольb5cad» (the leading zero taken for a number of its own, the rest left in Latin). It must have a digit,
 * or be one letter repeated («#fff»), so that an anchor like «#cafe» is not taken for a colour.
 */
export function speakHex(s: string, letters: Record<string, string>, lang: Lang = 'ru'): string {
	const T = STRINGS[lang];
	const digit = (n: number) => (lang === 'en' ? cardinalEn(n) : cardinal(n));
	return s.replace(/(?<![\p{L}\p{N}&])#([0-9a-f]{3,8})(?![\p{L}\p{N}-])/giu, (m, hex: string) => {
		if (![3, 4, 6, 8].includes(hex.length) || !(/\d/.test(hex) || /^(.)\1+$/.test(hex))) return m;
		return `${T.hash} ${[...hex].map((ch) => (/\d/.test(ch) ? digit(Number(ch)) : (letters[ch.toUpperCase()] ?? ch))).join(' ')}`;
	});
}

/** One sentence, written → spoken. */
export function speak(s: string, lex: Lexicon, say: Record<string, string> = {}, lang: Lang = 'ru'): string {
	const T = STRINGS[lang];
	const en = lang === 'en';
	let out = s
		.replace(/(?<=\p{L})­/gu, '')
		.replace(/[“”„]/g, '"')
		.replace(/\s*→\s*/g, ', ')
		.replace(/(?<=\s)&(?=\s)/g, T.and)
		.replace(/№\s*/g, `${T.number} `);
	out = speakHex(out, lex.letters, lang);
	out = out.replace(/xn--[a-z0-9-]+(?:\.xn--[a-z0-9-]+)*/g, T.xn);
	out = applyMap(out, say);
	out = applyMap(out, lex.words);
	out = speakDomains(out, lang);
	out = applyMap(out, lex.words); // the parts of a domain, now words of their own
	out = en ? speakYearsEn(out) : speakYears(out);
	out = en ? speakDatesEn(out) : speakDates(out);
	out = en ? speakPercentsEn(out) : speakPercents(out);
	// «v3.0», «v7»: a version's letter is read («ви три»), not left to the number rules, which took the «v» for a word and the «0» for a number of its own
	out = out.replace(/(?<![\p{L}\p{N}])v(?=\d)/gu, `${T.version} `);
	// «152-эф-зэ», «HTML5-страница»: a number fused to letters by a hyphen is said with a pause
	out = out.replace(/(?<=\d)-(?=\p{L}{2})(?!(?:го|му|ми)(?!\p{L}))|(?<=\p{L})-(?=\d)/gu, ' ');
	out = out.replace(/(\d)\s?(px|rem|em|fr|vh|vw|ch|ms|КБ|kB|KB|МБ|MB|ГБ|GB)(?![\p{L}\p{N}])/gu, (m, d: string, u: string) => `${d} ${T.units[u.toLowerCase()] ?? u}`);
	out = out.replace(/(?<![\p{L}\p{N}])F(\d{1,2})(?![\p{L}\p{N}])/gu, `${lex.letters.F ?? 'F'} $1`);
	// «A01» (the OWASP list): the letter's name, the number read digit by digit when it starts with a zero
	out = out.replace(/(?<![\p{L}\p{N}])([A-Z])(0\d)(?![\p{L}\p{N}])/gu, (m, c: string, n: string) => `${lex.letters[c] ?? c} ${T.zero} ${en ? cardinalEn(Number(n[1])) : cardinal(Number(n[1]))}`);
	const keep = new Set(lex.keep);
	out = out.replace(LATIN_CAPS, (m, caps: string, digits: string) => {
		if (keep.has(caps)) return m;
		const spelt = [...caps].map((c) => lex.letters[c] ?? c).join(T.spell);
		return digits ? `${spelt} ${digits}` : spelt;
	});
	out = out
		.replace(/(?<=[\p{L}\d])\/(?=\p{L})|(?<=\p{L})\/(?=\d)/gu, ' ')
		.replace(/\s\+\s|(?<=\p{L})\+(?=\p{L})/gu, ` ${T.plus} `)
		.replace(/(?<![\p{L}])(\d)xx(?![\p{L}])/gu, `$1${T.xx}`)
		.replace(/\s×\s|(?<=\d)×(?=\d)/g, ` ${T.by} `)
		// a formula, read as one: «N ≈ 16 × p ÷ d²» (the voice passed over these signs, or said them as it liked)
		.replace(/\s÷\s/g, ` ${T.divide} `)
		.replace(/\s≈\s/g, ` ${T.approx} `)
		.replace(/\s−\s/g, ` ${T.minus} `)
		.replace(/(?<=[\p{L})\d])²/gu, ` ${T.squared}`);
	if (en) out = out.replace(/§\s*/g, 'section ');
	out = en ? speakNumbersEn(out) : speakNumbers(out);
	out = applyMap(out, stressMap(lex.stress));
	return stressMark(out).replace(/\s+/g, ' ').trim();
}

/** The lesson's sections, written and spoken. */
export function narrate(source: string, lesson: LessonText, lex: Lexicon, lang: Lang = 'ru'): Section[] {
	const T = STRINGS[lang];
	const say = lesson.say ?? {};
	const sections: { key: string; heading: string; texts: string[] }[] = [
		{ key: 'intro', heading: lesson.title, texts: [terminal(lesson.title), lesson.summary, lesson.definition] }
	];
	let skipping = false;
	let n = 0;
	for (const b of blocks(bodyOf(source), lang)) {
		if (b.kind === 'heading') {
			n++;
			skipping = T.skip.test(b.text);
			if (!skipping) sections.push({ key: String(n), heading: b.text, texts: [terminal(b.text)] });
			continue;
		}
		if (!skipping) sections.at(-1)!.texts.push(b.text);
	}
	return sections
		.map((s) => {
			// the heading stays an utterance of its own: the player pauses after it
			const [head, ...rest] = s.texts;
			const body = rest.flatMap((t) => sentences(t)).map((t) => speak(t, lex, say, lang));
			// a sentence starts with a capital even when the written one starts with a term: the voice
			// took «эм-икс: почтовый сервер» for the middle of something, and swallowed the term
			const said = [speak(head, lex, say, lang), ...body].filter(Boolean).map((t) => t[0].toUpperCase() + t.slice(1));
			return { key: s.key, heading: s.heading, sentences: said };
		})
		.filter((s) => s.sentences.length > 1);
}
