<!--
	«Блочная модель» (part 3, lesson 2). Sliders for content, padding, border and margin and a
	switch for box-sizing. The block drawn is a real element with those real styles, and the sums
	under it are the ones the browser does. With box-sizing: content-box the declared width is only
	the content, so padding and border are added on top; with border-box the declared width is the
	whole block and the content shrinks.
-->
<script lang="ts">
	import './shared.css';

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
	<figcaption>Из чего сделан блок</figcaption>
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
				<div class="content">Содержимое {content}px</div>
			</div>
		</div>
	</div>
	<ul class="legend">
		<li><span class="sw m"></span> margin: внешний отступ, ничего не закрашивает</li>
		<li><span class="sw b"></span> border: рамка</li>
		<li><span class="sw p"></span> padding: отступ внутри рамки</li>
		<li><span class="sw c"></span> содержимое</li>
	</ul>
	<p class="dg-out" aria-live="polite">
		Вы написали <span class="dg-mono">width: {width}px</span>
		{#if sizing === 'content-box'}
			и это ширина только содержимого. Блок целиком: {width} + 2×{padding} (padding) + 2×{border} (border) = <strong>{outer}px</strong>, а вместе с внешними отступами занимает в строке <strong>{total}px</strong>.
		{:else}
			и это ширина блока целиком: рамка и внутренний отступ уже в ней. Содержимому остаётся {width} − 2×{padding} − 2×{border} = <strong>{content}px</strong>, а вместе с внешними отступами блок занимает в строке <strong>{total}px</strong>.
		{/if}
	</p>
	<p class="dg-out">
		Поэтому в начале любого стилевого файла пишут <span class="dg-mono">box-sizing: border-box</span>: размер блока такой, как вы написали, и расчёты не удивляют.
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
