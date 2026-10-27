/**
 * The prologue's timeline (spec §3.1a): the person's site, era by era, 60 to 90 seconds in all.
 * Each era holds long enough to read the person's own words in it; 2014 and 2025 hold longer,
 * because their frames do something (the layout reflows to a phone; the text streams in).
 */
export type EraId = '1991' | '1996' | '2000' | '2005' | '2014' | '2025' | 'iskin';

export const SEQUENCE: { era: EraId; ms: number }[] = [
	{ era: '1991', ms: 9_000 },
	{ era: '1996', ms: 10_000 },
	{ era: '2000', ms: 9_000 },
	{ era: '2005', ms: 10_000 },
	{ era: '2014', ms: 12_000 },
	{ era: '2025', ms: 14_000 },
	{ era: 'iskin', ms: 12_000 }
];

export const total = () => SEQUENCE.reduce((s, e) => s + e.ms, 0);

/** The index of the era playing at `ms` from the start; SEQUENCE.length once it has ended. */
export function eraAt(ms: number): number {
	let t = 0;
	for (let i = 0; i < SEQUENCE.length; i++) {
		t += SEQUENCE[i].ms;
		if (ms < t) return i;
	}
	return SEQUENCE.length;
}

/** The course's eras on Эхо's ring (design/mascot): 1991 … 2025 and Искин, eight in all. */
export const RING_ERA: Record<EraId, number> = { '1991': 1, '1996': 2, '2000': 3, '2005': 4, '2014': 5, '2025': 7, iskin: 8 };
