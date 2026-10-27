// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Comic from '#lib/comic/Comic.svelte';
import { Comic as ComicSchema, LessonMeta } from '#lib/content/schema.ts';
import { loadContent } from '#lib/content/load.ts';
import { validLesson } from '../fixtures/lesson.valid';

const panel = (over: Record<string, unknown> = {}) => ({ mood: 'explain', prop: 'server', say: 'Где живёт example.ru?', ...over });
const parse = (panels: unknown[]) => ComicSchema.safeParse({ panels });

describe('the comic format', () => {
	it('accepts a lesson with a comic, and fills in mood and side', () => {
		const r = LessonMeta.safeParse({ ...validLesson, comic: { era: 3, panels: [panel(), { say: 'Вот.' }] } });
		expect(r.error?.issues ?? []).toEqual([]);
		expect(r.data!.comic!.panels[1]).toMatchObject({ mood: 'explain', side: 'left' });
	});
	it('holds two to four panels', () => {
		expect(parse([panel()]).success).toBe(false);
		expect(parse([panel(), panel(), panel(), panel(), panel()]).success).toBe(false);
	});
	it('refuses a prop, a mood or a key the kit does not have', () => {
		expect(parse([panel({ prop: 'typewriter' }), panel()]).success).toBe(false);
		expect(parse([panel({ mood: 'angry' }), panel()]).success).toBe(false);
		expect(parse([panel({ speech: 'x' }), panel()]).success).toBe(false);
	});
	it('refuses a label or a speaking prop in a panel without a prop', () => {
		expect(parse([panel({ prop: undefined, label: '404' }), panel()]).success).toBe(false);
		expect(parse([panel({ prop: undefined, say: [{ who: 'Сервер', text: '404' }] }), panel()]).success).toBe(false);
	});
	it('refuses two lines from one speaker, and more words than a panel holds', () => {
		expect(parse([panel({ say: [{ text: 'а' }, { text: 'б' }] }), panel()]).success).toBe(false);
		const long = 'слово '.repeat(20).trim();
		expect(parse([panel({ say: [{ text: long }, { who: 'Сервер', text: long }] }), panel()]).success).toBe(false);
	});
	it('every lesson of parts 0 and 1 has a comic', () => {
		const missing = loadContent()
			.lessons.filter((l) => l.part <= 1 && !l.comic)
			.map((l) => l.id);
		expect(missing).toEqual([]);
	});
});

describe('Comic', () => {
	const comic = {
		era: 3,
		panels: [
			{ mood: 'hmm' as const, side: 'left' as const, prop: 'server' as const, label: 'корень', caption: 'Резолвер', say: [{ text: 'Где живёт example.ru?' }, { who: 'Корневой сервер', text: 'Спросите .ru.' }] },
			{ mood: 'cheer' as const, side: 'right' as const, era: 5, say: 'Нашёл.' }
		]
	};

	it('puts every word in text, named for its speaker, and hides the drawing', () => {
		const { container } = render(Comic, { comic });
		const items = container.querySelectorAll('ol > li');
		expect(items).toHaveLength(2);
		expect(items[0].textContent).toContain('Резолвер');
		expect(items[0].textContent).toContain('Эхо: Где живёт example.ru?');
		expect(items[0].textContent).toContain('Корневой сервер: Спросите .ru.');
		for (const svg of container.querySelectorAll('svg.scene')) expect(svg.getAttribute('aria-hidden')).toBe('true');
		// The mascot's own title would be a second name for a hidden drawing.
		expect(container.querySelector('svg.scene title')).toBeNull();
		expect(container.querySelector('aside')!.getAttribute('aria-labelledby')).toBeTruthy();
	});

	it('draws Эхо in the panel’s mood and era', () => {
		const { container } = render(Comic, { comic });
		const [a, b] = container.querySelectorAll('svg.echo');
		expect(a.classList.contains('mood-hmm')).toBe(true);
		expect(a.classList.contains('era-3')).toBe(true);
		expect(b.classList.contains('mood-cheer')).toBe(true);
		expect(b.classList.contains('era-5')).toBe(true);
	});

	it('gives each mascot its own gradient id', () => {
		const { container } = render(Comic, { comic });
		const ids = [...container.querySelectorAll('radialGradient')].map((g) => g.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
