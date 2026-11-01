// Checks one course's file by itself, for a person writing it while the catalog is incomplete:
// COURSE=<id> npx vitest run tests/unit/courses-one.test.ts. Without COURSE it is skipped; the whole
// catalog is courses.test.ts.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Eyo, safeDictionary } from 'eyo-kernel';
import { parse } from 'yaml';
import { PlannedCourse } from '#lib/courses/schema.ts';
import { NAMES, britishSpellings, notSentenceCase } from './style-en-helpers.ts';

for (const n of readFileSync('tests/fixtures/course-names.txt', 'utf8').split('\n')) if (n.trim()) NAMES.add(n.trim());
const id = process.env.COURSE;
const eyo = new Eyo();
eyo.dictionary.set(safeDictionary);

describe.skipIf(!id)(`course ${id}`, () => {
	const raw = id ? parse(readFileSync(`content/courses/${id}.yaml`, 'utf8')) : null;
	it('fits the schema, with every id once and the last lesson looking ahead', () => {
		const r = PlannedCourse.safeParse(raw);
		expect(r.error?.issues.map((i) => `${i.path.join('.')}: ${i.message}`) ?? []).toEqual([]);
		const all = r.data!.parts.flatMap((p) => p.lessons);
		expect(new Set(all.map((l) => l.id)).size).toBe(all.length);
		expect(all.at(-1)!.ahead).toBe(true);
		expect(all.length).toBeGreaterThanOrEqual(10);
	});
	it('keeps the house style', () => {
		const c = PlannedCourse.parse(raw);
		const walk = (l: 'ru' | 'en') => [
			[c.title[l], 0], [c.tagline[l], 1], [c.about[l], 1],
			...c.parts.flatMap((p) => [[p.title[l], 1], [p.summary[l], 1], ...p.lessons.flatMap((x) => [[x.title[l], 1], [x.summary[l], 1]])])
		] as [string, number][];
		const ru = walk('ru').map((x) => x[0]);
		const en = walk('en');
		expect(eyo.lint(ru.join('\n'), true).map((r) => `${r.before} → ${r.after}`)).toEqual([]);
		for (const t of [...ru, ...en.map((x) => x[0])]) expect(t.replace(/«[^«»]*»|“[^“”]*”/g, '')).not.toMatch(/ [—–] /);
		for (const [t] of en) {
			expect(t).not.toMatch(/[А-Яа-яЁё"']/);
			expect(britishSpellings(t.replace(/\bdialogues?\b/gi, '')), t).toEqual([]);
		}
		for (const p of c.parts) for (const x of [p, ...p.lessons]) expect(notSentenceCase(x.title.en), x.title.en).toEqual([]);
	});
});
