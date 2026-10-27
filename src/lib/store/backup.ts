/**
 * «Сохранить прогресс» and «Загрузить» (spec §4.3): the only backup there is.
 *
 * The person's own model key is a secret, so it is left out of an export unless they ask for it,
 * and an import that carries none keeps the key this browser already has.
 */
import { z } from 'zod';
import { SCHEMA_VERSION, STORES, type Db, type StoreName } from './db.ts';

export const OWN_KEY = 'ownKey';

const LessonValue = z.object({ status: z.enum(['started', 'done']), at: z.number(), xp: z.number() });
const AnswerValue = z.object({ correct: z.boolean(), tries: z.number().int().min(0) });
const LogValue = z.object({ at: z.number(), kind: z.string(), xp: z.number() });

const typed = <T extends z.ZodType>(key: z.ZodType, value: T) => z.array(z.tuple([key, value]));

export const Backup = z.object({
	app: z.literal('learn'),
	schema: z.number().int().min(1).max(SCHEMA_VERSION),
	exportedAt: z.string(),
	stores: z
		.object({
			lessons: typed(z.string(), LessonValue),
			answers: typed(z.string(), AnswerValue),
			practice: typed(z.string(), z.string()),
			cards: typed(z.string(), z.unknown()),
			persona: typed(z.string(), z.unknown()),
			settings: typed(z.string(), z.unknown()),
			log: typed(z.number().int(), LogValue)
		})
		.partial()
		.strict()
});
export type Backup = z.infer<typeof Backup>;

export async function exportAll(db: Db, opts: { includeKey?: boolean } = {}): Promise<Backup> {
	const stores: Record<string, [IDBValidKey, unknown][]> = {};
	const tx = db.transaction(STORES);
	for (const name of STORES) {
		const rows: [IDBValidKey, unknown][] = [];
		for await (const c of tx.objectStore(name).iterate()) {
			if (name === 'settings' && c.key === OWN_KEY && !opts.includeKey) continue;
			rows.push([c.key, c.value]);
		}
		stores[name] = rows;
	}
	await tx.done;
	return { app: 'learn', schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), stores } as Backup;
}

function parse(data: unknown): Backup {
	if (!data || typeof data !== 'object' || (data as { app?: unknown }).app !== 'learn')
		throw new Error('import: this file is not a backup of this textbook');
	const r = Backup.safeParse(data);
	if (!r.success) throw new Error(`import: the backup is damaged (${r.error.issues[0]?.message ?? 'invalid'})`);
	return r.data;
}

/** What an import would bring, without writing anything. */
export function preview(data: unknown): { counts: Record<StoreName, number>; exportedAt: string } {
	const b = parse(data);
	const counts = Object.fromEntries(STORES.map((s) => [s, b.stores[s]?.length ?? 0])) as Record<StoreName, number>;
	return { counts, exportedAt: b.exportedAt };
}

/** Replaces everything in one transaction, so a file that fails halfway changes nothing. */
export async function importAll(db: Db, data: unknown): Promise<{ counts: Record<StoreName, number> }> {
	const b = parse(data);
	const { counts } = preview(b);
	const keepKey = !b.stores.settings?.some(([k]) => k === OWN_KEY);
	const tx = db.transaction(STORES, 'readwrite');
	const ownKey = keepKey ? await tx.objectStore('settings').get(OWN_KEY) : undefined;
	try {
		for (const name of STORES) {
			const store = tx.objectStore(name);
			await store.clear();
			for (const [k, v] of b.stores[name] ?? []) await store.put(v as never, k as never);
		}
		if (ownKey !== undefined) await tx.objectStore('settings').put(ownKey, OWN_KEY);
		await tx.done;
	} catch (e) {
		try {
			tx.abort();
		} catch {
			/* already finished */
		}
		throw e;
	}
	return { counts };
}
