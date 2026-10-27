import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { openDb } from '#lib/store/db.ts';
import { enrol, due, grade } from '#lib/srs/index.ts';

it('a new card is due now, and not tomorrow after «good»', async () => {
	const db = await openDb('srs1');
	const now = new Date('2026-11-01T10:00:00Z');
	await enrol(db, [{ id: 'c1', front: 'DNS?', back: 'Имена → адреса' }], now);
	expect((await due(db, now)).map((c) => c.id)).toEqual(['c1']);
	await grade(db, 'c1', 'good', now);
	expect(await due(db, new Date('2026-11-01T11:00:00Z'))).toEqual([]);
});

it('enrolling twice does not reset progress', async () => {
	const db = await openDb('srs2');
	const now = new Date('2026-11-01T10:00:00Z');
	const c = [{ id: 'c1', front: 'a', back: 'b' }];
	await enrol(db, c, now);
	await grade(db, 'c1', 'easy', now);
	await enrol(db, c, now);
	expect(await due(db, now)).toEqual([]);
});

it('«again» brings a card back soon', async () => {
	const db = await openDb('srs3');
	const now = new Date('2026-11-01T10:00:00Z');
	await enrol(db, [{ id: 'c1', front: 'a', back: 'b' }], now);
	await grade(db, 'c1', 'again', now);
	expect((await due(db, new Date('2026-11-01T10:30:00Z'))).map((c) => c.id)).toEqual(['c1']);
});
