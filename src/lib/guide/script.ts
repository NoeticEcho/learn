/**
 * The scripted guide (spec §4.5): offline, free, and it never improvises. Each lesson carries its
 * lines; this picks one for what just happened. A known mistake, keyed by the failed check,
 * beats a generic hint, and hints escalate by attempt and stop at the last.
 */
import type { GuideLines } from '#lib/content/schema.ts';

export type Mood = 'idle' | 'explain' | 'hint' | 'cheer' | 'hmm';
export type GuideEvent = { kind: 'enter' } | { kind: 'fail'; failed: string[]; attempt: number } | { kind: 'pass' };

export function nextLine(lines: GuideLines, event: GuideEvent): { text: string; mood: Mood } {
	switch (event.kind) {
		case 'enter':
			return { text: lines.intro, mood: 'explain' };
		case 'pass':
			return { text: lines.outro, mood: 'cheer' };
		case 'fail': {
			const known = event.failed.find((id) => lines.mistakes[id]);
			if (known) return { text: lines.mistakes[known], mood: 'hmm' };
			const i = Math.min(Math.max(event.attempt, 1), lines.hints.length) - 1;
			return { text: lines.hints[i], mood: 'hint' };
		}
	}
}
