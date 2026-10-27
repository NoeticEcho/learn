/**
 * Gamification (spec §4.6): XP, a daily streak with one free freeze a week, and era badges.
 * No leaderboard: there is no server to rank people on, and none is wanted.
 * Days are the person's local dates; weeks are ISO weeks (Monday first).
 */
import type { Db, LogRecord } from '#lib/store/db.ts';

export const XP = { lesson: 10, quizPerfect: 5, practice: 15, review: 1 } as const;
export type XpKind = keyof typeof XP;

export async function award(db: Db, kind: XpKind, at = new Date()): Promise<void> {
	await db.add('log', { at: at.getTime(), kind, xp: XP[kind] });
}

export const totalXp = (log: Pick<LogRecord, 'xp'>[]) => log.reduce((s, e) => s + e.xp, 0);

const dayKey = (t: Date) => `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
const addDays = (t: Date, n: number) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
const weekKey = (t: Date) => dayKey(addDays(t, -((t.getDay() + 6) % 7))); // that week's Monday

export function streak(log: { at: number }[], today: Date): { days: number; frozenThisWeek: boolean } {
	const active = new Set(log.map((e) => dayKey(new Date(e.at))));
	const frozenWeeks = new Set<string>();
	let d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	// Today is not over: if nothing yet today, the streak runs to yesterday.
	if (!active.has(dayKey(d))) d = addDays(d, -1);
	let days = 0;
	for (;;) {
		if (active.has(dayKey(d))) days++;
		else if (days > 0 && !frozenWeeks.has(weekKey(d)) && active.has(dayKey(addDays(d, -1)))) {
			frozenWeeks.add(weekKey(d));
			days++;
		} else break;
		d = addDays(d, -1);
	}
	return { days, frozenThisWeek: frozenWeeks.has(weekKey(today)) };
}

/** The eras whose site is finished and whose lessons (if any are listed) are all done. */
export function badges(doneLessons: Set<string>, eraSites: Record<number, boolean>, eraLessons: Record<number, string[]> = {}): number[] {
	return Object.entries(eraSites)
		.filter(([era, done]) => done && (eraLessons[Number(era)] ?? []).every((id) => doneLessons.has(id)))
		.map(([era]) => Number(era))
		.sort((a, b) => a - b);
}
