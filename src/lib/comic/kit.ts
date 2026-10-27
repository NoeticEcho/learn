/**
 * The comic kit: what a lesson's strip may be composed of (docs/content-plan/README.md, «Комикс»).
 * Plain data, shared by the schema (build time) and the component (the browser), so the browser
 * bundle never imports zod.
 *
 * A panel is Эхо in one of its moods, on one side, beside at most one prop. The props are drawn
 * in `Prop.svelte` in the system's line language (brass strokes on ink, the echo light for what
 * is alive); a new one is a drawing there and a name here, never an image file.
 */
export const MOODS = ['idle', 'explain', 'hint', 'cheer', 'hmm'] as const;
export type Mood = (typeof MOODS)[number];

export const PROPS = [
	'crt', // 1991: a terminal, phosphor text
	'browser-1996', // a bevelled window, a table, a visitor counter
	'browser', // a window of today, an address bar
	'editor', // code on the left, its page on the right
	'phone',
	'server', // a rack
	'network', // nodes and links
	'flowchart', // boxes and arrows; the label's parts, split by «|», are the boxes
	'packets', // three numbered envelopes; the label's parts, split by spaces, are the numbers
	'envelope', // sealed
	'postcard', // open: anyone on the way can read it
	'lock',
	'certificate',
	'cards', // review cards
	'sheet' // a document: a brief, a file
] as const;
export type PropName = (typeof PROPS)[number];

/** Lengths the rail's panel holds without the strip outgrowing a laptop screen. */
export const LIMITS = {
	/** One speech line. */
	line: 120,
	/** Every line of one panel together. */
	panel: 170,
	/** The narration box at the panel's corner: a year, a place, «потом». */
	caption: 32,
	/** Text drawn on the prop (a screen, an address). Decoration: never the only place a fact is. */
	label: 28
} as const;

export type Line = { text: string; who?: string };
export type Panel = {
	mood: Mood;
	side: 'left' | 'right';
	era?: number;
	prop?: PropName;
	label?: string;
	caption?: string;
	say: string | Line[];
};
export type Comic = { era?: number; panels: Panel[] };

/** A panel's lines in one shape: a bare string is Эхо's one line. */
export const lines = (p: Pick<Panel, 'say'>): Line[] => (typeof p.say === 'string' ? [{ text: p.say }] : p.say);
