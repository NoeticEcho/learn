// The catalog's content (docs/specs/2026-11-01-platform-design.md §4, §7): the schema's rules, on
// bad input and on the real files, and the house style of both languages.
import { describe, expect, it, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { Eyo, safeDictionary } from 'eyo-kernel';
import { parse } from 'yaml';
import { isPlanned, validateCourses, CoursesError, type PlannedCourse } from '#lib/courses/schema.ts';
import { loadCourses } from '#lib/courses/load.ts';
import { NAMES, britishSpellings, notSentenceCase } from './style-en-helpers.ts';

// Names a course's heading carries; one per line, added as a course needs them.
for (const n of readFileSync('tests/fixtures/course-names.txt', 'utf8').split('\n')) if (n.trim()) NAMES.add(n.trim());

const w = (s: string) => ({ ru: s, en: s });
const sentence = 'A sentence that is long enough to count as one.';
const lesson = (id: string, extra = {}) => ({ id, title: { ru: `Урок ${id}`, en: `Lesson ${id}` }, summary: w(sentence), ...extra });
const course = (id: string, lessons: object[], extra = {}) => ({
	id,
	history: false,
	title: w(id.toUpperCase()),
	tagline: w('A tagline that is long enough for a catalog row and a description.'),
	about: w(sentence),
	parts: [{ id: 'one', title: w('One'), summary: w(sentence), lessons }, { id: 'two', title: w('Two'), summary: w(sentence), lessons: [lesson(`${id}-x`), lesson(`${id}-y`)] }],
	...extra
});
const web = { id: 'web', source: 'curriculum', title: w('Web'), tagline: w('A tagline that is long enough for a catalog row and a description.'), about: w(sentence) };

/** A valid catalog of `n` courses, with one course changed by `edit`. */
function catalog(n = 15, edit: (files: Record<string, object>) => void = () => {}) {
	const ids = ['web', 'ai', ...Array.from({ length: n - 2 }, (_, i) => `c${i}`)];
	const files: Record<string, object> = {};
	for (const id of ids) files[id] = id === 'web' ? web : course(id, [lesson(`${id}-a`), lesson(`${id}-b`)]);
	edit(files);
	return { index: { strands: [{ id: 'a', title: w('Aa'), short: w('Aa'), summary: w(sentence), courses: ids.slice(0, 2) }, { id: 'b', title: w('Bb'), short: w('Bb'), summary: w(sentence), courses: ids.slice(2) }] }, files };
}
const problems = (c: ReturnType<typeof catalog>) => {
	try {
		validateCourses(c.index, c.files);
		return [];
	} catch (e) {
		if (e instanceof CoursesError) return e.problems;
		throw e;
	}
};

describe('the schema refuses', () => {
	it('nothing in a valid catalog', () => expect(problems(catalog())).toEqual([]));
	it('a line in one language only', () => {
		const c = catalog(15, (f) => delete ((f.ai as PlannedCourse).parts[0].lessons[0].title as { en?: string }).en);
		expect(problems(c).join()).toMatch(/ai\.yaml.*title\.en/);
	});
	it('a lesson id used twice in a course', () => {
		const c = catalog(15, (f) => (f.ai = course('ai', [lesson('same'), { ...lesson('same'), title: w('Другой') }])));
		expect(problems(c).join()).toMatch(/lesson id same is used twice/);
	});
	it('a lesson title used twice in the catalog', () => {
		const c = catalog(15, (f) => (f.ai = course('ai', [lesson('a1', { title: w('Один') }), lesson('a2')]), (f.c0 = course('c0', [lesson('b1', { title: w('один') }), lesson('b2')]))));
		expect(problems(c).join()).toMatch(/title is also ai\/a1/);
	});
	it('a course file not in the index, and a listed course with no file', () => {
		const c = catalog(15, (f) => (f.stray = course('stray', [lesson('s1'), lesson('s2')])));
		expect(problems(c).join()).toMatch(/stray\.yaml: not in index/);
		const d = catalog();
		delete d.files.c0;
		expect(problems(d).join()).toMatch(/no file content\/courses\/c0\.yaml/);
	});
	it('too few or too many courses', () => {
		expect(problems(catalog(14)).join()).toMatch(/14 courses/);
		expect(problems(catalog(29)).join()).toMatch(/29 courses/);
		expect(problems(catalog(28))).toEqual([]);
	});
	it('web anywhere but first, and ai anywhere but second', () => {
		const c = catalog();
		c.index.strands[0].courses.reverse();
		expect(problems(c).join()).toMatch(/web course must be first/);
		expect(problems(c).join()).toMatch(/AI course must be second/);
	});
	it('a history with no look ahead at its end, and a look ahead anywhere but the end', () => {
		const a = catalog(15, (f) => (f.ai = course('ai', [lesson('a'), lesson('b')], { history: true })));
		expect(problems(a).join()).toMatch(/does not look ahead/);
		const b = catalog(15, (f) => (f.ai = course('ai', [lesson('a', { ahead: true }), lesson('b')])));
		expect(problems(b).join()).toMatch(/looks ahead and is not the last/);
	});
	it('an open lesson with no date', () => {
		const c = catalog(15, (f) => (f.ai = course('ai', [lesson('a', { status: 'open' }), lesson('b')])));
		expect(problems(c).join()).toMatch(/open and has no published date/);
	});
	it('a part id used twice', () => {
		const c = catalog(15, (f) => ((f.ai as PlannedCourse).parts[1].id = 'one'));
		expect(problems(c).join()).toMatch(/part id one is used twice/);
	});
});

const { strands, courses } = loadCourses();
const planned = courses.filter(isPlanned);
const eyo = new Eyo();
eyo.dictionary.set(safeDictionary);

/** Every line of a course, per language, with where it is. */
function lines(c: (typeof courses)[number], l: 'ru' | 'en'): { at: string; text: string; heading?: boolean }[] {
	const out = [
		{ at: 'title', text: c.title[l], heading: true },
		{ at: 'tagline', text: c.tagline[l] },
		{ at: 'about', text: c.about[l] }
	];
	if (isPlanned(c))
		for (const p of c.parts) {
			out.push({ at: `${p.id}.title`, text: p.title[l], heading: true }, { at: `${p.id}.summary`, text: p.summary[l] });
			for (const x of p.lessons) out.push({ at: `${p.id}/${x.id}.title`, text: x.title[l], heading: true }, { at: `${p.id}/${x.id}.summary`, text: x.summary[l] });
		}
	return out;
}

// Project names the glossary does not have as settled, and any expansion of NSL (K3-NSL-01 is open).
const UNSETTLED = /\bKNS\b|K\.N\.S|\bKira\b|Кира\b|Ordo Noetica|Noetic Self|Noetic (?:Semantic|Singularity|State) Language/;
// Esoteric words the owner ruled out, and words a promise or a therapy would use.
const ESOTERIC = /эзотери|чакр|вибрац|пробужден|просветлен|\benlighten|\bawaken|\bchakra|\bvibration/i;
const PROMISE = /вы станете|гарантиру|исцел|излеч|you will become|guarantee|\bcures?\b|\bheal(s|ing)?\b/i;

describe('the catalog as written', () => {
	it('has 15 to 28 courses, web first and ai second, each in one strand', () => {
		const ids = strands.flatMap((s) => s.courses);
		expect(ids.length).toBeGreaterThanOrEqual(15);
		expect(ids.length).toBeLessThanOrEqual(28);
		expect(ids.slice(0, 2)).toEqual(['web', 'ai']);
		expect(new Set(ids).size).toBe(ids.length);
	});
	it('every file in content/courses is read', () => {
		const names = readdirSync('content/courses').filter((f) => f.endsWith('.yaml')).map((f) => f.slice(0, -5));
		expect(names.toSorted()).toEqual([...courses.map((c) => c.id), 'index', 'news'].toSorted());
	});
	it('every course that tells a history ends looking ahead', () => {
		for (const c of planned) if (c.history) expect(c.parts.at(-1)!.lessons.at(-1)!.ahead, c.id).toBe(true);
	});
	it('the open lessons are the AI course’s first part, published on 10 November 2026; every other lesson is planned', () => {
		const open = planned.flatMap((c) => c.parts.flatMap((p) => p.lessons.filter((l) => l.status === 'open').map((l) => `${c.id}/${p.id}/${l.id}@${l.published}`)));
		expect(open).toEqual(['turing-question', 'dartmouth', 'logic-theorist', 'blocks-world', 'expert-systems', 'winters'].map((l) => `ai/symbols/${l}@2026-11-10`));
	});
	it('the AI course names what the owner listed, and the Noetic Singularity course says what it is', () => {
		const ai = JSON.stringify(parse(readFileSync('content/courses/ai.yaml', 'utf8')));
		for (const word of ['A.L.I.C.E.', 'ELIZA', 'Attention Is All You Need', 'Vaswani', '2017', 'GPT', 'AGI', 'ASI', 'Алис']) expect(ai, word).toContain(word);
		const n = planned.find((c) => c.id === 'noetic-singularity')!;
		const text = lines(n, 'ru').map((x) => x.text).join(' ');
		expect(text).toMatch(/цель/i);
		expect(text).toMatch(/гипотез|ставк/i);
		expect(lines(n, 'en').map((x) => x.text).join(' ')).toMatch(/\baim\b.*|\bbet\b|hypothesis/i);
	});
	it('a project name is used only if the glossary has it as settled', () => {
		// the course files, and the lessons' bodies below them
		const files = readdirSync('content/courses', { recursive: true, encoding: 'utf8' }).filter((f) => /\.(yaml|svx)$/.test(f));
		expect(files.some((f) => f.endsWith('.svx'))).toBe(true);
		for (const f of files) expect(readFileSync(`content/courses/${f}`, 'utf8'), f).not.toMatch(UNSETTLED);
	});
	it('uses no esoteric words and makes no promise of what a person becomes', () => {
		for (const c of courses)
			for (const l of ['ru', 'en'] as const)
				for (const x of lines(c, l)) {
					expect(x.text, `${c.id} ${x.at}`).not.toMatch(ESOTERIC);
					expect(x.text, `${c.id} ${x.at}`).not.toMatch(PROMISE);
				}
	});
});

describe.each(courses.map((c) => [c.id, c] as const))('%s: house style', (id, c) => {
	const ru = lines(c, 'ru');
	const en = lines(c, 'en');
	test('ё where the safe dictionary has it', () => {
		expect(eyo.lint(ru.map((x) => x.text).join('\n'), true).map((r) => `${r.before} → ${r.after}`)).toEqual([]);
	});
	test('no dash in a sentence', () => {
		for (const x of [...ru, ...en]) expect(x.text.replace(/«[^«»]*»|“[^“”]*”/g, ''), `${id} ${x.at}`).not.toMatch(/ [—–] /);
	});
	test('Russian has Cyrillic, English none', () => {
		for (const x of en) expect(x.text, `${id} ${x.at}`).not.toMatch(/[А-Яа-яЁё]/);
		// a name stays in its own alphabet («Attention Is All You Need», «GPT, GPT-2, GPT-3»), and a title may be only that
		for (const x of ru.filter((x) => !x.heading)) expect(x.text, `${id} ${x.at}`).toMatch(/[А-Яа-яЁё]/);
	});
	test('English: American spelling, typographic quotes', () => {
		for (const x of en) {
			// American English writes «dialogue» for a conversation; the lessons' list refuses it for the sake of `<dialog>`.
			expect(britishSpellings(x.text.replace(/\bdialogues?\b/gi, '')), `${id} ${x.at}`).toEqual([]);
			expect(x.text, `${id} ${x.at}`).not.toMatch(/["']/);
		}
	});
	test('English: headings in sentence case', () => {
		for (const x of en.filter((x) => x.heading && x.at !== 'title')) expect(notSentenceCase(x.text), `${id} ${x.at}: ${x.text}`).toEqual([]);
	});
});
