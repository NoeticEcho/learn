import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { streak, award, badges, totalXp, XP } from '#lib/game/index.ts';
import { openDb } from '#lib/store/db.ts';

const d = (s: string) => ({ at: new Date(s).getTime() });

it('counts consecutive days', () =>
	expect(streak([d('2026-11-01T09:00'), d('2026-11-02T09:00'), d('2026-11-03T09:00')], new Date('2026-11-03T20:00')).days).toBe(3));
it('forgives one missed day a week', () => {
	const s = streak([d('2026-11-02T09:00'), d('2026-11-04T09:00')], new Date('2026-11-04T20:00'));
	expect(s).toEqual({ days: 3, frozenThisWeek: true });
});
it('breaks on two missed days', () =>
	expect(streak([d('2026-11-01T09:00'), d('2026-11-04T09:00')], new Date('2026-11-04T20:00')).days).toBe(1));
it('today not yet studied does not break yesterday’s streak', () =>
	expect(streak([d('2026-11-02T09:00'), d('2026-11-03T09:00')], new Date('2026-11-04T08:00')).days).toBe(2));
it('only one freeze a week', () =>
	expect(streak([d('2026-11-03T09:00'), d('2026-11-05T09:00'), d('2026-11-07T09:00')], new Date('2026-11-07T20:00')).days).toBe(3));
it('an empty log is no streak', () => expect(streak([], new Date('2026-11-07T20:00'))).toEqual({ days: 0, frozenThisWeek: false }));

it('awards XP into the log', async () => {
	const db = await openDb('game1');
	await award(db, 'lesson', new Date('2026-11-01T10:00'));
	await award(db, 'practice', new Date('2026-11-01T10:05'));
	expect(totalXp(await db.getAll('log'))).toBe(XP.lesson + XP.practice);
});

it('an era badge needs the finished site and that era’s lessons', () => {
	expect(badges(new Set(['a', 'b']), { 1: true, 2: true, 3: false }, { 1: ['a'], 2: ['c'] })).toEqual([1]);
	expect(badges(new Set(), { 4: true }, {})).toEqual([4]);
});
