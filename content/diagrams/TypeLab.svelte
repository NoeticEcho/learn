<!--
	«Лаборатория текста» (part 3, lesson 3). Two benches. The first sets a paragraph of the
	person's own text and lets them move the size, the line height and the width of the line, with
	the number of characters per line counted from the real text as the browser lays it out. The
	second is a contrast calculator: two colours in, the WCAG contrast ratio out, and whether the
	pair passes AA and AAA for normal and for large text. The arithmetic is WCAG's, written out.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			sample:
				'Пятнадцать лет измеряю землю и объясняю суду, где на самом деле проходит граница. Сначала инженер, потом юрист: поэтому вижу спор и в координатах, и в законе. Хорошая строка читается без усилий: глаз не теряет начало следующей.',
			tooShort: 'коротковата: глаз слишком часто прыгает на следующую строку',
			tooLong: 'слишком длинная: трудно найти начало следующей строки',
			comfortable: 'комфортная: от 45 до 80 знаков',
			pass: 'проходит',
			fail: 'не проходит',
			caption: 'Размер, интерлиньяж и ширина строки',
			size: 'Размер:',
			sizeLabel: 'Размер шрифта',
			leading: 'Интерлиньяж:',
			leadingLabel: 'Межстрочный интервал',
			measure: 'Ширина строки:',
			measureLabel: 'Ширина строки в знаках',
			font: 'Шрифт',
			serif: 'С засечками (Georgia)',
			sans: 'Без засечек (system-ui)',
			line: 'Строка',
			chars: 'знаков:',
			leadingTight: 'тесновато, строки слипаются',
			leadingLoose: 'слишком свободно, текст рассыпается',
			leadingGood: 'хорошо: примерно от 1,4 до 1,7',
			contrastHead: 'Контраст текста и фона',
			fgColour: 'Цвет текста',
			bgColour: 'Цвет фона',
			pairsLabel: 'Примеры пар',
			chip: 'Аа',
			on: 'на',
			demo: 'Так выглядит обычный текст этой пары цветов, а ниже крупный.',
			big: 'Крупный текст',
			contrast: 'Контраст:',
			to1: 'к 1',
			normal: 'Обычный текст:',
			large: 'Крупный текст (от 24px, или от 19px жирным):',
			hex: 'Цвет пишите шестью знаками, например #4a5560.'
		},
		en: {
			sample:
				'For fifteen years I have measured land and explained to courts where a boundary really runs. A surveyor first and a lawyer second, I see a dispute both in coordinates and in law. A good line reads without effort: the eye never loses the start of the next one.',
			tooShort: 'a little short, so the eye jumps to the next line too often',
			tooLong: 'too long, so it is hard to find the start of the next line',
			comfortable: 'comfortable, between 45 and 80 characters',
			pass: 'passes',
			fail: 'fails',
			caption: 'Size, line height and line length',
			size: 'Size:',
			sizeLabel: 'Font size',
			leading: 'Line height:',
			leadingLabel: 'Line height',
			measure: 'Line length:',
			measureLabel: 'Line length in characters',
			font: 'Typeface',
			serif: 'Serif (Georgia)',
			sans: 'Sans serif (system-ui)',
			line: 'A line of',
			chars: 'characters:',
			leadingTight: 'a little tight, the lines run together',
			leadingLoose: 'too loose, the text falls apart',
			leadingGood: 'good, roughly 1.4 to 1.7',
			contrastHead: 'Contrast of text and background',
			fgColour: 'Text color',
			bgColour: 'Background color',
			pairsLabel: 'Example pairs',
			chip: 'Aa',
			on: 'on',
			demo: 'This is how ordinary text looks in this pair of colors, and below it large text.',
			big: 'Large text',
			contrast: 'Contrast:',
			to1: 'to 1',
			normal: 'Normal text:',
			large: 'Large text (from 24px, or from 19px bold):',
			hex: 'Write the color with six digits, for example #4a5560.'
		}
	});

	let text = $state(W.sample);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.bio) text = p.bio + ' ' + (p.who ?? '');
		} catch {
			/* the example stays */
		}
	});

	let size = $state(18);
	let leading = $state(1.6);
	let measure = $state(65);
	let family = $state<'serif' | 'sans'>('serif');
	const fonts = { serif: 'Georgia, "Times New Roman", serif', sans: 'system-ui, -apple-system, "Segoe UI", sans-serif' };
	const verdict = $derived(measure < 45 ? W.tooShort : measure > 80 ? W.tooLong : W.comfortable);

	let fg = $state('#4a5560');
	let bg = $state('#ffffff');
	const lum = (hex: string) => {
		const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
		if (!m) return null;
		const n = parseInt(m[1], 16);
		const lin = (v: number) => {
			const x = v / 255;
			return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
		};
		return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
	};
	const ratio = $derived.by(() => {
		const a = lum(fg),
			b = lum(bg);
		if (a === null || b === null) return null;
		const [hi, lo] = a > b ? [a, b] : [b, a];
		return (hi + 0.05) / (lo + 0.05);
	});
	const ok = (min: number) => (ratio !== null && ratio >= min ? W.pass : W.fail);
	const pairs = [
		['#4a5560', '#ffffff'],
		['#8a8f94', '#ffffff'],
		['#1f2a33', '#f6f4ee'],
		['#ffffff', '#2b7a84'],
		['#e8ecf2', '#11161d']
	];
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="ctl">
		<label>{W.size} <strong>{size}px</strong><input type="range" min="14" max="26" bind:value={size} aria-label={W.sizeLabel} /></label>
		<label>{W.leading} <strong>{leading.toFixed(2)}</strong><input type="range" min="1" max="2" step="0.05" bind:value={leading} aria-label={W.leadingLabel} /></label>
		<label>{W.measure} <strong>{measure}ch</strong><input type="range" min="25" max="110" bind:value={measure} aria-label={W.measureLabel} /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.font}>
		<button type="button" aria-pressed={family === 'serif'} onclick={() => (family = 'serif')}>{W.serif}</button>
		<button type="button" aria-pressed={family === 'sans'} onclick={() => (family = 'sans')}>{W.sans}</button>
	</div>
	<div class="scroll">
		<p class="sample" style="font-family: {fonts[family]}; font-size: {size}px; line-height: {leading}; max-width: {measure}ch">{text}</p>
	</div>
	<p class="dg-out" aria-live="polite">{W.line} {measure} {W.chars} <strong>{verdict}</strong>. {W.leading} {leading < 1.3 ? W.leadingTight : leading > 1.8 ? W.leadingLoose : W.leadingGood}.</p>

	<div class="dh">{W.contrastHead}</div>
	<div class="ctl">
		<label>{W.fgColour} <input type="text" bind:value={fg} spellcheck="false" aria-label={W.fgColour} size="9" /></label>
		<label>{W.bgColour} <input type="text" bind:value={bg} spellcheck="false" aria-label={W.bgColour} size="9" /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.pairsLabel}>
		{#each pairs as [a, b] (a + b)}
			<button type="button" onclick={() => ((fg = a), (bg = b))}><span class="chip" style="color: {a}; background: {b}">{W.chip}</span> {a} {W.on} {b}</button>
		{/each}
	</div>
	<p class="demo" style="color: {fg}; background: {bg}">{W.demo}</p>
	<p class="demo big" style="color: {fg}; background: {bg}">{W.big}</p>
	{#if ratio !== null}
		<p class="dg-out" aria-live="polite">
			{W.contrast} <strong>{ratio.toFixed(2)} {W.to1}</strong>. {W.normal} AA {ok(4.5)}, AAA {ok(7)}. {W.large} AA {ok(3)}, AAA {ok(4.5)}.
		</p>
	{:else}
		<p class="dg-out" role="status">{W.hex}</p>
	{/if}
</figure>

<style>
	.ctl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-2) var(--space-4);
		margin-bottom: var(--space-3);
	}
	.ctl label {
		display: grid;
		gap: 0;
	}
	.scroll {
		overflow-x: auto;
		padding: var(--space-3);
		background: #fbfaf7;
		border: var(--line) solid var(--border-hairline);
	}
	.sample {
		margin: 0;
		color: #1f2a33;
	}
	.dh {
		margin: var(--space-5) 0 var(--space-3);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	input[type='text'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-family: var(--font-mono);
	}
	.chip {
		display: inline-block;
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		font-family: Georgia, serif;
	}
	.demo {
		margin: 0 0 var(--space-1);
		padding: var(--space-3);
	}
	.demo.big {
		font-size: 1.5rem;
	}
</style>
