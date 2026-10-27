/**
 * The course for answer engines (llmstxt.org): `llms.txt`, a map with one line per lesson (its
 * address and its definition), and `llms-full.txt`, every lesson's text as Markdown. A model that
 * reads them gets the course as it is written, without running the page's scripts or parsing its
 * layout; the definition each lesson opens with is the line a model can quote.
 *
 * The full text is the lesson's Markdown with what only a browser can use taken out: the
 * scripts, the live diagrams (Svelte components) and the template blocks. Build-time only.
 */
import { loadContent } from '#lib/content/load.ts';
import type { LessonMeta, Part } from '#lib/content/schema.ts';
import { t } from '#lib/i18n/index.ts';
import { LICENCE_URL, SITE_NAME, at } from './site.ts';

const raw = import.meta.glob<string>('/content/ru/**/*.svx', { query: '?raw', import: 'default', eager: true });

const ordered = () => {
	const { lessons, curriculum } = loadContent();
	return curriculum.parts
		.map((part) => ({ part, lessons: lessons.filter((l) => l.part === part.number).sort((a, b) => a.order - b.order) }))
		.filter((p) => p.lessons.length);
};

const partHeading = (p: Part) => `${t('map.part', { n: p.number })}. ${p.title}`;

const about = (n: number) =>
	`Открытый интерактивный учебник веба на русском языке: от первой страницы 1991 года до агентного веба. ${n} уроков в ${loadContent().curriculum.parts.length} частях; каждый урок открывается определением своей темы, затем теория, живая схема, практика на собственном сайте читателя, тест, карточки для повторения и источники. Бесплатно, без регистрации. Тексты уроков: CC BY-SA 4.0 (${LICENCE_URL}).`;

export function llmsTxt(): string {
	const parts = ordered();
	const n = parts.reduce((s, p) => s + p.lessons.length, 0);
	const out = [
		`# ${SITE_NAME}`,
		'',
		`> ${about(n)}`,
		'',
		`Адрес учебника: ${at.home()}. Карта курса со связями уроков: ${at.map()}. Полный текст всех уроков одним файлом: ${at.file('llms-full.txt')}.`,
		''
	];
	for (const { part, lessons } of parts) {
		out.push(`## ${partHeading(part)}`, '', part.summary, '');
		for (const l of lessons) out.push(`- [${l.title}](${at.lesson(l.id)}): ${l.definition}`);
		out.push('');
	}
	out.push('## Optional', '', `- [Исходный код и тексты](https://github.com/NoeticEcho/learn): репозиторий учебника`, '');
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

function lessonFull(l: LessonMeta, part: Part): string {
	const body = lessonMarkdown(raw[`/content/ru/${l.id}.svx`] ?? '').replace(/^(#{1,5}) /gm, '#$1 ');
	return [
		`# ${l.title}`,
		'',
		`${partHeading(part)}. Урок ${l.order}. ${at.lesson(l.id)}`,
		'',
		`> ${l.definition}`,
		'',
		l.summary,
		'',
		body,
		'',
		'Источники:',
		...l.sources.map((s) => `- [${s.title}](${s.url})`),
		''
	].join('\n');
}

export function llmsFullTxt(): string {
	const parts = ordered();
	const n = parts.reduce((s, p) => s + p.lessons.length, 0);
	return [`# ${SITE_NAME}`, '', `> ${about(n)}`, '', ...parts.flatMap(({ part, lessons }) => lessons.map((l) => lessonFull(l, part)))].join('\n');
}
