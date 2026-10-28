/**
 * The home page is prerendered with its data inline, so every lesson added to the course used to
 * add bytes to the first page a person loads. Home's first paint needs only the first lesson and
 * the count; the returning home's lesson list is a hashed file of its own, fetched after the store
 * says the person has been here before. So the inline data has a fixed cap, not one per lesson.
 */
import { it, expect } from 'vitest';
import { load } from '../../src/routes/[[lang=lang]]/+page.server.ts';
import { GET, entries } from '../../src/routes/data/home-[hash].json/+server.ts';
import { loadContent } from '#lib/content/load.ts';
import { nextLessons } from '#lib/content/graph.ts';
import { nextHome, type HomeLesson } from '#lib/content/catalogue.ts';

const data = load({ params: {} });
const [{ hash }] = entries() as { hash: string }[];
const index = async (h: string) => GET({ params: { hash: h } } as Parameters<typeof GET>[0]);
const lessons: HomeLesson[] = await (await index(hash)).json();

it('inlines a fixed few bytes, however long the course grows', () => {
	expect(JSON.stringify(data).length).toBeLessThan(200);
	expect(data.home).toEqual({ first: lessons[0].id, total: lessons.length, index: hash });
	expect(data.home.total).toBe(loadContent().lessons.length);
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
