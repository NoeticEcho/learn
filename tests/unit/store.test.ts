import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { openDb } from '#lib/store/db.ts';
import * as progress from '#lib/store/progress.ts';
import { exportAll, importAll, preview } from '#lib/store/backup.ts';

let n = 0;
const fresh = () => openDb(`t${n++}`);

describe('store', () => {
	it('marks lessons done', async () => {
		const db = await fresh();
		await progress.markDone(db, '02-html/01', 10);
		expect([...(await progress.doneSet(db))]).toEqual(['02-html/01']);
	});
	it('a started lesson is not done', async () => {
		const db = await fresh();
		await progress.markStarted(db, 'a');
		await progress.markDone(db, 'b', 1);
		await progress.markStarted(db, 'b');
		expect([...(await progress.doneSet(db))]).toEqual(['b']);
	});
	it('saves practice files per era', async () => {
		const db = await fresh();
		await progress.saveFile(db, 1, 'index.html', '<h1>1996</h1>');
		expect(await progress.getFile(db, 1, 'index.html')).toBe('<h1>1996</h1>');
		expect(await progress.getFile(db, 2, 'index.html')).toBeUndefined();
	});
	it('round-trips through export and import into a fresh db', async () => {
		const a = await fresh();
		await progress.markDone(a, 'x', 5);
		await progress.setPersona(a, 'name', 'Иван');
		const data = JSON.parse(JSON.stringify(await exportAll(a)));
		const b = await fresh();
		await importAll(b, data);
		expect([...(await progress.doneSet(b))]).toEqual(['x']);
		expect((await progress.persona(b)).name).toBe('Иван');
	});
	it('does not export the own key unless asked', async () => {
		const a = await fresh();
		await progress.setSetting(a, 'ownKey', { provider: 'anthropic', key: 'sk-test' });
		expect(JSON.stringify(await exportAll(a))).not.toContain('sk-test');
		expect(JSON.stringify(await exportAll(a, { includeKey: true }))).toContain('sk-test');
	});
	it('keeps this browser’s own key when the file has none', async () => {
		const a = await fresh();
		await progress.markDone(a, 'x', 5);
		const data = JSON.parse(JSON.stringify(await exportAll(a)));
		const b = await fresh();
		await progress.setSetting(b, 'ownKey', { provider: 'openai', key: 'sk-b' });
		await importAll(b, data);
		expect(await progress.getSetting(b, 'ownKey')).toEqual({ provider: 'openai', key: 'sk-b' });
	});
	it('refuses a file that is not a backup', async () => {
		const b = await fresh();
		await expect(importAll(b, { app: 'other' })).rejects.toThrow(/not a backup/);
	});
	it('a bad file changes nothing', async () => {
		const b = await fresh();
		await progress.markDone(b, 'keep', 1);
		const bad = { app: 'learn', schema: 1, exportedAt: 'x', stores: { lessons: [['y', { status: 'nope' }]] } };
		await expect(importAll(b, bad)).rejects.toThrow();
		expect([...(await progress.doneSet(b))]).toEqual(['keep']);
	});
	it('previews counts without writing', async () => {
		const a = await fresh();
		await progress.markDone(a, 'x', 5);
		await progress.markDone(a, 'y', 5);
		const data = JSON.parse(JSON.stringify(await exportAll(a)));
		expect(preview(data).counts.lessons).toBe(2);
	});
});

describe('a newer schema in another tab', () => {
	it('is not blocked forever by this tab’s open connection', async () => {
		const { openDB } = await import('idb');
		const name = `upgrade${n++}`;
		let told = 0;
		const old = await openDb(name, { onBlocking: () => told++ });
		await progress.markDone(old, 'kept', 1);
		// what the next release's openDb will do: a higher version, with this tab still open
		const next = await Promise.race([
			openDB(name, 2),
			new Promise<null>((r) => setTimeout(() => r(null), 1000))
		]);
		expect(next, 'the upgrade waited on this tab').not.toBeNull();
		expect(told).toBe(1);
		expect(await next!.get('lessons', 'kept')).toMatchObject({ status: 'done' });
	});
});
