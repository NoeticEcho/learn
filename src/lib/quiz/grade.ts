/**
 * Grading per question type (spec §3.4 «Тест»). A wrong answer carries the `why` the lesson wrote
 * for the option that misled, so feedback says why, not only that.
 * `code` questions are graded by the practice checks (Task 9), not here.
 */
import type { Question } from '#lib/content/schema.ts';

export type Graded = { correct: boolean; why?: string };

const isNums = (v: unknown): v is number[] => Array.isArray(v) && v.every((x) => typeof x === 'number');
const isStrs = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

export function grade(q: Question, response: unknown): Graded {
	switch (q.type) {
		case 'single': {
			if (typeof response !== 'number') return { correct: false };
			if (response === q.answer) return { correct: true };
			return { correct: false, why: q.why[response] || undefined };
		}
		case 'multiple': {
			if (!isNums(response)) return { correct: false };
			const want = new Set(q.answer),
				got = new Set(response);
			const extra = [...got].find((i) => !want.has(i));
			const missed = [...want].find((i) => !got.has(i));
			if (extra === undefined && missed === undefined) return { correct: true };
			const why = q.why[(extra ?? missed) as number];
			return why ? { correct: false, why } : { correct: false };
		}
		case 'order': {
			if (!isStrs(response)) return { correct: false };
			const ok = response.length === q.items.length && response.every((x, i) => x === q.items[i]);
			return { correct: ok };
		}
		case 'match': {
			if (!Array.isArray(response)) return { correct: false };
			const key = (p: unknown) => (Array.isArray(p) ? `${p[0]}\u0000${p[1]}` : '');
			const want = new Set(q.pairs.map(key));
			const got = new Set((response as unknown[]).map(key));
			const ok = got.size === want.size && [...want].every((k) => got.has(k));
			return { correct: ok };
		}
		case 'code':
			throw new Error('grade: code questions are graded by the practice checks');
	}
}

/** A seeded shuffle (mulberry32 over a string hash): the same on the server and in the browser. */
export function shuffle<T>(items: readonly T[], seed: string): T[] {
	let h = 2166136261;
	for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
	const rand = () => {
		h = (h + 0x6d2b79f5) | 0;
		let t = Math.imul(h ^ (h >>> 15), 1 | h);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	// A shuffle that happens to give the answer back is no question; rotate by one.
	if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift() as T);
	return out;
}
