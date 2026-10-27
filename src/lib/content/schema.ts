/**
 * The content schema (spec §3.4, §5). Every lesson's front matter and the curriculum file are
 * validated by these at build time and by `npm run content:check`; a lesson that fails fails the
 * build. The rules here are the ones a half-made lesson would break: too few questions, too few
 * sources, an answer that points at no option, a licence we may not adapt.
 *
 * These schemas run at build time (server loads, the CLI, tests), never in the browser bundle.
 */
import { z } from 'zod';
import { Check } from '#lib/practice/checks.schema.ts';
import { LIMITS, MOODS, PROPS, lines } from '#lib/comic/kit.ts';

export { Check };

const text = z.string().trim().min(1);

/**
 * Licences we may cite. NC and ND sources are not adaptable under CC BY-SA, so they enter only
 * as 'link-only' (we link, never adapt); there is deliberately no 'CC-BY-NC' value (§5).
 */
export const Licence = z.enum(['CC-BY', 'CC-BY-SA', 'CC0', 'PD', 'link-only', 'proprietary-link']);

export const Source = z.object({
	title: text,
	url: z.url({ protocol: /^https$/ }),
	licence: Licence,
	kind: z.enum(['article', 'spec', 'course', 'video', 'book', 'docs']),
	lang: z.enum(['ru', 'en'])
});
export type Source = z.infer<typeof Source>;

const inRange = (n: number, len: number) => Number.isInteger(n) && n >= 0 && n < len;

const Single = z
	.object({
		type: z.literal('single'),
		prompt: text,
		options: z.array(text).min(2),
		answer: z.number().int(),
		why: z.array(z.string())
	})
	.superRefine((q, ctx) => {
		if (!inRange(q.answer, q.options.length))
			ctx.addIssue({ code: 'custom', path: ['answer'], message: `answer ${q.answer} is not an option` });
		if (q.why.length !== q.options.length)
			ctx.addIssue({ code: 'custom', path: ['why'], message: 'one why per option' });
	});

const Multiple = z
	.object({
		type: z.literal('multiple'),
		prompt: text,
		options: z.array(text).min(2),
		answer: z.array(z.number().int()).min(1),
		why: z.array(z.string())
	})
	.superRefine((q, ctx) => {
		if (!q.answer.every((a) => inRange(a, q.options.length)))
			ctx.addIssue({ code: 'custom', path: ['answer'], message: 'an answer is not an option' });
		if (new Set(q.answer).size !== q.answer.length)
			ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answers repeat' });
		if (q.why.length !== q.options.length)
			ctx.addIssue({ code: 'custom', path: ['why'], message: 'one why per option' });
	});

const Order = z.object({
	type: z.literal('order'),
	prompt: text,
	/** The correct order is the order given; the UI shuffles. */
	items: z.array(text).min(2)
});

const Match = z.object({
	type: z.literal('match'),
	prompt: text,
	pairs: z.array(z.tuple([text, text])).min(2)
});

const Code = z.object({
	type: z.literal('code'),
	prompt: text,
	starter: z.string(),
	checks: z.array(Check).min(1)
});

export const Question = z.discriminatedUnion('type', [Single, Multiple, Order, Match, Code]);
export type Question = z.infer<typeof Question>;

export const Card = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), front: text, back: text });
export type Card = z.infer<typeof Card>;

export const PracticeFiles = z.object({
	'index.html': z.string(),
	'styles.css': z.string().optional(),
	'script.js': z.string().optional()
});
export type PracticeFiles = z.infer<typeof PracticeFiles>;
export type FileName = keyof PracticeFiles;

export const Era = z.number().int().min(1).max(8);

export const PracticeStep = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/),
	title: text,
	task: text,
	/** The starter, as a persona template (`{{name}}`); rendered with the person's brief. */
	files: PracticeFiles,
	solution: PracticeFiles,
	checks: z.array(Check).min(1),
	era: Era,
	/**
	 * The id of an earlier step of the same era whose saved work this step starts from, while it
	 * has none of its own. Without it a step starts from its own starter. Checked by the loader.
	 */
	continues: z.string().regex(/^[a-z0-9-]+$/).optional()
});
export type PracticeStep = z.infer<typeof PracticeStep>;

export const GuideLines = z.object({
	intro: text,
	/** By attempt: the first failure gets hints[0], the last hint repeats. */
	hints: z.array(text).min(1),
	/** Keyed by check id: what the guide says when that check fails. */
	mistakes: z.record(z.string(), text),
	outro: text
});
export type GuideLines = z.infer<typeof GuideLines>;

