/**
 * Everything the person does lives here, in IndexedDB on their device (spec §4.3). There is no
 * server and no account: this database and the file «Сохранить прогресс» writes are all there is.
 *
 * Versioned by MIGRATIONS: version N's step runs once, when a database older than N opens. A new
 * version appends a step and never rewrites an old one, so a person's data survives every release.
 */
import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction, type StoreNames } from 'idb';

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

/**
 * A practice file's key (schema 2). `step:<step id>:<file>` is the person's work on one practice
 * step. `era:<n>:<file>` is what schema 1 kept: one page per era, shared by every step of it, so
 * one lesson's work replaced the next lesson's starter. Schema 2 moves those pages to `era:` keys
 * untouched; they are the era's site until a step of that era is saved, and a step offers them.
 */
export const stepKey = (stepId: string, file: string) => `step:${stepId}:${file}`;
export const legacyKey = (era: number, file: string) => `era:${era}:${file}`;
/** A schema-1 practice key (`1:index.html`) in schema 2, or the key as it is. */
export const upgradePracticeKey = (key: string) => key.replace(/^(\d+):/, 'era:$1:');

type UpgradeTx = IDBPTransaction<LearnDB, StoreNames<LearnDB>[], 'versionchange'>;

const MIGRATIONS: ((db: IDBPDatabase<LearnDB>, tx: UpgradeTx) => void | Promise<void>)[] = [
	// 1: the first schema
	(db) => {
		for (const s of STORES.filter((s) => s !== 'log')) db.createObjectStore(s);
		db.createObjectStore('log', { autoIncrement: true });
	},
	// 2: practice files keyed by step; schema 1's era pages are kept under era: keys
	async (_db, tx) => {
		const store = tx.objectStore('practice');
		for (const key of await store.getAllKeys()) {
			const next = upgradePracticeKey(key);
			if (next === key) continue;
			await store.put((await store.get(key))!, next);
			await store.delete(key);
		}
	}
];

export const SCHEMA_VERSION = MIGRATIONS.length;

/**
 * `onBlocking` runs when a newer release, open in another tab, wants to upgrade the schema. This
 * connection is closed first, because an open one blocks that upgrade forever: the new tab's
 * openDb never resolves and its pages never learn what the person has done. The app reloads the
 * old tab, which then opens the upgraded database with the new code.
 */
export function openDb(name = 'learn', opts: { onBlocking?: () => void } = {}): Promise<Db> {
	const opening = openDB<LearnDB>(name, MIGRATIONS.length, {
		// The steps run in order inside the one upgrade transaction; it stays open while each
		// step's requests are pending, and a step that throws aborts it, leaving the old version.
		async upgrade(db, old, _new, tx) {
			for (let v = old; v < MIGRATIONS.length; v++) await MIGRATIONS[v](db, tx);
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
