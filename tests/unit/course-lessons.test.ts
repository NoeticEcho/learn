// A new course's lessons (docs/specs/2026-11-01-platform-design.md §5.4): their files, the mirror
// checks between the editions and against the course file, their addresses, their narration key,
// what Эхо says on their page, and where «Дальше» leads.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadCourses } from '#lib/courses/load.ts';
import { loadCourseLessons, validateCourseLessons } from '#lib/courses/lessons.ts';
import { courseOf, lessonFile } from '#lib/courses/types.ts';
import { catalogView, courseLessonView, courseView, openMinutes } from '#lib/courses/view.server.ts';
import { at } from '#lib/seo/site.ts';
import { match, narration, script, type Manifest } from '#lib/narration/narration.server.ts';
import { pageKind, script as dock } from '#lib/guide/pages.ts';
import { counterpart } from '#lib/links.ts';
import { loadContent } from '#lib/content/load.ts';
import en from '#lib/i18n/en.json';
import { registerCatalogue } from '#lib/i18n/index.ts';

registerCatalogue('en', en);

const ID = 'ai/symbols/turing-question';
const entries = loadCourseLessons();

describe('the lessons as written', () => {
	it('are the AI course’s first three, in the course’s order, each in both editions', () => {
		expect(entries.map((e) => e.id)).toEqual(['ai/symbols/turing-question', 'ai/symbols/dartmouth', 'ai/symbols/logic-theorist']);
		for (const e of entries) {
			expect(e).toMatchObject({ course: 'ai', part: 'symbols', partNumber: 1, published: '2026-11-10' });
			expect(courseOf(e.id)).toBe('ai');
			for (const lang of ['ru', 'en'] as const) expect(e.meta[lang].id).toBe(e.id);
		}
		expect(entries.map((e) => e.order)).toEqual([1, 2, 3]);
	});
	it('live where the id says, outside the web course’s globs', () => {
		expect(lessonFile(ID, 'ru')).toBe('content/courses/ai/ru/symbols/turing-question.svx');
		expect(lessonFile(ID, 'en')).toBe('content/courses/ai/en/symbols/turing-question.svx');
		expect(lessonFile('02-html/01-first-page', 'en')).toBe('content/en/02-html/01-first-page.svx');
		for (const e of entries) for (const lang of ['ru', 'en'] as const) expect(() => readFileSync(lessonFile(e.id, lang))).not.toThrow();
	});
	it('take no card id the web course has: review keys a card by its id alone', () => {
		const web = new Set(loadContent().lessons.flatMap((l) => l.cards.map((c) => c.id)));
		for (const e of entries) for (const c of e.meta.ru.cards) expect(web.has(c.id), c.id).toBe(false);
	});
});

