/** Reads and writes over the store. Every function takes the database, so tests use a fresh one. */
import type { Db, LessonRecord } from './db.ts';

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

export const fileKey = (era: number, file: string) => `${era}:${file}`;

export async function saveFile(db: Db, era: number, file: string, text: string): Promise<void> {
	await db.put('practice', text, fileKey(era, file));
}

export async function getFile(db: Db, era: number, file: string): Promise<string | undefined> {
	return db.get('practice', fileKey(era, file));
}

/** Every era's files: era → file name → text. */
export async function sites(db: Db): Promise<Record<number, Record<string, string>>> {
	const out: Record<number, Record<string, string>> = {};
	const tx = db.transaction('practice');
	for await (const c of tx.store.iterate()) {
		const [era, file] = [Number(c.key.split(':')[0]), c.key.slice(c.key.indexOf(':') + 1)];
		(out[era] ??= {})[file] = c.value;
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
