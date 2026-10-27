/** Reads and writes over the store. Every function takes the database, so tests use a fresh one. */
import { stepKey, type Db, type LessonRecord } from './db.ts';

export async function markStarted(db: Db, lessonId: string): Promise<void> {
	const prior = await db.get('lessons', lessonId);
	if (prior) return;
	await db.put('lessons', { status: 'started', at: Date.now(), xp: 0 }, lessonId);
}

export async function markDone(db: Db, lessonId: string, xp: number): Promise<void> {
	await db.put('lessons', { status: 'done', at: Date.now(), xp }, lessonId);
}

export async function lessons(db: Db): Promise<Map<string, LessonRecord>> {
	const tx = db.transaction('lessons');
	const out = new Map<string, LessonRecord>();
	for await (const c of tx.store.iterate()) out.set(c.key, c.value);
	return out;
}

export async function doneSet(db: Db): Promise<Set<string>> {
	const all = await lessons(db);
	return new Set([...all].filter(([, v]) => v.status === 'done').map(([k]) => k));
}

export async function saveAnswer(db: Db, lessonId: string, q: number, correct: boolean): Promise<void> {
	const key = `${lessonId}:${q}`;
	const prior = await db.get('answers', key);
	await db.put('answers', { correct, tries: (prior?.tries ?? 0) + 1 }, key);
}

/** The person's work on one practice step (keyed by the step's id, schema 2). */
export async function saveFile(db: Db, stepId: string, file: string, text: string): Promise<void> {
	await db.put('practice', text, stepKey(stepId, file));
}

export async function getFile(db: Db, stepId: string, file: string): Promise<string | undefined> {
	return db.get('practice', stepKey(stepId, file));
}

type Files = Record<string, string>;

/** Every practice record, grouped: step id → files, and schema 1's era pages: era → files. */
async function practice(db: Db): Promise<{ steps: Record<string, Files>; legacy: Record<number, Files> }> {
	const steps: Record<string, Files> = {};
	const legacy: Record<number, Files> = {};
	const tx = db.transaction('practice');
	for await (const c of tx.store.iterate()) {
		const m = /^(step|era):([^:]+):(.+)$/.exec(c.key);
		if (!m) continue;
		if (m[1] === 'step') (steps[m[2]] ??= {})[m[3]] = c.value;
		else (legacy[Number(m[2])] ??= {})[m[3]] = c.value;
	}
	return { steps, legacy };
}

/** The era's page from schema 1, before practice was keyed by step, if the person had one. */
export async function legacyFiles(db: Db, era: number): Promise<Files | undefined> {
	return (await practice(db)).legacy[era];
}

/**
 * The person's site in each era (spec §4.4, §4.6): the files of the era's furthest step, in
 * curriculum order, that has saved work. Each step's starter is a whole page that builds on the
 * steps before it, so the furthest one is the most complete site. An era with no saved step
 * shows its page from schema 1, if there is one.
 */
export async function eraSites(db: Db, steps: { id: string; era: number }[]): Promise<Record<number, Files>> {
	const { steps: saved, legacy } = await practice(db);
	const out: Record<number, Files> = { ...legacy };
	const seen = new Set<number>();
	for (const s of [...steps].reverse()) {
		if (seen.has(s.era) || !saved[s.id]) continue;
		seen.add(s.era);
		out[s.era] = saved[s.id];
	}
	return out;
}

export async function setPersona(db: Db, field: string, value: unknown): Promise<void> {
	if (value === undefined || value === '') await db.delete('persona', field);
	else await db.put('persona', value, field);
}

export async function persona(db: Db): Promise<Record<string, unknown>> {
	const out: Record<string, unknown> = {};
	const tx = db.transaction('persona');
	for await (const c of tx.store.iterate()) out[c.key] = c.value;
	return out;
}

export async function setSetting(db: Db, k: string, v: unknown): Promise<void> {
	if (v === undefined) await db.delete('settings', k);
	else await db.put('settings', v, k);
}

export async function getSetting<T = unknown>(db: Db, k: string): Promise<T | undefined> {
	return (await db.get('settings', k)) as T | undefined;
}
