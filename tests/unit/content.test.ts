// The content's own checks (spec §5 step 4): the graph is sound, and every practice step's
// reference solution passes its checks while its starter fails at least one, for the default
// persona and for every other project template, so the checks hold for anyone's project.
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { loadContent } from '#lib/content/load.ts';
import { buildSrcdoc } from '#lib/practice/sandbox.ts';
import { evaluate, facts } from '#lib/practice/checks.ts';
import { render, TEMPLATES } from '#lib/persona/render.ts';
import type { PracticeFiles } from '#lib/content/schema.ts';

const content = loadContent();

// One window for the whole file, its document rewritten per run: every `new JSDOM` leaves about 2 MB behind that
// not even window.close() frees, so a window per run (1200 runs, and growing with every lesson)
// outgrew Node's default heap and the worker died with SIGABRT.
const win = new JSDOM('').window;

function run(files: PracticeFiles, checks: Parameters<typeof evaluate>[2], persona: Record<string, unknown>) {
	const rendered = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, render(v ?? '', persona)])) as PracticeFiles;
	win.document.open();
	win.document.write(buildSrcdoc(rendered, checks, persona));
	win.document.close();
	return evaluate(win.document, win as unknown as Window, checks, facts(checks, persona));
}

describe('content', () => {
	it('has lessons, and a sound concept graph', () => {
		expect(content.lessons.length).toBeGreaterThan(0);
		expect(content.graph.errors).toEqual([]);
	});

	for (const lesson of content.lessons.filter((l) => l.practice)) {
		const step = lesson.practice!;
		for (const [kind, persona] of Object.entries(TEMPLATES))
			it(`${lesson.id}: the solution passes and the starter fails (${kind})`, () => {
				const p = persona as unknown as Record<string, unknown>;
				const good = run(step.solution, step.checks, p);
				expect(good.filter((r) => !r.ok)).toEqual([]);
				const bad = run(step.files, step.checks, p);
				expect(bad.some((r) => !r.ok)).toBe(true);
			});
	}

	it('every card id is unique across the course', () => {
		const ids = content.lessons.flatMap((l) => l.cards.map((c) => c.id));
		expect(new Set(ids).size).toBe(ids.length);
	});
});
