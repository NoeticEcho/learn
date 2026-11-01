// Эхо on every page (docs/specs/2026-11-01-platform-design.md §5.3): every route the build has gets
// a line of its own, a page says which course it is in, the catalog's answers cover every course,
// and the panel works with no key.
import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pageKind, script, DOCK_WORDS } from '#lib/guide/pages.ts';
import { ANSWERS } from '#lib/guide/choose.ts';
import { loadCourses } from '#lib/courses/load.ts';
import { catalogView, courseView } from '#lib/courses/view.server.ts';
import { loadEdition } from '#lib/content/load.ts';
import en from '#lib/i18n/en.json';
import { registerCatalogue, type Locale } from '#lib/i18n/index.ts';

registerCatalogue('en', en);
const LANGS: Locale[] = ['ru', 'en'];

function routes(dir = 'src/routes', id = ''): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		if (e.isDirectory()) return e.name === '_dev' ? [] : routes(join(dir, e.name), `${id}/${e.name}`);
		return e.name === '+page.svelte' ? [id || '/'] : [];
	});
}

describe('what kind of page it is', () => {
	it('every page route of the build has a kind', () => {
		const all = routes();
		expect(all.length).toBeGreaterThanOrEqual(8);
		for (const r of all) expect(pageKind(r, 200), r).not.toBeNull();
	});
	it('reads the kinds from the routes', () => {
		const k = (r: string, s = 200) => pageKind(`/[[lang=lang]]${r}`, s);
		expect(pageKind('/[[lang=lang]]', 200)).toBe('catalog');
		expect(k('/course/[course]')).toBe('course');
		expect(k('/course/web/prologue')).toBe('prologue');
		expect(k('/lesson/[part]/[lesson]')).toBe('lesson');
		expect(k('/map')).toBe('map');
		expect(k('/review')).toBe('review');
		expect(k('/gallery')).toBe('gallery');
		expect(k('/settings')).toBe('settings');
		expect(k('/map', 500)).toBe('error');
		expect(pageKind(null, 404)).toBe('error');
	});
});

describe.each(LANGS)('the scripted lines (%s)', (lang) => {
	const say = (r: string, data = {}, status = 200) => script(`/[[lang=lang]]${r}`, status, data, lang);
	const webTitle = loadCourses().courses.find((c) => c.id === 'web')!.title[lang];

	it('name the page: each kind of page has its own line, and none is empty', () => {
		const kinds = ['/map', '/review', '/gallery', '/settings', '/course/web/prologue'];
		const lines = kinds.map((r) => say(r).line);
		lines.push(say('', { catalog: catalogView(lang) }).line, say('/map', {}, 404).line, say('/course/[course]', { course: courseView('ai', lang) }).line);
		for (const l of lines) expect(l.length).toBeGreaterThan(30);
		expect(new Set(lines).size).toBe(lines.length);
	});
	it('know which course they are in', () => {
		expect(say('/course/[course]', { course: courseView('ai', lang) })).toMatchObject({ kind: 'course', courseId: 'ai' });
		const ai = courseView('ai', lang)!;
		expect(say('/course/[course]', { course: ai }).line).toContain(ai.title);
		expect(say('/course/[course]', { course: courseView('web', lang) })).toMatchObject({ courseId: 'web' });
		expect(say('/course/[course]', { course: courseView('web', lang) }).line).toContain(webTitle);
		expect(say('/map').line).toContain(webTitle);
		expect(say('/review').courseId).toBeNull();
	});
	it('on a lesson use the lesson’s own line, after saying where it is', () => {
		const { lessons, curriculum } = loadEdition(lang);
		const l = lessons[0];
		const s = say('/lesson/[part]/[lesson]', { lesson: l, part: curriculum.parts[0] });
		expect(s.courseId).toBe('web');
		expect(s.line).toContain(l.guide.intro);
		expect(s.line).toContain(webTitle);
		expect(s.line).toContain(curriculum.parts[0].title);
	});
	it('model mode is told the page’s own words: the catalog’s courses, a course’s table of contents', () => {
		const cat = say('', { catalog: catalogView(lang) }).context.text;
		expect(cat).toContain(loadCourses().courses[1].title[lang]);
		const toc = say('/course/[course]', { course: courseView('ai', lang) }).context.text;
		expect(toc).toContain((courseView('ai', lang) as { parts: { lessons: { title: string }[] }[] }).parts[0].lessons[0].title);
	});
	it('a 404 says so, and the error mood is hmm', () => {
		expect(say('/map', {}, 404)).toMatchObject({ kind: 'error', mood: 'hmm' });
		expect(script(null, 404, {}, lang).kind).toBe('error');
	});
	it('the panel’s own words have both languages', () => {
		for (const w of Object.values(DOCK_WORDS)) expect(w[lang].length).toBeGreaterThan(1);
	});
});

describe('choosing a course', () => {
	const ids = loadCourses().courses.map((c) => c.id);
	it('every course answers something, and every answer names real courses', () => {
		const named = new Set(ANSWERS.flatMap((a) => a.courses));
		expect([...ids].filter((id) => !named.has(id))).toEqual([]);
		for (const a of ANSWERS) for (const id of a.courses) expect(ids, a.id).toContain(id);
	});
	it('each answer has both languages and a unique id', () => {
		expect(new Set(ANSWERS.map((a) => a.id)).size).toBe(ANSWERS.length);
		for (const a of ANSWERS) {
			expect(a.q.ru).toMatch(/[а-яё]/i);
			expect(a.q.en).not.toMatch(/[а-яё"']/i);
		}
	});
});
