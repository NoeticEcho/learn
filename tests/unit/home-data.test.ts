/**
 * The catalog is prerendered with its data inline, so what is in it is paid for by every first
 * visit. It carries each course's line and two counts, and no lesson of any course: its size grows
 * with the number of courses, not with the number of lessons. A returning person's lesson list is a
 * hashed file of its own, fetched after the store says they have been here before.
 */
import { it, expect } from 'vitest';
import { load } from '../../src/routes/[[lang=lang]]/+page.server.ts';
import { GET, entries } from '../../src/routes/data/home-[hash].json/+server.ts';
import { loadContent } from '#lib/content/load.ts';
import { loadCourses } from '#lib/courses/load.ts';
import { isPlanned } from '#lib/courses/schema.ts';
import { nextLessons } from '#lib/content/graph.ts';
import { nextHome, type HomeLesson } from '#lib/content/catalogue.ts';

const data = load({ params: {} });
const [{ hash }] = entries() as { hash: string }[];
const index = async (h: string) => GET({ params: { hash: h } } as Parameters<typeof GET>[0]);
const lessons: HomeLesson[] = await (await index(hash)).json();
const { strands, courses } = loadCourses();

it('inlines a fixed amount per course, and no lesson', () => {
	const json = JSON.stringify(data);
	expect(json.length).toBeLessThan(courses.length * 400 + strands.length * 400 + 300);
	expect(data.index).toBe(hash);
	for (const c of courses.filter(isPlanned)) expect(json, c.id).not.toContain(c.parts[0].lessons[0].summary.ru);
	for (const l of loadContent().lessons) expect(json).not.toContain(l.summary);
	expect(json).not.toMatch(/"parts"|"teaches"|"requires"/);
});

it('names the lesson list by its hash, and nothing else is served under another', async () => {
	expect(hash).toMatch(/^[0-9a-f]{12}$/);
	await expect(index('000000000000')).rejects.toMatchObject({ status: 404 });
});

it('the list carries no lesson summaries, concepts or parts', () => {
	const json = JSON.stringify(lessons);
	const { lessons: all, curriculum } = loadContent();
	for (const l of all) expect(json).not.toContain(l.summary);
	expect(json).not.toContain(curriculum.parts[0].summary);
	expect(json).not.toMatch(/"teaches"|"requires"|"concepts"|"minutes"/);
});

it('names the same next lesson as the concept graph, at every point of the course', () => {
	const { lessons: all, graph } = loadContent();
	const order = [...all].sort((a, b) => a.part - b.part || a.order - b.order).map((l) => l.id);
	for (let n = 0; n <= order.length; n++) {
		const done = new Set(order.slice(0, n));
		expect(nextHome(lessons, done)?.id).toBe(nextLessons(graph, done)[0]);
	}
	// and out of order: the last lesson done alone
	const odd = new Set([order.at(-1)!]);
	expect(nextHome(lessons, odd)?.id).toBe(nextLessons(graph, odd)[0]);
});
