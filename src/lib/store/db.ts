/**
 * Everything the person does lives here, in IndexedDB on their device (spec §4.3). There is no
 * server and no account: this database and the file «Сохранить прогресс» writes are all there is.
 *
 * Versioned by MIGRATIONS: version N's step runs once, when a database older than N opens. A new
 * version appends a step and never rewrites an old one, so a person's data survives every release.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type LessonRecord = { status: 'started' | 'done'; at: number; xp: number };
export type AnswerRecord = { correct: boolean; tries: number };
export type LogRecord = { at: number; kind: string; xp: number };

export interface LearnDB extends DBSchema {
	lessons: { key: string; value: LessonRecord };
	answers: { key: string; value: AnswerRecord };
	practice: { key: string; value: string };
	cards: { key: string; value: unknown };
	persona: { key: string; value: unknown };
	settings: { key: string; value: unknown };
	log: { key: number; value: LogRecord };
}

export type Db = IDBPDatabase<LearnDB>;
export type StoreName = 'lessons' | 'answers' | 'practice' | 'cards' | 'persona' | 'settings' | 'log';
export const STORES: StoreName[] = ['lessons', 'answers', 'practice', 'cards', 'persona', 'settings', 'log'];

export const SCHEMA_VERSION = 1;

const MIGRATIONS: ((db: IDBPDatabase<LearnDB>) => void)[] = [
	// 1: the first schema
	(db) => {
		for (const s of STORES.filter((s) => s !== 'log')) db.createObjectStore(s);
		db.createObjectStore('log', { autoIncrement: true });
	}
];

/**
 * `onBlocking` runs when a newer release, open in another tab, wants to upgrade the schema. This
 * connection is closed first, because an open one blocks that upgrade forever: the new tab's
 * openDb never resolves and its pages never learn what the person has done. The app reloads the
 * old tab, which then opens the upgraded database with the new code.
 */
export function openDb(name = 'learn', opts: { onBlocking?: () => void } = {}): Promise<Db> {
	const opening = openDB<LearnDB>(name, MIGRATIONS.length, {
		upgrade(db, old) {
			for (let v = old; v < MIGRATIONS.length; v++) MIGRATIONS[v](db);
		},
		blocking() {
			opening.then((db) => db.close());
			opts.onBlocking?.();
		}
	});
	return opening;
}

let shared: Promise<Db> | undefined;

/** The app's one database, opened on first use in the browser. */
export function db(): Promise<Db> {
	shared ??= openDb('learn', { onBlocking: () => location.reload() });
	return shared;
}
