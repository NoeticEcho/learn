// The English edition's house style (docs/content-plan/README.md, «English edition»):
// - headings in sentence case: after the first word, a capital only for a name, an acronym or a
//   word with capitals inside it (JavaScript), and the first word after a colon stays lower case;
// - no Cyrillic in the English text (a Russian source's title is the source's, and is skipped);
// - typographic quotes and apostrophes in prose: “ ” and ’, never " or ' (code is skipped);
// - no dash in a sentence, as in Russian; a definition may define with «is», never with a dash.
// Prose is what tests/unit/style.test.ts reads: the body outside code and tags, and the words of
// the metadata, not practice files, checks, sources or the pronunciation map.
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadEdition } from '#lib/content/load.ts';

// Words that keep their capital mid-heading. Add a name here when a lesson needs one.
const NAMES = new Set([
	'Echo', 'Iskin', 'Runet', 'Russia', 'Russian', 'English', 'Google', 'Yandex', 'Tilda', 'Wix', 'Squarespace', 'Shopify',
	'Bitrix', 'Kubernetes', 'Docker', 'Compose', 'Markdown', 'Flexbox', 'Grid', 'Jamstack', 'Ogilvy', 'Cialdini', 'Fogg',
	'Freytag', 'Duarte', 'Harmon', 'Campbell', 'Vogler', 'Pixar', 'Schwartz', 'Goodhart', 'Lighthouse', 'Postgres',
	'Material', 'Apple', 'Fluent', 'Carbon', 'Atlassian', 'Polaris', 'Primer', 'Radix', 'Tailwind', 'Telegram', 'Netscape',
	'Mosaic', 'Figma', 'Drupal', 'Joomla', 'Jekyll', 'Hugo', 'Eleventy', 'Astro', 'Strapi', 'Directus', 'Sanity',
	'Contentful', 'Decap', 'Vercel', 'Netlify', 'Pages', 'GitHub', 'Lovable', 'Metrica', 'Europe', 'European', 'UK',
	'Web', 'World', 'Wide', 'I', 'Story', 'Brand', 'Canvas', 'Value', 'Proposition', 'Metric', 'Star', 'North'
]);

function body(file: string): string {
	// the module and instance scripts open the file, each closed by a `</script>` at a line's start
	let prose = readFileSync(file, 'utf8').trimStart();
	while (prose.startsWith('<script')) {
		const end = prose.indexOf('\n</script>');
		prose = prose.slice(end + '\n</script>'.length).trimStart();
	}
	return prose
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`\n]*`/g, ' ')
		.replace(/<[^>\n]+>/g, ' ')
		.replace(/\]\([^)]*\)/g, ']');
}

const SKIP = /^(practice\.(files|solution|checks)|sources|videos|say|id$)/;
function words(value: unknown, path = ''): string[] {
	if (SKIP.test(path)) return [];
	if (typeof value === 'string') return [value];
	if (Array.isArray(value)) return value.flatMap((v, i) => words(v, path ? `${path}.${i}` : String(i)));
	if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => words(v, path ? `${path}.${k}` : k));
	return [];
}

/** The words of a heading that break sentence case. */
export function notSentenceCase(heading: string): string[] {
	return heading
		.split(/(?<=:)\s+|\s+/)
		.slice(1)
		.filter((w, i, all) => {
			const word = w.replace(/^[“"(«]+|[”"),.:;!?»’']+$/g, '');
			if (!/^[A-Z][a-z]/.test(word)) return false;
			if (i > 0 && all[i - 1].endsWith(':')) return false; // never mind: the next check catches a capital after a colon
			return !NAMES.has(word) && !/[A-Z]/.test(word.slice(1));
		});
}

const en = loadEdition('en');

describe('English house style', () => {
	test('the sentence-case rule itself', () => {
		expect(notSentenceCase('Cards and spaced repetition')).toEqual([]);
		expect(notSentenceCase('Cards And Spaced Repetition')).toEqual(['And', 'Spaced', 'Repetition']);
		expect(notSentenceCase('Echo, and what to do in JavaScript with HTML')).toEqual([]);
	});
	for (const lesson of en.lessons) {
		const file = `content/en/${lesson.id}.svx`;
		const text = body(file);
		const prose = [text, ...words(lesson)].join('\n');
		test(`${lesson.id}: headings in sentence case`, () => {
			const headings = [lesson.title, ...[...text.matchAll(/^#{2,4} (.+)$/gm)].map((m) => m[1])];
			const bad = headings.flatMap((h) => notSentenceCase(h).map((w) => `${h}: ${w}`));
			expect(bad).toEqual([]);
			expect(headings.filter((h) => /:\s+[A-Z][a-z]/.test(h) && !NAMES.has(h.split(/:\s+/)[1].split(/\W/)[0]))).toEqual([]);
		});
		test(`${lesson.id}: no Cyrillic`, () => expect(prose.match(/[А-Яа-яЁё]+/g) ?? []).toEqual([]));
		test(`${lesson.id}: typographic quotes and apostrophes`, () => {
			expect(prose.split('\n').filter((l) => /["']/.test(l))).toEqual([]);
		});
		test(`${lesson.id}: no dash in a sentence`, () => expect(prose.split('\n').filter((l) => / [—–] /.test(l))).toEqual([]));
	}
});
