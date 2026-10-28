<!--
	«Площадка flexbox» (part 3, lesson 4). Five boxes in a flex container and a control for each
	property that matters: direction, justify-content, align-items, wrap and gap. The container is
	a real flex container with real styles, and the CSS that produces it is printed live under it.
	The two axes are named on the picture, because every flexbox mistake is a mistake about them.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			caption: 'Главная и поперечная оси',
			justify: 'justify-content (по главной оси)',
			align: 'align-items (по поперечной оси)',
			narrow: 'узкий контейнер',
			mainRow: 'слева направо',
			mainColumn: 'сверху вниз',
			reversed: ' наоборот'
		},
		en: {
			caption: 'The main axis and the cross axis',
			justify: 'justify-content (along the main axis)',
			align: 'align-items (along the cross axis)',
			narrow: 'narrow container',
			mainRow: 'left to right',
			mainColumn: 'top to bottom',
			reversed: ', reversed'
		}
	});

	const ru = pick({ ru: true, en: false });

	const dirs = ['row', 'row-reverse', 'column', 'column-reverse'];
	const justs = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'];
	const aligns = ['stretch', 'flex-start', 'center', 'flex-end'];
	let direction = $state('row');
	let justify = $state('flex-start');
	let align = $state('stretch');
	let wrap = $state(false);
	let gap = $state(8);
	let narrow = $state(false);

	const isRow = $derived(direction.startsWith('row'));
	const heights = [2.5, 4, 3, 5, 3.5];
	const css = $derived(
		`.menu {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  flex-wrap: ${wrap ? 'wrap' : 'nowrap'};\n  gap: ${gap}px;\n}`
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="grid">
		<div>
			<div class="dh">flex-direction</div>
			<div class="dg-ctl" role="group" aria-label="flex-direction">
				{#each dirs as v (v)}<button type="button" aria-pressed={direction === v} onclick={() => (direction = v)}>{v}</button>{/each}
			</div>
			<div class="dh">{W.justify}</div>
			<div class="dg-ctl" role="group" aria-label="justify-content">
				{#each justs as v (v)}<button type="button" aria-pressed={justify === v} onclick={() => (justify = v)}>{v}</button>{/each}
			</div>
			<div class="dh">{W.align}</div>
			<div class="dg-ctl" role="group" aria-label="align-items">
				{#each aligns as v (v)}<button type="button" aria-pressed={align === v} onclick={() => (align = v)}>{v}</button>{/each}
			</div>
			<div class="dg-ctl">
				<label><input type="checkbox" bind:checked={wrap} /> flex-wrap: wrap</label>
				<label><input type="checkbox" bind:checked={narrow} /> {W.narrow}</label>
				<label>gap: <strong>{gap}px</strong><input type="range" min="0" max="32" bind:value={gap} aria-label="gap" /></label>
			</div>
		</div>
		<pre class="dg-box dg-mono">{css}</pre>
	</div>
	<div class="arena" class:narrow style="--g: {gap}px">
		<div
			class="menu"
			style="flex-direction: {direction}; justify-content: {justify}; align-items: {align}; flex-wrap: {wrap ? 'wrap' : 'nowrap'}; gap: {gap}px; height: {isRow ? 'auto' : '18rem'}"
		>
			{#each heights as h, i (i)}
				<div class="item" style={align === 'stretch' ? (isRow ? 'min-height:2.5rem' : 'min-width:3rem') : isRow ? `height:${h}rem` : `width:${h + 2}rem`}>{i + 1}</div>
			{/each}
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if ru}
			Главная ось идёт {isRow ? W.mainRow : W.mainColumn}{direction.endsWith('reverse') ? W.reversed : ''}: по ней работает <span class="dg-mono">justify-content</span>. Поперечная ось перпендикулярна ей: по ней работает <span class="dg-mono">align-items</span>. Смените <span class="dg-mono">flex-direction</span>, и оси поменяются местами вместе со своими свойствами.
		{:else}
			The main axis runs {isRow ? W.mainRow : W.mainColumn}{direction.endsWith('reverse') ? W.reversed : ''}, and <span class="dg-mono">justify-content</span> does its work along it. The cross axis is perpendicular to it, and <span class="dg-mono">align-items</span> works along that one. Change <span class="dg-mono">flex-direction</span> and the axes swap places, together with the properties that follow them.
		{/if}
	</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	.dh {
		margin: var(--space-2) 0 var(--space-1);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
	}
	.arena {
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: #fbfaf7;
		border: var(--line) solid var(--border-hairline);
		overflow: auto;
	}
	.arena.narrow {
		max-width: 16rem;
	}
	.menu {
		display: flex;
		min-height: 6rem;
		outline: var(--line) dashed #8a5a2b;
	}
	.item {
		display: grid;
		place-items: center;
		min-width: 3.5rem;
		padding: 0 var(--space-3);
		background: #2f6fa8;
		color: #fff;
		font-weight: var(--weight-medium);
	}
</style>
