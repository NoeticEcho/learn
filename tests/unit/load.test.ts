import { describe, it, expect } from 'vitest';
import { validate, ContentError } from '#lib/content/load.ts';
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

describe('loadContent', () => {
	it('reads the real curriculum: all 17 parts, in order', async () => {
		const { loadContent } = await import('#lib/content/load.ts');
		const { curriculum } = loadContent();
		expect(curriculum.parts.map((p) => p.number)).toEqual([...Array(17).keys()]);
	});
});
