// The English edition's house style (docs/content-plan/README.md, «English edition»):
// - headings in sentence case: after the first word, a capital only for a name, an acronym or a
//   word with capitals inside it (JavaScript), and the first word after a colon stays lower case;
// - no Cyrillic in the English text (a Russian source's title is the source's, and is skipped);
// - typographic quotes and apostrophes in prose: “ ” and ’, never " or ' (code is skipped);
// - no dash in a sentence, as in Russian; a definition may define with «is», never with a dash;
// - American spelling (color, license, organize, behavior): the code a learner writes is American,
//   and prose spelled «colour» beside `color` confuses a beginner.
// Prose is what tests/unit/style.test.ts reads: the body outside code and tags, and the words of
// the metadata, not practice files, checks, sources or the pronunciation map.
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadEdition } from '#lib/content/load.ts';
import { loadCourseLessons } from '#lib/courses/lessons.ts';
import { lessonFile } from '#lib/courses/types.ts';
import { NAMES, britishSpellings, notSentenceCase } from './style-en-helpers.ts';

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

// ids are the Russian lesson's (a concept, a card, a step), so “design-colour-system” is not prose.
const SKIP = /^(practice\.(id|continues|files|solution|checks)|sources|videos|say|id$|teaches|requires|cards\.\d+\.id)/;
function words(value: unknown, path = ''): string[] {
	if (SKIP.test(path)) return [];
	if (typeof value === 'string') return [value];
	if (Array.isArray(value)) return value.flatMap((v, i) => words(v, path ? `${path}.${i}` : String(i)));
	if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => words(v, path ? `${path}.${k}` : k));
	return [];
}

/** Lessons that quote Russian words as examples of what another language does. */
const CYRILLIC_EXAMPLES = new Set(['04-design/10-russian-systems']);

const en = loadEdition('en');

describe('English house style', () => {
	test('the sentence-case rule itself', () => {
		expect(notSentenceCase('Cards and spaced repetition')).toEqual([]);
		expect(notSentenceCase('Cards And Spaced Repetition')).toEqual(['And', 'Spaced', 'Repetition']);
		expect(notSentenceCase('Echo, and what to do in JavaScript with HTML')).toEqual([]);
	});
	test('the American-spelling rule itself', () => {
		expect(britishSpellings('Colour, behaviour, a licence, organise, the centre, a catalogue, labelling, grey')).toEqual([
			'Colour', 'behaviour', 'licence', 'organise', 'centre', 'catalogue', 'labelling', 'grey'
		]);
		expect(britishSpellings('Color, behavior, a license, organize, the center, a catalog, exercise, promise, advertising')).toEqual([]);
	});
	// the web course's English edition, then every other course's open lessons in English
	const all = [...en.lessons, ...loadCourseLessons().map((e) => e.meta.en)] as { id: string; title: string }[];
	for (const lesson of all) {
		const file = lessonFile(lesson.id, 'en');
		const text = body(file);
		const prose = [text, ...words(lesson)].join('\n');
		test(`${lesson.id}: headings in sentence case`, () => {
			const headings = [lesson.title, ...[...text.matchAll(/^#{2,4} (.+)$/gm)].map((m) => m[1])];
			const bad = headings.flatMap((h) => notSentenceCase(h).map((w) => `${h}: ${w}`));
			expect(bad).toEqual([]);
			expect(headings.filter((h) => /:\s+[A-Z][a-z]/.test(h) && !NAMES.has(h.split(/:\s+/)[1].split(/\W/)[0]))).toEqual([]);
		});
		// A lesson whose subject is another language shows that language's words (the Russian plural forms).
		test(`${lesson.id}: no Cyrillic`, () => expect(CYRILLIC_EXAMPLES.has(lesson.id) ? [] : (prose.match(/[А-Яа-яЁё]+/g) ?? [])).toEqual([]));
		test(`${lesson.id}: typographic quotes and apostrophes`, () => {
			expect(prose.split('\n').filter((l) => /["']/.test(l))).toEqual([]);
		});
		test(`${lesson.id}: American spelling`, () => expect(britishSpellings(prose)).toEqual([]));
		test(`${lesson.id}: no dash in a sentence`, () => expect(prose.split('\n').filter((l) => / [—–] /.test(l))).toEqual([]));
	}
});
