<!--
	«Площадка grid» (part 3, lesson 5). Two benches on real grid containers. The first changes the
	columns of a set of cards (three equal columns, 2fr and 1fr, or auto-fit with minmax) while a
	slider narrows the container, so the difference between fixed and self-adjusting columns shows
	itself. The second lays a page out by named areas, wide and narrow, with the CSS printed live.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			caption: 'Колонки: фиксированные и подбираемые',
			autoName: 'auto-fit и minmax',
			width: 'Ширина контейнера',
			areas: 'Макет страницы по областям',
			layout: 'Макет',
			wide: 'широкий',
			narrow: 'узкий'
		},
		en: {
			caption: 'Columns: fixed and self-adjusting',
			autoName: 'auto-fit and minmax',
			width: 'Container width',
			areas: 'A page layout by named areas',
			layout: 'Layout',
			wide: 'wide',
			narrow: 'narrow'
		}
	});
	const ru = pick({ ru: true, en: false });

	const cols = [
		{ name: 'repeat(3, 1fr)', css: 'repeat(3, 1fr)' },
		{ name: '2fr 1fr', css: '2fr 1fr' },
		{ name: W.autoName, css: 'repeat(auto-fit, minmax(9rem, 1fr))' }
	];
	let sel = $state(2);
	let width = $state(100);
	let gap = $state(12);

	const layouts = {
		wide: { name: W.wide, areas: '"header header" "main aside" "footer footer"', columns: '2fr 1fr' },
		narrow: { name: W.narrow, areas: '"header" "main" "aside" "footer"', columns: '1fr' }
	} as const;
	let layout = $state<keyof typeof layouts>('wide');
	const l = $derived(layouts[layout]);
	const code = $derived(`.page {\n  display: grid;\n  grid-template-columns: ${l.columns};\n  grid-template-areas:\n    ${l.areas.replace(/" "/g, '"\n    "')};\n  gap: ${gap}px;\n}`);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label="grid-template-columns">
		{#each cols as c, i (c.name)}<button type="button" aria-pressed={sel === i} onclick={() => (sel = i)}>{c.name}</button>{/each}
	</div>
	<div class="dg-ctl">
		<label>{W.width}: <strong>{width}%</strong><input type="range" min="30" max="100" bind:value={width} aria-label={W.width} /></label>
		<label>gap: <strong>{gap}px</strong><input type="range" min="0" max="32" bind:value={gap} aria-label="gap" /></label>
	</div>
	<div class="arena">
		<div class="cards" style="grid-template-columns: {cols[sel].css}; gap: {gap}px; width: {width}%">
			{#each [1, 2, 3, 4, 5, 6] as n (n)}<div class="cell">{n}</div>{/each}
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if ru}
			{#if sel === 2}
				Число колонок подбирается само: на широком экране их несколько, на узком одна, и ни одного медиазапроса. <span class="dg-mono">minmax(9rem, 1fr)</span> значит «не уже 9rem, но растянись на свободное место».
			{:else if sel === 0}
				Три колонки остаются тремя при любой ширине: на узком экране они сожмутся до нечитаемого. Для такой сетки нужен медиазапрос.
			{:else}
				Две колонки, вторая вдвое уже: <span class="dg-mono">fr</span> это доля свободного места.
			{/if}
		{:else if sel === 2}
			The number of columns adjusts itself: several on a wide screen, one on a narrow one, and not a single media query. <span class="dg-mono">minmax(9rem, 1fr)</span> means “no narrower than 9rem, but stretch to fill the free space”.
		{:else if sel === 0}
			Three columns stay three at any width, so on a narrow screen they shrink until they can’t be read. A grid like this needs a media query.
		{:else}
			Two columns, the second half as wide: <span class="dg-mono">fr</span> is a share of the free space.
		{/if}
	</p>

	<div class="dh">{W.areas}</div>
	<div class="dg-ctl" role="group" aria-label={W.layout}>
		{#each Object.entries(layouts) as [k, v] (k)}<button type="button" aria-pressed={layout === k} onclick={() => (layout = k as keyof typeof layouts)}>{v.name}</button>{/each}
	</div>
	<div class="cols">
		<pre class="dg-box dg-mono">{code}</pre>
		<div class="arena">
			<div class="page" style="grid-template-columns: {l.columns}; grid-template-areas: {l.areas}; gap: {gap}px">
				<div class="b h">header</div>
				<div class="b m">main</div>
				<div class="b a">aside</div>
				<div class="b f">footer</div>
			</div>
		</div>
	</div>
</figure>

<style>
	.dh {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.arena {
		padding: var(--space-3);
		background: #fbfaf7;
		border: var(--line) solid var(--border-hairline);
		overflow: auto;
	}
	.cards,
	.page {
		display: grid;
	}
	.cell,
	.b {
		display: grid;
		place-items: center;
		min-height: 3rem;
		background: #2f6fa8;
		color: #fff;
		font-weight: var(--weight-medium);
	}
	.h {
		grid-area: header;
		background: #8a5a2b;
	}
	.m {
		grid-area: main;
		min-height: 5rem;
	}
	.a {
		grid-area: aside;
		background: #2f7a4a;
	}
	.f {
		grid-area: footer;
		background: #8a5a2b;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-3);
		align-items: start;
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
	}
</style>
