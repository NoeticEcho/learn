/**
 * Spaced repetition over the lesson cards (spec §3.4 «Карточки»), with FSRS from ts-fsrs.
 * Each card is stored as `{ card, fsrs }`, its dates as ISO strings so a backup is plain JSON.
 * Fuzz is off: the schedule is deterministic, which makes it testable and explainable. One
 * learning step of 10 minutes: the lesson has just taught the card, so «Хорошо» graduates it
 * (two days) instead of the default steps bringing it back in ten minutes.
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FsrsCard, type Grade } from 'ts-fsrs';
import type { Db } from '#lib/store/db.ts';

/** A card, in the edition it was learnt in (`lang`; Russian when absent, as before there were editions). */
export type ReviewCard = { id: string; front: string; back: string; lang?: 'ru' | 'en' };
export type RatingName = 'again' | 'hard' | 'good' | 'easy';

type Stored = { card: ReviewCard; fsrs: Record<string, unknown> };

const f = fsrs(generatorParameters({ enable_fuzz: false, learning_steps: ['10m'] }));

const RATINGS: Record<RatingName, Grade> = {
	again: Rating.Again,
	hard: Rating.Hard,
	good: Rating.Good,
	easy: Rating.Easy
};

const toJson = (c: FsrsCard): Record<string, unknown> => ({
	...c,
	due: c.due.toISOString(),
	last_review: c.last_review ? c.last_review.toISOString() : undefined
});

const fromJson = (j: Record<string, unknown>): FsrsCard =>
	({
		...j,
		due: new Date(j.due as string),
		last_review: j.last_review ? new Date(j.last_review as string) : undefined
	}) as FsrsCard;

/** Adds new cards; a card already enrolled keeps its schedule (its text is refreshed). */
export async function enrol(db: Db, cards: ReviewCard[], now = new Date()): Promise<void> {
	const tx = db.transaction('cards', 'readwrite');
	for (const card of cards) {
		const prior = (await tx.store.get(card.id)) as Stored | undefined;
		const value: Stored = prior ? { ...prior, card } : { card, fsrs: toJson(createEmptyCard(now)) };
		await tx.store.put(value, card.id);
	}
	await tx.done;
}

export async function due(db: Db, now = new Date()): Promise<ReviewCard[]> {
	const all = (await db.getAll('cards')) as Stored[];
	return all
		.map((s) => ({ s, due: new Date(s.fsrs.due as string) }))
		.filter(({ due }) => due.getTime() <= now.getTime())
		.sort((a, b) => a.due.getTime() - b.due.getTime())
		.map(({ s }) => s.card);
}

export async function count(db: Db): Promise<number> {
	return db.count('cards');
}

export async function grade(db: Db, cardId: string, rating: RatingName, now = new Date()): Promise<Date> {
	const s = (await db.get('cards', cardId)) as Stored | undefined;
	if (!s) throw new Error(`srs: no card ${cardId}`);
	const next = f.next(fromJson(s.fsrs), now, RATINGS[rating]).card;
	await db.put('cards', { ...s, fsrs: toJson(next) }, cardId);
	return next.due;
}
