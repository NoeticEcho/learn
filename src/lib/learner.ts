/**
 * The person, as the browser knows them: what they finished, their project, their settings.
 * Browser-only (IndexedDB); every route calls it from onMount.
 */
import { db } from '#lib/store/db.ts';
import * as progress from '#lib/store/progress.ts';
import { merged } from '#lib/persona/render.ts';
import type { Persona, Kind } from '#lib/persona/fields.ts';
import type { ModelConfig } from '#lib/guide/model.ts';

export { db, progress };

export async function done(): Promise<Set<string>> {
	return progress.doneSet(await db());
}

export async function persona(): Promise<Persona> {
	const own = await progress.persona(await db());
	return merged(own, (own.kind as Kind | undefined) ?? 'expert');
}

export async function ownKey(): Promise<ModelConfig | null> {
	const k = await progress.getSetting<ModelConfig>(await db(), 'ownKey');
	return k && k.key ? k : null;
}
