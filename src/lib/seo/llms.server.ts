/**
 * The course for answer engines (llmstxt.org): `llms.txt`, a map with one line per lesson (its
 * address and its definition), and `llms-full.txt`, every lesson's text as Markdown. A model that
 * reads them gets the course as it is written, without running the page's scripts or parsing its
 * layout; the definition each lesson opens with is the line a model can quote.
 *
 * The full text is the lesson's Markdown with what only a browser can use taken out: the
 * scripts, the live diagrams (Svelte components) and the template blocks. Build-time only.
 */
import { loadContent, loadEdition } from '#lib/content/load.ts';
import type { LessonMeta, Part } from '#lib/content/schema.ts';
import '#lib/i18n/all.server.ts';
import { t, type Locale } from '#lib/i18n/index.ts';
import { LICENCE_URL, SITE_NAMES, at } from './site.ts';

const raw = {
	ru: import.meta.glob<string>('/content/ru/**/*.svx', { query: '?raw', import: 'default', eager: true }),
	en: import.meta.glob<string>('/content/en/**/*.svx', { query: '?raw', import: 'default', eager: true })
};

/** An edition's parts with the lessons written in it; a part with none is left out. */
const ordered = (lang: Locale) => {
	const { lessons, curriculum } = loadEdition(lang);
	return curriculum.parts
		.map((part) => ({ part, lessons: lessons.filter((l) => l.part === part.number).sort((a, b) => a.order - b.order) }))
		.filter((p) => p.lessons.length);
};

const partHeading = (p: Part, lang: Locale) => `${t('map.part', { n: p.number }, lang)}. ${p.title}`;

const about = (n: number, lang: Locale) => {
	const parts = loadContent().curriculum.parts.length;
	if (lang === 'ru')
		return `Открытый интерактивный учебник веба на русском языке: от первой страницы 1991 года до агентного веба. ${n} уроков в ${parts} частях; каждый урок открывается определением своей темы, затем теория, живая схема, практика на собственном сайте читателя, тест, карточки для повторения и источники. Бесплатно, без регистрации. Тексты уроков: CC BY-SA 4.0 (${LICENCE_URL}).`;
	const all = loadContent().lessons.length;
	// The edition is complete (154 of 154); a lesson that is missing would be counted, not hidden.
	const count = n < all ? `${n} of ${all} lessons in ${parts} parts, the rest still in Russian only` : `${n} lessons in ${parts} parts`;
	return `An open, interactive textbook of the web in English: from the first web page of 1991 to the agentic web. ${count}. Each lesson opens with a definition of its topic, then theory, a live diagram, practice on the reader's own site, a test, review cards and sources. Free, no sign-up. Lesson texts: CC BY-SA 4.0 (${LICENCE_URL}).`;
};

export function llmsTxt(lang: Locale = 'ru'): string {
	const parts = ordered(lang);
	const n = parts.reduce((s, p) => s + p.lessons.length, 0);
	const out = [
		`# ${SITE_NAMES[lang]}`,
		'',
		`> ${about(n, lang)}`,
		'',
		lang === 'ru'
			? `Адрес учебника: ${at.home()}. Карта курса со связями уроков: ${at.map()}. Полный текст всех уроков одним файлом: ${at.editionFile('llms-full.txt')}. Английское издание: ${at.editionFile('llms.txt', 'en')}.`
			: `The textbook: ${at.home('en')}. The course map, with how the lessons connect: ${at.map('en')}. The full text of every lesson in one file: ${at.editionFile('llms-full.txt', 'en')}. The complete Russian edition: ${at.editionFile('llms.txt')}.`,
		''
	];
	for (const { part, lessons } of parts) {
		out.push(`## ${partHeading(part, lang)}`, '', part.summary, '');
		for (const l of lessons) out.push(`- [${l.title}](${at.lesson(l.id, lang)}): ${l.definition}`);
		out.push('');
	}
	out.push(
		'## Optional',
		'',
		lang === 'ru'
			? `- [Исходный код и тексты](https://github.com/NoeticEcho/learn): репозиторий учебника`
			: `- [Source code and texts](https://github.com/NoeticEcho/learn): the textbook's repository`,
		''
	);
	return out.join('\n');
}

/**
 * Removes every Svelte component tag (`<Diagram … />`, `<Box>`, `</Box>`), however deep the
 * braces of its attributes nest: a tag ends at the first `>` outside braces and quotes.
 */
export function stripComponents(src: string): string {
	let out = '';
	let i = 0;
	while (i < src.length) {
		const at = src.slice(i).search(/<\/?[A-Z]/);
		if (at < 0) return out + src.slice(i);
		out += src.slice(i, i + at);
		let j = i + at + 1;
		let depth = 0;
		let quote = '';
		for (; j < src.length; j++) {
			const c = src[j];
			if (quote) {
				if (c === '\\') j++;
				else if (c === quote) quote = '';
			} else if (c === '"' || c === "'" || c === '`') quote = c;
			else if (c === '{') depth++;
			else if (c === '}') depth--;
			else if (c === '>' && depth === 0) break;
		}
		i = j + 1;
	}
	return out;
}

/** A lesson's body as Markdown: the scripts, diagrams and template blocks taken out. */
export function lessonMarkdown(source: string): string {
	// The component's own scripts open the file (`<script module>` with the metadata, then the
	// instance script with the diagrams' imports); a `<script>` later on is an example in the text.
	let markup = source;
	for (let m; (m = markup.match(/^\s*<script[^>]*>[\s\S]*?\n<\/script>/)); ) markup = markup.slice(m[0].length);
	// Code (fenced or inline) is text the lesson shows: a `<Counter />` or a `<style>` there stays.
	return markup
		.split(/(```[\s\S]*?```|`[^`\n]*`)/)
		.map((part, i) => (i % 2 ? part : stripComponents(part.replace(/<style[^>]*>[\s\S]*?<\/style>/g, ''))))
		.join('')
		.replace(/^[ \t]*\{[#/:@][^}]*\}[ \t]*$/gm, '')
		.replace(/<summary>([\s\S]*?)<\/summary>/g, '**$1**')
		.replace(/<\/?details>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function lessonFull(l: LessonMeta, part: Part, lang: Locale): string {
	const body = lessonMarkdown(raw[lang][`/content/${lang}/${l.id}.svx`] ?? '').replace(/^(#{1,5}) /gm, '#$1 ');
	return [
		`# ${l.title}`,
		'',
		`${partHeading(part, lang)}. ${lang === 'ru' ? 'Урок' : 'Lesson'} ${l.order}. ${at.lesson(l.id, lang)}`,
		'',
		`> ${l.definition}`,
		'',
		l.summary,
		'',
		body,
		'',
		lang === 'ru' ? 'Источники:' : 'Sources:',
		...l.sources.map((s) => `- [${s.title}](${s.url})`),
		''
	].join('\n');
}

export function llmsFullTxt(lang: Locale = 'ru'): string {
	const parts = ordered(lang);
	const n = parts.reduce((s, p) => s + p.lessons.length, 0);
	return [`# ${SITE_NAMES[lang]}`, '', `> ${about(n, lang)}`, '', ...parts.flatMap(({ part, lessons }) => lessons.map((l) => lessonFull(l, part, lang)))].join('\n');
}
