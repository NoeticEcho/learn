<!--
	«Блочная модель» (part 3, lesson 2). Sliders for content, padding, border and margin and a
	switch for box-sizing. The block drawn is a real element with those real styles, and the sums
	under it are the ones the browser does. With box-sizing: content-box the declared width is only
	the content, so padding and border are added on top; with border-box the declared width is the
	whole block and the content shrinks.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			caption: 'Из чего сделан блок',
			content: 'Содержимое',
			legendMargin: 'margin: внешний отступ, ничего не закрашивает',
			legendBorder: 'border: рамка',
			legendPadding: 'padding: отступ внутри рамки',
			legendContent: 'содержимое',
			youWrote: 'Вы написали',
			contentBox: (w: number, p: number, b: number, outer: number, total: number) =>
				`и это ширина только содержимого. Блок целиком: ${w} + 2×${p} (padding) + 2×${b} (border) = <strong>${outer}px</strong>, а вместе с внешними отступами занимает в строке <strong>${total}px</strong>.`,
			borderBox: (w: number, p: number, b: number, content: number, total: number) =>
				`и это ширина блока целиком: рамка и внутренний отступ уже в ней. Содержимому остаётся ${w} − 2×${p} − 2×${b} = <strong>${content}px</strong>, а вместе с внешними отступами блок занимает в строке <strong>${total}px</strong>.`,
			therefore: 'Поэтому в начале любого стилевого файла пишут',
			therefore2: ': размер блока такой, как вы написали, и расчёты не удивляют.'
		},
		en: {
			caption: 'What a block is made of',
			content: 'Content',
			legendMargin: 'margin: the outer space, which paints nothing',
			legendBorder: 'border: the frame',
			legendPadding: 'padding: the space inside the frame',
			legendContent: 'the content',
			youWrote: 'You wrote',
			contentBox: (w: number, p: number, b: number, outer: number, total: number) =>
				`and that is the width of the content alone. The whole block is ${w} + 2×${p} (padding) + 2×${b} (border) = <strong>${outer}px</strong>, and with its margins it takes <strong>${total}px</strong> of the line.`,
			borderBox: (w: number, p: number, b: number, content: number, total: number) =>
				`and that is the width of the whole block: the border and the padding are already inside it. What is left for the content is ${w} − 2×${p} − 2×${b} = <strong>${content}px</strong>, and with its margins the block takes <strong>${total}px</strong> of the line.`,
			therefore: 'That is why every stylesheet starts with',
			therefore2: ': the block is the size you wrote, and the sums hold no surprises.'
		}
	});

	let width = $state(240);
	let padding = $state(16);
	let border = $state(4);
	let margin = $state(16);
	let sizing = $state<'content-box' | 'border-box'>('content-box');

	const outer = $derived(sizing === 'content-box' ? width + 2 * padding + 2 * border : width);
	const content = $derived(sizing === 'content-box' ? width : Math.max(0, width - 2 * padding - 2 * border));
	const total = $derived(outer + 2 * margin);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="ctl">
		<label>width: <strong>{width}px</strong><input type="range" min="120" max="320" bind:value={width} aria-label="width" /></label>
		<label>padding: <strong>{padding}px</strong><input type="range" min="0" max="40" bind:value={padding} aria-label="padding" /></label>
		<label>border: <strong>{border}px</strong><input type="range" min="0" max="20" bind:value={border} aria-label="border" /></label>
		<label>margin: <strong>{margin}px</strong><input type="range" min="0" max="40" bind:value={margin} aria-label="margin" /></label>
	</div>
	<div class="dg-ctl" role="group" aria-label="box-sizing">
		<button type="button" aria-pressed={sizing === 'content-box'} onclick={() => (sizing = 'content-box')}>box-sizing: content-box</button>
		<button type="button" aria-pressed={sizing === 'border-box'} onclick={() => (sizing = 'border-box')}>box-sizing: border-box</button>
	</div>
	<div class="stage">
		<div class="margin" style="padding: {margin}px">
			<div class="box" style="width: {width}px; padding: {padding}px; border-width: {border}px; box-sizing: {sizing}">
				<div class="content">{W.content} {content}px</div>
			</div>
		</div>
	</div>
	<ul class="legend">
		<li><span class="sw m"></span> {W.legendMargin}</li>
		<li><span class="sw b"></span> {W.legendBorder}</li>
		<li><span class="sw p"></span> {W.legendPadding}</li>
		<li><span class="sw c"></span> {W.legendContent}</li>
	</ul>
	<p class="dg-out" aria-live="polite">
		{W.youWrote} <span class="dg-mono">width: {width}px</span>
		{#if sizing === 'content-box'}
			{@html W.contentBox(width, padding, border, outer, total)}
		{:else}
			{@html W.borderBox(width, padding, border, content, total)}
		{/if}
	</p>
	<p class="dg-out">
		{W.therefore} <span class="dg-mono">box-sizing: border-box</span>{W.therefore2}
	</p>
</figure>

<style>
	.ctl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--space-2) var(--space-4);
		margin-bottom: var(--space-3);
	}
	.ctl label {
		display: grid;
		gap: 0;
	}
	.stage {
		overflow-x: auto;
		padding: var(--space-2) 0;
	}
	.margin {
		display: inline-block;
		background: color-mix(in srgb, #d9822b 30%, transparent);
		outline: var(--line) dashed #d9822b;
	}
	.box {
		background: color-mix(in srgb, #3f8f5a 35%, transparent);
		border-style: solid;
		border-color: #8a5a2b;
	}
	.content {
		background: color-mix(in srgb, #3b7fd1 40%, transparent);
		color: var(--text-primary);
		padding: var(--space-2) 0;
		text-align: center;
		font-size: 0.82rem;
	}
	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-4);
		margin: var(--space-3) 0 0;
		padding: 0 !important;
		font-size: 0.85rem;
	}
	.sw {
		display: inline-block;
		width: 0.9rem;
		height: 0.9rem;
		margin-right: var(--space-1);
		vertical-align: -0.1rem;
	}
	.sw.m {
		background: color-mix(in srgb, #d9822b 40%, transparent);
	}
	.sw.b {
		background: #8a5a2b;
	}
	.sw.p {
		background: color-mix(in srgb, #3f8f5a 50%, transparent);
	}
	.sw.c {
		background: color-mix(in srgb, #3b7fd1 50%, transparent);
	}
</style>
