/**
 * The Open Graph images: a 1200 × 630 card per lesson, for the home and for the map, drawn at
 * build time and served as static files (`/og/<name>-<hash>.png`, routes/og). There is no image
 * service: the prerender calls `render`, which lays the card out with satori (text set in the
 * course's own Literata and IBM Plex Sans, from design/fonts) and rasterises it with resvg.
 *
 * Why it is shaped this way:
 * - **The name carries a hash of what is drawn** (the card's text, the template's version, the
 *   mascot's and the tokens' source). A messenger caches a preview by its image URL for days;
 *   a new URL is the only reliable way to make Telegram or VK fetch a new picture.
 * - **Rendered PNGs are cached in `.cache/og/` by that name**, so a rebuild draws only the cards
 *   whose content changed. A cold build draws all of them, in about a tenth of a second each.
 * - **The colours are read from design/tokens.css**, the Ink theme (the app's default), so the
 *   card is the app's visual language rather than a copy of it that drifts.
 * - **Эхо is design/mascot/echo.svg made static**: resvg resolves neither `var()` nor CSS
 *   animation, so the custom properties are replaced by their fallbacks, the era's dot is lit
 *   inline, and the mood's display rules are applied as the file's own `<style>` says.
 * - **PNG, under 300 KB**: WhatsApp drops a preview whose image is larger, and flat colour keeps
 *   a card near 60 KB. The unit test holds the limit.
 *
 * Build-time only (the `.server` suffix): satori and resvg never reach the browser bundle.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import wawoff2 from 'wawoff2';
import type { Locale } from '#lib/i18n/index.ts';
import { SITE_NAMES, eraLabel } from './site.ts';

/** Bump when the template's drawing changes, so every card gets a new URL. */
const TEMPLATE = 2;
export const OG_SIZE = { width: 1200, height: 630 } as const;

export type Mood = 'idle' | 'explain' | 'hint' | 'cheer' | 'hmm';

export type OgCard = {
	/** The file's readable stem: `home`, `map`, `lesson-02-html-01-first-page`. */
	stem: string;
	/** The line above the title: «Часть 2. HTML». */
	kicker: string;
	title: string;
	/** The line under the title: «Урок 1, 25 минут». */
	meta?: string;
	era: number | null;
	mood: Mood;
	/** What the picture shows, for og:image:alt. */
	alt: string;
	/** The edition the card is for: its brand and its address. Russian when absent. */
	lang?: Locale;
};

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p));

let sources: { echo: string; tokens: string } | undefined;
const source = () => (sources ??= { echo: read('design/mascot/echo.svg').toString(), tokens: read('design/tokens.css').toString() });

/** The file name for a card: its stem and a hash of everything that is drawn. */
export function ogFile(card: OgCard): string {
	const { echo, tokens } = source();
	const hash = createHash('sha256')
		.update(JSON.stringify({ TEMPLATE, card: { ...card, alt: undefined }, echo, tokens }))
		.digest('hex')
		.slice(0, 10);
	return `${card.stem}-${hash}.png`;
}

/** The Ink theme's tokens: the first `:root` block of design/tokens.css, `var()` resolved. */
function palette(): (name: string) => string {
	const css = source().tokens;
	const block = css.slice(0, css.indexOf('}'));
	const vars = new Map<string, string>();
	for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
	const get = (name: string, depth = 0): string => {
		const v = vars.get(name);
		if (!v) throw new Error(`og: no token ${name} in design/tokens.css`);
		const ref = v.match(/^var\((--[a-z0-9-]+)\)$/);
		return ref && depth < 8 ? get(ref[1], depth + 1) : v;
	};
	return get;
}

/**
 * echo.svg as a static picture of one mood and one era: custom properties replaced by their
 * values, animation dropped (the still pose the file shows under reduced motion), the era's dot
 * lit inline, and the echo waves drawn at rest so the mark reads as an echo.
 */
