// The course's house style, checked so the next lesson keeps it (docs/qa-2026-10-28.md):
// - ё where it belongs, because narration is synthesised from the text and reads «е» as «е»;
//   eyo-kernel's safe dictionary only (its unsafe list, все/всё and the like, needs a reader);
// - no dash in a sentence («Интернет это дороги», hallmark 19); a definition starts with
//   «Термин — …» by its own rule, a source's title is the source's, and a quotation keeps its own;
// - one spelling for one thing: the variants the QA pass of 28.10.2026 replaced.
// Prose is the lesson body outside code, inline code and tags, and the metadata's words: not
// practice files, solutions or checks (code, with regexes that list both spellings on
// purpose), not sources or videos (their own titles), not the pronunciation map.
import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { Eyo, safeDictionary } from 'eyo-kernel';
import { loadContent } from '#lib/content/load.ts';

const eyo = new Eyo();
eyo.dictionary.set(safeDictionary);
// names the dictionary takes for words: Martijn Koster is Костер, not a bonfire
const NAMES = new Set(['Костер']);

function body(file: string): string {
	// the body follows the module and instance scripts, each closed by a `</script>` at the start
	// of a line (a code sample in the body may hold one too, indented or fenced)
	let prose = readFileSync(file, 'utf8');
	for (let m; (m = /^\s*<script[^>]*>[\s\S]*?^<\/script>$/m.exec(prose)) && m.index === prose.search(/\S/); )
		prose = prose.slice(m.index + m[0].length);
	return prose
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`\n]*`/g, ' ')
		.replace(/<[^>\n]+>/g, ' ')
		.replace(/\]\([^)]*\)/g, ']');
}

const SKIP = /^(practice\.(files|solution|checks)|sources|videos|say|id$|definition$)/;
function words(value: unknown, path = ''): string[] {
	if (SKIP.test(path)) return [];
	if (typeof value === 'string') return [value];
	if (Array.isArray(value)) return value.flatMap((v, i) => words(v, path ? `${path}.${i}` : String(i)));
	if (value && typeof value === 'object')
		return Object.entries(value).flatMap(([k, v]) => words(v, path ? `${path}.${k}` : k));
	return [];
}

const VARIANTS: [RegExp, string][] = [
	[/(?<![А-Яа-яЁё])[Хх]эш/, 'хеш'],
	[/(?<![А-Яа-яЁё])кеш/, 'кэш'],
	[/оффлайн/, 'офлайн'],
	[/Тильд/, 'Tilda'],
	[/Яндекс\.Метрик/, 'Яндекс Метрика'],
	[/Этан Маркотт/, 'Итан Маркотт'],
	[/\d\.\d к 1/, 'десятичная запятая: 4,5 к 1'],
	[/токен\S* дизайна/, 'дизайн-токены']
];

const content = loadContent();
const files = readdirSync('content/ru', { recursive: true, encoding: 'utf8' })
	.filter((f) => f.endsWith('.svx'))
	.map((f) => `content/ru/${f}`);

describe('house style', () => {
	for (const lesson of content.lessons) {
		const file = files.find((f) => f.endsWith(`${lesson.id}.svx`))!;
		const prose = [body(file), ...words(lesson)].join('\n');
		test(`${lesson.id}: ё where the safe dictionary has it`, () => {
			const missing = eyo
				.lint(prose, true)
				.filter((r) => !NAMES.has(r.before))
				.map((r) => `${r.before} → ${r.after}`);
			expect(missing).toEqual([]);
		});
		test(`${lesson.id}: no dash in a sentence`, () => {
			// a quotation keeps its own punctuation, and a named pair («запрос — процесс») is a name
			const lines = body(file).split('\n').filter((l) => / [—–] /.test(l.replace(/«[^«»]*»/g, '')));
			expect(lines).toEqual([]);
		});
		test(`${lesson.id}: one spelling for one thing`, () => {
			const found = VARIANTS.filter(([re]) => re.test(prose)).map(([re, use]) => `${re.source}: write ${use}`);
			expect(found).toEqual([]);
		});
	}
});