/**
 * The lesson's comic (docs/content-plan/README.md, «Комикс»): two to four panels in the rail
 * beside the theory. Each panel is Эхо (a mood, a side), at most one prop from the kit, a
 * caption, and one or two lines. A line with `who` is the prop speaking and needs a prop.
 */
const ComicLine = z.object({
	text: text.max(LIMITS.line),
	who: text.max(LIMITS.caption).optional()
});

export const ComicPanel = z
	.object({
		mood: z.enum(MOODS).default('explain'),
		side: z.enum(['left', 'right']).default('left'),
		/** This panel's era on Эхо's ring, when it differs from the comic's. */
		era: Era.optional(),
		prop: z.enum(PROPS).optional(),
		label: text.max(LIMITS.label).optional(),
		caption: text.max(LIMITS.caption).optional(),
		say: z.union([text.max(LIMITS.line), z.array(ComicLine).min(1).max(2)])
	})
	.strict()
	.superRefine((p, ctx) => {
		const ls = lines(p);
		if (p.label && !p.prop) ctx.addIssue({ code: 'custom', path: ['label'], message: 'a label is drawn on a prop; this panel has none' });
		if (ls.some((l) => l.who) && !p.prop)
			ctx.addIssue({ code: 'custom', path: ['say'], message: 'a line with who is the prop speaking; this panel has no prop' });
		if (ls.filter((l) => !l.who).length > 1 || ls.filter((l) => l.who).length > 1)
			ctx.addIssue({ code: 'custom', path: ['say'], message: 'one line for Эхо and one for the prop at most' });
		const total = ls.reduce((n, l) => n + l.text.length, 0);
		if (total > LIMITS.panel)
			ctx.addIssue({ code: 'custom', path: ['say'], message: `${total} characters; a panel holds ${LIMITS.panel}` });
	});
export type ComicPanel = z.infer<typeof ComicPanel>;

export const Comic = z
	.object({
		/** Эхо's era for every panel; the lesson's practice era, then its part's, when absent. */
		era: Era.optional(),
		panels: z.array(ComicPanel).min(2).max(4)
	})
	.strict();
export type Comic = z.infer<typeof Comic>;

export const ConceptId = z.string().regex(/^[a-z0-9-]+$/);

export const LessonMeta = z
	.object({
		id: z.string().regex(/^\d\d-[a-z0-9-]+\/\d\d-[a-z0-9-]+$/, 'id is "<part-slug>/<lesson-slug>"'),
		part: z.number().int().min(0).max(16),
		order: z.number().int().min(1),
		title: text,
		/** «Зачем»: what the person can do after the lesson. */
		summary: text,
		minutes: z.number().int().min(1).max(120),
		teaches: z.array(ConceptId).min(1),
		requires: z.array(ConceptId),
		practice: PracticeStep.optional(),
		quiz: z.array(Question).min(4).max(8),
		cards: z.array(Card).min(3).max(6),
		sources: z.array(Source).min(2),
		videos: z.array(Source.extend({ kind: z.literal('video') })),
		guide: GuideLines,
		comic: Comic.optional(),
		/** A pronunciation map for later narration (spec §4.9): written form → how to say it. */
		say: z.record(z.string().min(1), text).optional()
	})
	.superRefine((l, ctx) => {
		const ids = l.cards.map((c) => c.id);
		if (new Set(ids).size !== ids.length)
			ctx.addIssue({ code: 'custom', path: ['cards'], message: 'card ids repeat' });
		if (l.practice) {
			const checkIds = l.practice.checks.map((c) => c.id);
			if (new Set(checkIds).size !== checkIds.length)
				ctx.addIssue({ code: 'custom', path: ['practice', 'checks'], message: 'check ids repeat' });
		}
		for (const k of Object.keys(l.guide.mistakes))
			if (!l.practice?.checks.some((c) => c.id === k))
				ctx.addIssue({ code: 'custom', path: ['guide', 'mistakes', k], message: `no check ${k}` });
	});
export type LessonMeta = z.infer<typeof LessonMeta>;

export const Part = z.object({
	number: z.number().int().min(0).max(16),
	slug: z.string().regex(/^\d\d-[a-z0-9-]+$/),
	title: text,
	era: Era.optional(),
	summary: text
});
export type Part = z.infer<typeof Part>;

export const Concept = z.object({ id: ConceptId, title: text, part: z.number().int().min(0).max(16) });
export type Concept = z.infer<typeof Concept>;

export const Curriculum = z.object({ parts: z.array(Part).min(1), concepts: z.array(Concept) });
export type Curriculum = z.infer<typeof Curriculum>;