export function staticEcho(era: number | null, mood: Mood): string {
	let svg = source().echo;
	svg = svg.replace(/var\(--[a-z0-9-]+,\s*(#[0-9A-Fa-f]{3,8})\)/g, '$1');
	const local = new Map<string, string>();
	for (const m of svg.matchAll(/(--e-[a-z0-9]+)\s*:\s*(#[0-9A-Fa-f]{3,8})/g)) local.set(m[1], m[2]);
	svg = svg.replace(/var\((--e-[a-z0-9]+)\)/g, (_, n: string) => local.get(n) ?? '#000');
	svg = svg
		.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
		.replace(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
		.replace(/\s*(animation|transition|transform)(-[a-z]+)?\s*:[^;}]+;?/g, '')
		.replace(/<title[^>]*>.*?<\/title>/s, '')
		.replace(/<svg [^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" class="echo mood-${mood}${era ? ` era-${era}` : ''}">`);
	if (era) svg = svg.replace(new RegExp(`(<circle class="era e${era}"[^>]*?) r="3"`), `$1 r="4.5" style="fill:${local.get('--e-echo')}"`);
	// At rest, the waves are invisible (opacity 0 until the animation runs): draw them faintly.
	svg = svg.replace(/class="wave w1"/g, 'class="wave w1" style="opacity:.5"').replace(/class="wave w2"/g, 'class="wave w2" style="opacity:.25"');
	// The moods' transforms are CSS (dropped above, resvg does not apply them): attributes instead.
	if (mood === 'explain') svg = svg.replace('<g class="eyes">', '<g class="eyes" transform="translate(3 0)">');
	if (mood === 'hmm') svg = svg.replace('<g class="figure">', '<g class="figure" transform="rotate(-6 80 124)">').replace(/(<ellipse class="eye [a-z]+"[^>]*?) ry="4.4"/g, '$1 ry="2.2"');
	return svg;
}

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown; [k: string]: unknown } };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
	type,
	props: { style, children: children.length === 1 ? children[0] : children }
});

let fonts: Promise<{ name: string; data: ArrayBuffer; weight: 400 | 500; style: 'normal' }[]> | undefined;
async function loadFonts() {
	const faces: [string, string, 400 | 500][] = [
		// Each subset is a family of its own, and the card names both (SERIF, SANS): satori matches
		// a family by name and then falls back along the list for a glyph the first lacks.
		['Literata Latin', 'literata-500-latin.woff2', 500],
		['Literata Cyrillic', 'literata-500-cyrillic.woff2', 500],
		['Plex Latin', 'ibm-plex-sans-400-latin.woff2', 400],
		['Plex Cyrillic', 'ibm-plex-sans-400-cyrillic.woff2', 400]
	];
	const out: { name: string; data: ArrayBuffer; weight: 400 | 500; style: 'normal' }[] = [];
	// One at a time, copied at once: the result is a view into the decoder's memory, which the
	// next call overwrites (in parallel, every face came back as the last one's bytes).
	for (const [name, file, weight] of faces) {
		const ttf = await wawoff2.decompress(read(`design/fonts/${file}`));
		out.push({ name, data: defaultInstance(new Uint8Array(ttf)), weight, style: 'normal' as const });
	}
	return out;
}

/**
 * The variable font's default instance, as a static font: the same file without its variation
 * tables. satori's font parser fails on these files' `fvar`, and its glyph outlines (`glyf`) are
 * the default instance already, so dropping the tables is all an instancer would do at the
 * default. The weights the card asks for (400, 500) are drawn at that default.
 */
export function defaultInstance(font: Uint8Array): ArrayBuffer {
	const drop = new Set(['fvar', 'gvar', 'avar', 'STAT', 'HVAR', 'VVAR', 'MVAR', 'cvar']);
	const v = new DataView(font.buffer, font.byteOffset, font.byteLength);
	const tables = [];
	for (let i = 0, n = v.getUint16(4); i < n; i++) {
		const at = 12 + i * 16;
		const tag = String.fromCharCode(...font.subarray(at, at + 4));
		if (!drop.has(tag)) tables.push({ at, offset: v.getUint32(at + 8), length: v.getUint32(at + 12) });
	}
	const pad = (n: number) => (n + 3) & ~3;
	let size = 12 + tables.length * 16;
	for (const t of tables) size += pad(t.length);
	const out = new Uint8Array(size);
	const o = new DataView(out.buffer);
	out.set(font.subarray(0, 4));
	const n = tables.length;
	const sr = 2 ** Math.floor(Math.log2(n)) * 16;
	o.setUint16(4, n);
	o.setUint16(6, sr);
	o.setUint16(8, Math.floor(Math.log2(n)));
	o.setUint16(10, n * 16 - sr);
	let data = 12 + n * 16;
	tables.forEach((t, i) => {
		out.set(font.subarray(t.at, t.at + 8), 12 + i * 16); // tag and checksum
		o.setUint32(12 + i * 16 + 8, data);
		o.setUint32(12 + i * 16 + 12, t.length);
		out.set(font.subarray(t.offset, t.offset + t.length), data);
		data += pad(t.length);
	});
	return out.buffer;
}

const SERIF = "'Literata Latin', 'Literata Cyrillic'";
const SANS = "'Plex Latin', 'Plex Cyrillic'";

/** The title's size, by its length: three lines at most at the largest that fits. */
const titleSize = (t: string) => (t.length <= 34 ? 76 : t.length <= 56 ? 66 : t.length <= 80 ? 58 : 50);

/** Draws the card. Deterministic: the same card gives the same bytes. */
export async function renderCard(card: OgCard): Promise<Buffer> {
	const c = palette();
	const echo = `data:image/svg+xml;base64,${Buffer.from(staticEcho(card.era, card.mood)).toString('base64')}`;
	const era = eraLabel(card.era, card.lang);
	const lang = card.lang ?? 'ru';
	const tree = h(
		'div',
		{
			width: '100%',
			height: '100%',
			display: 'flex',
			position: 'relative',
			backgroundColor: c('--ink-000'),
			backgroundImage: `radial-gradient(circle at 82% 50%, ${c('--ink-200')} 0%, ${c('--ink-000')} 46%)`,
			fontFamily: SANS,
			color: c('--ash-300')
		},
		h('div', { position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, display: 'flex', border: `1px solid ${c('--brass-900')}` }),
		h(
			'div',
			{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 780, padding: '76px 0 72px 84px' },
			h(
				'div',
				{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 28, color: c('--ash-400') },
				h('div', { display: 'flex' }, card.kicker),
				...(era
					? [h('div', { display: 'flex', padding: '2px 16px', border: `1.5px solid ${c('--brass-700')}`, borderRadius: 999, color: c('--brass-500'), fontSize: 24 }, era)]
					: [])
			),
			h(
				'div',
				{ display: 'flex', flexDirection: 'column', gap: 24 },
				h(
					'div',
					{ display: 'block', fontFamily: SERIF, fontSize: titleSize(card.title), lineHeight: 1.08, color: c('--paper-100'), lineClamp: 4 },
					card.title
				),
				...(card.meta ? [h('div', { display: 'flex', fontSize: 28, color: c('--ash-300') }, card.meta)] : [])
			),
			h(
				'div',
				{ display: 'flex', alignItems: 'baseline', gap: 24 },
				h('div', { display: 'flex', fontFamily: SERIF, fontSize: 36, color: c('--brass-300') }, SITE_NAMES[lang]),
				h('div', { display: 'flex', fontSize: 22, color: c('--ash-400') }, lang === 'en' ? 'open.noeticecho.space/learn/en' : 'open.noeticecho.space/learn')
			)
		),
		h(
			'div',
			{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 420, paddingRight: 40 },
			{ type: 'img', props: { src: echo, width: 380, height: 380, style: { width: 380, height: 380 } } }
		)
	);
	const svg = await satori(tree as never, { ...OG_SIZE, fonts: await (fonts ??= loadFonts()) });
	return new Resvg(svg, { fitTo: { mode: 'width', value: OG_SIZE.width }, font: { loadSystemFonts: false } }).render().asPng();
}

const cacheDir = join(root, '.cache', 'og');

/** The card's PNG, from `.cache/og/` when this exact card was drawn before. */
export async function ogPng(card: OgCard): Promise<Buffer> {
	const file = join(cacheDir, ogFile(card));
	if (existsSync(file)) return readFileSync(file);
	const png = await renderCard(card);
	mkdirSync(cacheDir, { recursive: true });
	writeFileSync(file, png);
	return png;
}