describe('the mirror checks', () => {
	const { courses } = loadCourses();
	const read = (lang: 'ru' | 'en') => `/${lessonFile(ID, lang)}`;
	const meta = (lang: 'ru' | 'en') => entries[0].meta[lang];
	const raw = { [read('ru')]: readFileSync(lessonFile(ID, 'ru'), 'utf8'), [read('en')]: readFileSync(lessonFile(ID, 'en'), 'utf8') };
	// a catalog in which only the first lesson is open, so the others' missing bodies do not count
	const one = structuredClone(courses).map((c) => {
		if ('parts' in c) for (const p of c.parts) for (const l of p.lessons) if (`${c.id}/${p.id}/${l.id}` !== ID) Object.assign(l, { status: 'planned', published: undefined });
		return c;
	});
	const problems = (modules: Record<string, { metadata?: unknown }>, r = raw, cs = one, cards = new Map<string, string>()) => {
		try {
			validateCourseLessons(modules, r, { courses: cs }, cards);
			return [];
		} catch (e) {
			return (e as { problems: string[] }).problems;
		}
	};
	const both = () => ({ [read('ru')]: { metadata: structuredClone(meta('ru')) }, [read('en')]: { metadata: structuredClone(meta('en')) } });

	it('pass on the lesson as it is', () => expect(problems(both())).toEqual([]));
	it('refuse an open lesson with one edition only', () => {
		const m = both();
		delete m[read('en')];
		expect(problems(m)).toEqual([expect.stringContaining('is open and has no body content/courses/ai/en/symbols/turing-question.svx')]);
	});
	it('refuse a body for a planned lesson', () => {
		const planned = structuredClone(one).map((c) => {
			if ('parts' in c) for (const p of c.parts) for (const l of p.lessons) Object.assign(l, { status: 'planned', published: undefined });
			return c;
		});
		expect(problems(both(), raw, planned).join('\n')).toMatch(/is planned in content\/courses\/ai\.yaml; a planned lesson has no page/);
	});
	it('refuse a title that is not the course file’s, and an id that is not the path', () => {
		const m = both();
		(m[read('en')].metadata as { title: string }).title = 'Can machines think';
		(m[read('ru')].metadata as { id: string }).id = 'ai/symbols/eliza';
		const p = problems(m).join('\n');
		expect(p).toContain("is not the course file's «Can a machine think»");
		expect(p).toContain('id ai/symbols/eliza does not match its path ai/symbols/turing-question');
	});
	it('refuse editions whose cards, sections or diagrams differ', () => {
		const m = both();
		(m[read('en')].metadata as { cards: { id: string }[] }).cards[0].id = 'ai-something-else';
		const r = { ...raw, [read('en')]: raw[read('en')].replace(/\n## [^\n]+\n/, '\n') .replace("import ImitationGame from '../../../../diagrams/ImitationGame.svelte';", '') };
		const p = problems(m, r).join('\n');
		expect(p).toMatch(/card ids are .*the Russian lesson's are/);
		expect(p).toMatch(/6 sections, the Russian lesson has 7/);
		expect(p).toMatch(/diagrams \[\], the Russian lesson's are \["ImitationGame"\]/);
	});
	it('refuse a card id another lesson already took, and a key only a web lesson has', () => {
		expect(problems(both(), raw, one, new Map([['ai-imitation-game', '02-html/01-first-page']]))).toEqual([expect.stringContaining('card id ai-imitation-game is already 02-html/01-first-page')]);
		const m = both();
		(m[read('ru')].metadata as Record<string, unknown>).teaches = ['x'];
		expect(problems(m).join('\n')).toMatch(/Unrecognized key/);
	});
	it('refuse a body in no edition, or at a path that is not a lesson’s', () => {
		const p = problems({ ...both(), '/content/courses/ai/de/symbols/turing-question.svx': { metadata: meta('ru') }, '/content/courses/ai/turing.svx': { metadata: meta('ru') } });
		expect(p).toEqual([expect.stringContaining('no edition de'), expect.stringContaining('a lesson lives at content/courses/<course>/<lang>/<part>/<lesson>.svx')]);
	});
});

describe('a lesson’s place and its next lesson', () => {
	it('names the course and the part, and links the next lesson while it is open', () => {
		const v = courseLessonView(ID, 'ru')!;
		expect(v.nav).toMatchObject({ id: 'ai', title: 'ИИ: от символов до агентов', place: 'Часть 1, урок 1', part: { id: 'symbols', number: 1 } });
		expect(v.nav.next).toEqual({ id: 'ai/symbols/dartmouth', title: 'Дартмут, 1956: у науки появляется имя', open: true });
		expect(courseLessonView('ai/symbols/logic-theorist', 'en')!.nav.next).toMatchObject({ id: 'ai/symbols/blocks-world', open: false });
		expect(courseLessonView('ai/symbols/blocks-world', 'ru')).toBeUndefined();
	});
	it('a course with open lessons has their minutes as its workload, and says how many are open', () => {
		expect(openMinutes('ai')).toBe(entries.reduce((n, e) => n + e.meta.ru.minutes, 0));
		const ai = courseView('ai', 'en')!;
		expect(ai).toMatchObject({ kind: 'planned', open: 3 });
		expect(catalogView('ru').strands.flatMap((s) => s.courses).find((c) => c.id === 'ai')).toMatchObject({ open: 3, state: 'partly' });
	});
});

describe('addresses', () => {
	it('a three-segment id is a page below its course’s, in both editions', () => {
		expect(at.lesson(ID)).toBe('https://open.noeticecho.space/learn/course/ai/symbols/turing-question/');
		expect(at.lesson(ID, 'en')).toBe('https://open.noeticecho.space/learn/en/course/ai/symbols/turing-question/');
		expect(at.lesson('02-html/01-first-page')).toBe('https://open.noeticecho.space/learn/lesson/02-html/01-first-page/');
	});
	it('the language switch goes to the same lesson in the other edition', () => {
		expect(counterpart('/course/ai/symbols/turing-question/', 'en')).toMatch(/en\/course\/ai\/symbols\/turing-question\/$/);
		expect(counterpart('/course/ai/', 'en')).toMatch(/en\/course\/ai\/$/);
	});
});

describe('narration', () => {
	it('reads the lesson’s own file, keyed by the three-segment id, and offers nothing until it is rendered', () => {
		for (const lang of ['ru', 'en'] as const) {
			const lesson = entries[0].meta[lang];
			const sections = script(lesson, lang)!;
			expect(sections.length).toBe(8); // the intro and seven sections
			expect(narration(lesson, lang)).toBeNull();
			const m: Manifest = {
				version: 1,
				voice: {},
				base: 'https://example.org/',
				lessons: { [ID]: { sections: sections.map((s, i) => ({ key: s.key, hash: s.hash, file: `${i}.opus`, duration: 10 })) } }
			};
			expect(match(ID, sections, m)).toMatchObject({ duration: sections.length * 10 });
		}
	});
});

describe('Эхо on a new course’s pages', () => {
	const route = '/[[lang=lang]]/course/[course]/[part]/[lesson]';
	it('a lesson of another course is a lesson, and Эхо names its course and part, then says its intro', () => {
		expect(pageKind(route, 200)).toBe('lesson');
		const v = courseLessonView(ID, 'en')!;
		const s = dock(route, 200, { lesson: v.lesson, course: v.nav }, 'en');
		expect(s).toMatchObject({ kind: 'lesson', courseId: 'ai' });
		expect(s.line).toContain('AI: from symbols to agents');
		expect(s.line).toContain(v.lesson.guide.intro);
	});
	it('a course with open lessons is not called a table of contents only, and the catalog names it', () => {
		const ru = dock('/[[lang=lang]]/course/[course]', 200, { course: courseView('ai', 'ru') }, 'ru');
		expect(ru.line).not.toMatch(/только оглавление/);
		expect(ru.line).toContain('Открыто 3 из');
		expect(ru.links[0].label).toBe('Может ли машина мыслить');
		expect(dock('/[[lang=lang]]', 200, { catalog: catalogView('en') }, 'en').line).toContain('Lessons are already coming out in “AI: from symbols to agents”');
		// a course with nothing open keeps its line
		expect(dock('/[[lang=lang]]/course/[course]', 200, { course: courseView('money', 'ru') }, 'ru').line).toMatch(/только оглавление/);
	});
});
