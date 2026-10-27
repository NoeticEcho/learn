import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { openDb, SCHEMA_VERSION } from '#lib/store/db.ts';
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
	it('saves practice files per step, so two lessons of one era keep their own pages', async () => {
		const db = await fresh();
		await progress.saveFile(db, 'first-page', 'index.html', '<h1>1996</h1>');
		await progress.saveFile(db, 'brief-card', 'index.html', '<aside>бриф</aside>');
		expect(await progress.getFile(db, 'first-page', 'index.html')).toBe('<h1>1996</h1>');
		expect(await progress.getFile(db, 'brief-card', 'index.html')).toBe('<aside>бриф</aside>');
		expect(await progress.getFile(db, 'other', 'index.html')).toBeUndefined();
	});
	it('an era’s site is its furthest step with saved work, in curriculum order', async () => {
		const db = await fresh();
		const steps = [
			{ id: 'a', era: 1 },
			{ id: 'b', era: 1 },
			{ id: 'c', era: 3 },
			{ id: 'd', era: 1 }
		];
		await progress.saveFile(db, 'b', 'index.html', '<p>b</p>');
		await progress.saveFile(db, 'b', 'styles.css', 'p{}');
		await progress.saveFile(db, 'a', 'index.html', '<p>a, edited later</p>');
		await progress.saveFile(db, 'c', 'index.html', '<p>c</p>');
		expect(await progress.eraSites(db, steps)).toEqual({
			1: { files: { 'index.html': '<p>b</p>', 'styles.css': 'p{}' }, legacy: false },
			3: { files: { 'index.html': '<p>c</p>' }, legacy: false }
		});
	});
	it('a page from before step keys is the era’s site until a step of that era is saved', async () => {
		const db = await fresh();
		await db.put('practice', '<p>old</p>', 'era:2:index.html');
		expect(await progress.legacyFiles(db, 2)).toEqual({ 'index.html': '<p>old</p>' });
		expect(await progress.eraSites(db, [{ id: 'x', era: 2 }])).toEqual({ 2: { files: { 'index.html': '<p>old</p>' }, legacy: true } });
		await progress.saveFile(db, 'x', 'index.html', '<p>new</p>');
		expect((await progress.eraSites(db, [{ id: 'x', era: 2 }]))[2]).toEqual({ files: { 'index.html': '<p>new</p>' }, legacy: false });
		expect(await progress.legacyFiles(db, 2)).toEqual({ 'index.html': '<p>old</p>' });
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

describe('schema 2: practice files keyed by step', () => {
	it('upgrading a schema-1 database keeps every era page, as that era’s page from before', async () => {
		const { openDB } = await import('idb');
		const name = `v1-${n++}`;
		const v1 = await openDB(name, 1, {
			upgrade(d) {
				for (const s of ['lessons', 'answers', 'practice', 'cards', 'persona', 'settings']) d.createObjectStore(s);
				d.createObjectStore('log', { autoIncrement: true });
			}
		});
		await v1.put('practice', '<h1>моя страница</h1>', '1:index.html');
		await v1.put('practice', 'h1{color:red}', '1:styles.css');
		await v1.put('practice', '<p>2005</p>', '2:index.html');
		await v1.put('lessons', { status: 'done', at: 1, xp: 5 }, 'kept');
		v1.close();
		const db = await openDb(name);
		expect(db.version).toBe(2);
		expect((await db.getAllKeys('practice')).sort()).toEqual(['era:1:index.html', 'era:1:styles.css', 'era:2:index.html']);
		expect(await progress.legacyFiles(db, 1)).toEqual({ 'index.html': '<h1>моя страница</h1>', 'styles.css': 'h1{color:red}' });
		expect(await db.get('lessons', 'kept')).toMatchObject({ status: 'done' });
	});
	it('importing a schema-1 backup moves its era pages the same way', async () => {
		const db = await fresh();
		await importAll(db, { app: 'learn', schema: 1, exportedAt: 'x', stores: { practice: [['1:index.html', '<p>old</p>']] } });
		expect(await progress.legacyFiles(db, 1)).toEqual({ 'index.html': '<p>old</p>' });
		const data = JSON.parse(JSON.stringify(await exportAll(db)));
		expect(data.schema).toBe(2);
		expect(data.stores.practice).toEqual([['era:1:index.html', '<p>old</p>']]);
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
			openDB(name, SCHEMA_VERSION + 1),
			new Promise<null>((r) => setTimeout(() => r(null), 1000))
		]);
		expect(next, 'the upgrade waited on this tab').not.toBeNull();
		expect(told).toBe(1);
		expect(await next!.get('lessons', 'kept')).toMatchObject({ status: 'done' });
	});
});
