/**
 * Word error rate between what the script says and what Whisper heard, the pipeline's own
 * listening test (docs/narration.md). Both sides are first put into spoken form by the same
 * rules (script.ts `speak`), because Whisper writes «DNS» and «1995 году» where the voice was
 * given «ди-эн-эс» and «тысяча девятьсот девяносто пятом году»: a term counts as right when
 * it was heard, in either spelling. Then: numbers as words (Whisper writes «8» for «восемь»), lower case, ё as е, hyphens as spaces, no punctuation.
 */

import { cardinal } from './numbers.ts';

export function words(s: string): string[] {
	return s
		.replace(/(?<![\d.,])\d{1,6}(?![\d.,]\d)/g, (n) => ` ${cardinal(Number(n))} `)
		.toLowerCase()
		.replace(/ё/g, 'е')
		.replace(/[-‐–—]/g, ' ')
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.split(/\s+/)
		.filter(Boolean);
}

export type Op = { op: 'ok' | 'sub' | 'del' | 'ins'; ref?: string; hyp?: string };

/** Levenshtein over words, with the alignment, so a flagged section shows what went wrong. */
export function align(ref: string[], hyp: string[]): { errors: number; ops: Op[] } {
	const n = ref.length;
	const m = hyp.length;
	const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
	for (let i = 1; i <= n; i++)
		for (let j = 1; j <= m; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1));
	const ops: Op[] = [];
	let i = n;
	let j = m;
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1)) {
			ops.push({ op: ref[i - 1] === hyp[j - 1] ? 'ok' : 'sub', ref: ref[i - 1], hyp: hyp[j - 1] });
			i--;
			j--;
		} else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
			ops.push({ op: 'del', ref: ref[i - 1] });
			i--;
		} else {
			ops.push({ op: 'ins', hyp: hyp[j - 1] });
			j--;
		}
	}
	return { errors: d[n][m], ops: ops.reverse() };
}

export function wer(ref: string, hyp: string): number {
	const r = words(ref);
	return r.length ? align(r, words(hyp)).errors / r.length : 0;
}

/** The errors only, each with a word of context either side: «…[дабл→дубль] ю…». */
export function errors(ops: Op[]): string[] {
	const out: string[] = [];
	ops.forEach((o, k) => {
		if (o.op === 'ok') return;
		const before = ops[k - 1]?.ref ?? '';
		const after = ops[k + 1]?.ref ?? '';
		const what = o.op === 'sub' ? `${o.ref}→${o.hyp}` : o.op === 'del' ? `-${o.ref}` : `+${o.hyp}`;
		out.push(`${before} [${what}] ${after}`.trim());
	});
	return out;
}
