/**
 * The home page is prerendered with its data inline, so every lesson added to the course used to
 * add its summary, minutes, concepts and part text to the first page a person loads. Home needs
 * only: which lesson comes next, its title, and how many there are.
 */
import { it, expect } from 'vitest';
import { load } from '../../src/routes/+page.server.ts';
import { loadContent } from '#lib/content/load.ts';
import { nextLessons } from '#lib/content/graph.ts';
import { nextHome } from '#lib/content/catalogue.ts';

const data = load();

it('carries no lesson summaries, concepts or parts', () => {
	const json = JSON.stringify(data);
	const { lessons, curriculum } = loadContent();
	for (const l of lessons) expect(json).not.toContain(l.summary);
	expect(json).not.toContain(curriculum.parts[0].summary);
	expect(json).not.toMatch(/"teaches"|"requires"|"concepts"|"minutes"/);
});

it('stays small per lesson', () => {
	const per = JSON.stringify(data).length / data.home.lessons.length;
	expect(per).toBeLessThan(140);
});

it('names the same next lesson as the concept graph, at every point of the course', () => {
	const { lessons, graph } = loadContent();
	const order = [...lessons].sort((a, b) => a.part - b.part || a.order - b.order).map((l) => l.id);
	for (let n = 0; n <= order.length; n++) {
		const done = new Set(order.slice(0, n));
		expect(nextHome(data.home.lessons, done)?.id).toBe(nextLessons(graph, done)[0]);
	}
	// and out of order: the last lesson done alone
	const odd = new Set([order.at(-1)!]);
	expect(nextHome(data.home.lessons, odd)?.id).toBe(nextLessons(graph, odd)[0]);
});
