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

	let text = $state('Пятнадцать лет измеряю землю и объясняю суду, где на самом деле проходит граница. Сначала инженер, потом юрист: поэтому вижу спор и в координатах, и в законе. Хорошая строка читается без усилий: глаз не теряет начало следующей.');
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
	const verdict = $derived(measure < 45 ? 'коротковата: глаз слишком часто прыгает на следующую строку' : measure > 80 ? 'слишком длинная: трудно найти начало следующей строки' : 'комфортная: от 45 до 80 знаков');

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
	const ok = (min: number) => (ratio !== null && ratio >= min ? 'проходит' : 'не проходит');
	const pairs = [
		['#4a5560', '#ffffff'],
		['#8a8f94', '#ffffff'],
		['#1f2a33', '#f6f4ee'],
		['#ffffff', '#2b7a84'],
		['#e8ecf2', '#11161d']
	];
</script>

<figure class="dg">
	<figcaption>Размер, интерлиньяж и ширина строки</figcaption>
	<div class="ctl">
		<label>Размер: <strong>{size}px</strong><input type="range" min="14" max="26" bind:value={size} aria-label="Размер шрифта" /></label>
		<label>Интерлиньяж: <strong>{leading.toFixed(2)}</strong><input type="range" min="1" max="2" step="0.05" bind:value={leading} aria-label="Межстрочный интервал" /></label>
		<label>Ширина строки: <strong>{measure}ch</strong><input type="range" min="25" max="110" bind:value={measure} aria-label="Ширина строки в знаках" /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Шрифт">
		<button type="button" aria-pressed={family === 'serif'} onclick={() => (family = 'serif')}>С засечками (Georgia)</button>
		<button type="button" aria-pressed={family === 'sans'} onclick={() => (family = 'sans')}>Без засечек (system-ui)</button>
	</div>
	<div class="scroll">
		<p class="sample" style="font-family: {fonts[family]}; font-size: {size}px; line-height: {leading}; max-width: {measure}ch">{text}</p>
	</div>
	<p class="dg-out" aria-live="polite">Строка {measure} знаков: <strong>{verdict}</strong>. Интерлиньяж: {leading < 1.3 ? 'тесновато, строки слипаются' : leading > 1.8 ? 'слишком свободно, текст рассыпается' : 'хорошо: примерно от 1,4 до 1,7'}.</p>

	<h4>Контраст текста и фона</h4>
	<div class="ctl">
		<label>Цвет текста <input type="text" bind:value={fg} spellcheck="false" aria-label="Цвет текста" size="9" /></label>
		<label>Цвет фона <input type="text" bind:value={bg} spellcheck="false" aria-label="Цвет фона" size="9" /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Примеры пар">
		{#each pairs as [a, b] (a + b)}
			<button type="button" onclick={() => ((fg = a), (bg = b))}><span class="chip" style="color: {a}; background: {b}">Аа</span> {a} на {b}</button>
		{/each}
	</div>
	<p class="demo" style="color: {fg}; background: {bg}">Так выглядит обычный текст этой пары цветов, а ниже крупный.</p>
	<p class="demo big" style="color: {fg}; background: {bg}">Крупный текст</p>
	{#if ratio !== null}
		<p class="dg-out" aria-live="polite">
			Контраст: <strong>{ratio.toFixed(2)} к 1</strong>. Обычный текст: AA {ok(4.5)}, AAA {ok(7)}. Крупный текст (от 24px, или от 19px жирным): AA {ok(3)}, AAA {ok(4.5)}.
		</p>
	{:else}
		<p class="dg-out" role="status">Цвет пишите шестью знаками, например #4a5560.</p>
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
	h4 {
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
