import { describe, it, expect } from 'vitest';
import { validate, ContentError, practiceProblems } from '#lib/content/load.ts';
import type { LessonMeta } from '#lib/content/schema.ts';
import { validLesson } from '../fixtures/lesson.valid';

const yaml = `
parts:
  - { number: 2, slug: 02-html, title: HTML, summary: s }
concepts:
  - { id: html-tag, title: Тег, part: 2 }
`;
const file = '/content/ru/02-html/01-first-page.svx';

describe('validate', () => {
	it('accepts a valid lesson and curriculum', () => {
		const c = validate({ [file]: { metadata: validLesson } }, yaml);
		expect(c.lessons.map((l) => l.id)).toEqual(['02-html/01-first-page']);
		expect(c.graph.errors).toEqual([]);
	});
	it('reports every broken lesson at once, with its file', () => {
		const bad = { ...validLesson, quiz: [] };
		try {
			validate({ [file]: { metadata: bad }, '/content/ru/02-html/02-x.svx': { metadata: {} } }, yaml);
			expect.unreachable();
		} catch (e) {
			expect(e).toBeInstanceOf(ContentError);
			const p = (e as ContentError).problems.join('\n');
			expect(p).toMatch(/01-first-page\.svx: quiz/);
			expect(p).toMatch(/02-x\.svx/);
		}
	});
	it('refuses an id that does not match the path', () =>
		expect(() => validate({ '/content/ru/02-html/09-other.svx': { metadata: validLesson } }, yaml)).toThrow(/does not match/));
});

describe('practice steps across lessons', () => {
	const lesson = (order: number, id: string, era: number, continues?: string) =>
		({ ...validLesson, id: `02-html/0${order}-x`, order, practice: { ...validLesson.practice!, id, era, continues } }) as LessonMeta;
	it('a step id is unique across the course, since practice is saved by it', () =>
		expect(practiceProblems([lesson(1, 'page', 1), lesson(2, 'page', 1)]).join()).toMatch(/page is already used/));
	it('continues names an earlier step of the same era', () => {
		expect(practiceProblems([lesson(1, 'a', 1), lesson(2, 'b', 1, 'a')])).toEqual([]);
		expect(practiceProblems([lesson(1, 'a', 1), lesson(2, 'b', 2, 'a')]).join()).toMatch(/not era 2/);
		expect(practiceProblems([lesson(1, 'b', 1, 'a'), lesson(2, 'a', 1)]).join()).toMatch(/no earlier step/);
	});
});

describe('loadContent', () => {
	it('reads the real curriculum: all 17 parts, in order', async () => {
		const { loadContent } = await import('#lib/content/load.ts');
		const { curriculum } = loadContent();
		expect(curriculum.parts.map((p) => p.number)).toEqual([...Array(17).keys()]);
	});
});

describe('the English edition, checked against the Russian one', async () => {
	const { validateEdition } = await import('#lib/content/load.ts');
	const ru = validate({ [file]: { metadata: validLesson } }, yaml);
	const words = `
parts:
  02-html: { title: HTML, summary: 'The document and its tags.' }
concepts:
  html-tag: Tag and element
`;
	const enFile = '/content/en/02-html/01-first-page.svx';
	const english = {
		...validLesson,
		title: 'A first page',
		definition: 'HTML is a markup language: its tags tell a browser where a heading, a paragraph and a link are.',
		sources: validLesson.sources.map((s, i) => (i === 0 ? { ...s, lang: 'en' as const } : s))
	};
	const problems = (meta: unknown, w = words) => {
		try {
			validateEdition({ [enFile]: { metadata: meta } }, w, ru);
			return '';
		} catch (e) {
			return (e as ContentError).problems.join('\n');
		}
	};

	it('accepts a translation, and names what is not translated yet', () => {
		const e = validateEdition({ [enFile]: { metadata: english } }, words, ru);
		expect(e.lessons.map((l) => l.title)).toEqual(['A first page']);
		expect(e.curriculum.concepts[0].title).toBe('Tag and element');
		expect(validateEdition({}, words, ru).missing).toEqual(['02-html/01-first-page']);
	});
	it('keeps what progress is keyed by: the step id, its check ids, the card ids', () => {
		expect(problems({ ...english, practice: { ...english.practice, id: 'other' } })).toMatch(/practice is/);
		expect(problems({ ...english, guide: { ...english.guide, mistakes: {} }, practice: { ...english.practice, checks: [{ id: 'heading', kind: 'exists', selector: 'h1' }] } })).toMatch(/check ids/);
		expect(problems({ ...english, cards: english.cards.map((c, i) => (i ? c : { ...c, id: 'renamed' })) })).toMatch(/card ids/);
	});
	it('keeps the graph: the same concepts, taught and required, and the same place', () => {
		expect(problems({ ...english, requires: ['html-tag'] })).toMatch(/requires/);
		expect(problems({ ...english, order: 2 })).toMatch(/order/);
	});
	it('needs an English definition, an English source, a Russian original and every title', () => {
		expect(problems(english)).toBe('');
		expect(problems({ ...english, definition: 'Your page is HTML: tags tell a browser where the heading and the link are.' })).toMatch(/you/);
		expect(problems({ ...english, sources: validLesson.sources.map((s) => ({ ...s, lang: 'ru' as const })) })).toMatch(/no source in en/);
		expect(problems({ ...english, id: '02-html/09-other' })).toMatch(/does not match/);
		expect(problems(english, words.replace('  html-tag: Tag and element\n', ''))).toMatch(/no title for concept html-tag/);
	});
});

describe('loadEdition', () => {
	it('reads the real English edition: every part and concept titled, lessons a subset of the Russian', async () => {
		const { loadContent, loadEdition } = await import('#lib/content/load.ts');
		const ru = loadContent();
		const en = loadEdition('en');
		expect(en.curriculum.parts.map((p) => p.slug)).toEqual(ru.curriculum.parts.map((p) => p.slug));
		expect(en.lessons.length + en.missing.length).toBe(ru.lessons.length);
		expect(en.lessons.map((l) => l.id)).toContain('00-start/01-how-to-learn');
	});
});
