import { describe, it, expect } from 'vitest';
import { LessonMeta, Curriculum } from '#lib/content/schema';
import { validLesson } from '../fixtures/lesson.valid';

describe('LessonMeta', () => {
	it('accepts a full lesson', () => {
		const r = LessonMeta.safeParse(validLesson);
		expect(r.error?.issues ?? []).toEqual([]);
	});
	it('refuses fewer than 4 questions', () =>
		expect(LessonMeta.safeParse({ ...validLesson, quiz: validLesson.quiz.slice(0, 3) }).success).toBe(false));
	it('refuses fewer than 2 sources', () =>
		expect(LessonMeta.safeParse({ ...validLesson, sources: validLesson.sources.slice(0, 1) }).success).toBe(false));
	it('refuses a single answer out of range', () => {
		const quiz = [...validLesson.quiz];
		quiz[0] = { ...quiz[0], answer: 9 } as never;
		expect(LessonMeta.safeParse({ ...validLesson, quiz }).success).toBe(false);
	});
	it('refuses an unknown licence', () => {
		const sources = [{ ...validLesson.sources[0], licence: 'CC-BY-NC' }, validLesson.sources[1]];
		expect(LessonMeta.safeParse({ ...validLesson, sources }).success).toBe(false);
	});
	it('refuses multiple answers that repeat', () => {
		const quiz = [...validLesson.quiz];
		quiz[1] = { ...quiz[1], answer: [0, 0] } as never;
		expect(LessonMeta.safeParse({ ...validLesson, quiz }).success).toBe(false);
	});
	it('refuses a why per option that does not match the options', () => {
		const quiz = [...validLesson.quiz];
		quiz[0] = { ...quiz[0], why: ['only one'] } as never;
		expect(LessonMeta.safeParse({ ...validLesson, quiz }).success).toBe(false);
	});
	it('refuses an unknown check kind', () => {
		const practice = { ...validLesson.practice, checks: [{ id: 'x', kind: 'magic' }] };
		expect(LessonMeta.safeParse({ ...validLesson, practice }).success).toBe(false);
	});
	it('refuses a video that is not kind video', () => {
		const videos = [{ ...validLesson.videos[0], kind: 'article' }];
		expect(LessonMeta.safeParse({ ...validLesson, videos }).success).toBe(false);
	});
});

describe('Curriculum', () => {
	it('accepts parts and concepts', () =>
		expect(
			Curriculum.safeParse({
				parts: [{ number: 0, slug: '00-start', title: 'Старт', summary: 's' }],
				concepts: [{ id: 'a', title: 'A', part: 0 }]
			}).success
		).toBe(true));
});
