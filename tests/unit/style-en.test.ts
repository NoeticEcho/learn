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

// ids are the Russian lesson's (a concept, a card, a step), so “design-colour-system” is not prose.
const SKIP = /^(practice\.(id|continues|files|solution|checks)|sources|videos|say|id$|teaches|requires|cards\.\d+\.id)/;
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

/** British spellings that have an American form. A stem or a whole word; add to it when a lesson shows another. */
const BRITISH = new RegExp(
	'\\b(?:' +
		[
			'colour\\w*', 'behaviour\\w*', 'favour\\w*', 'honour\\w*', 'humour\\w*', 'flavour\\w*', 'neighbour\\w*', 'labour\\w*', 'rumour\\w*',
			'centres?', 'centred', 'centring', 'metres?', 'litres?', 'theatres?', 'fibres?', 'calibres?',
			'licences?', 'licencing', 'defence\\w*', 'offence\\w*', 'pretence', 'catalogue[sd]?', 'dialogues?', 'analogues?', 'programmes?',
			'grey\\w*', 'artefacts?', 'judgement\\w*', 'ageing', 'sceptic\\w*', 'whilst', 'amongst', 'learnt', 'spelt', 'fulfil', 'enrol', 'cheques?', 'tyres?', 'plough\\w*', 'mould\\w*',
			'cancell(?:ed|ing|ation)', 'labell(?:ed|ing)', 'modell(?:ed|ing)', 'travell(?:ed|ing|er|ers)', 'signall(?:ed|ing)', 'fuell(?:ed|ing)', 'levell(?:ed|ing)',
			'(?:organ|recogn|real|summar|custom|optim|initial|normal|local|person|priorit|visual|util|standard|memor|special|general|serial|final|apolog|critic|categor|capital|author|synchron|minim|maxim|monet|digit|sanit|stabil|character|mobil|neutral|legal|modern|commercial|item|jeopard|fertil|hospital|colon|ration|emphas|itemi|harmon|fantas|theor|sympath|vandal|burglar|privat|publicis|globalis|industrial|memoris|familiar|centralis|decentral|pasteur|equal|tokenis|containeris|virtualis|parameteris|generalis|randomis|sanitis|prioritis|minimis|maximis|finalis|materialis|capitalis)is(?:e|es|ed|ing|ation|ations|er|ers)',
			'analys(?:e|es|ed|ing)', 'paralys(?:e|ed|ing)'
		].join('|') +
		')\\b',
	'gi'
);

/** The British spellings in a text. */
export function britishSpellings(text: string): string[] {
	return [...text.matchAll(BRITISH)].map((m) => m[0]);
}

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
		test(`${lesson.id}: American spelling`, () => expect(britishSpellings(prose)).toEqual([]));
		test(`${lesson.id}: no dash in a sentence`, () => expect(prose.split('\n').filter((l) => / [—–] /.test(l))).toEqual([]));
	}
});
