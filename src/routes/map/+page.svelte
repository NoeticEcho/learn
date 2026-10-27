<!--
	The concept map (spec §3.3). Parts are columns, lessons are nodes, and an SVG layer draws an
	edge from the lesson that teaches a concept to each lesson that needs it. The nodes are links
	in reading order ([part, order]), so the keyboard walks the course as it is meant to be read;
	the edges are drawn after layout, so the grid can reflow to one column on a phone.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t, pl, midSentence } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import { buildGraph, status, unmet, type LessonStatus } from '#lib/content/graph.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const cat = $derived(data.catalogue);
	const graph = $derived(buildGraph(cat.lessons, cat));
	let done = $state(new Set<string>());
	const conceptTitle = (id: string) => midSentence(cat.concepts.find((c) => c.id === id)?.title ?? id);
	const statusOf = (id: string): LessonStatus => status(graph, id, done);

	let host: HTMLDivElement;
	let edges = $state<{ d: string; key: string; from: string; to: string }[]>([]);
	// The lesson under the pointer or the focus: its edges and its neighbours light up, the rest
	// of the graph steps back. At rest every edge is a hairline, so 150 of them read as texture.
	let active = $state<string | null>(null);
	const near = $derived.by(() => {
		const out = new Set<string>();
		for (const e of edges) {
			if (e.from === active) out.add(e.to);
			if (e.to === active) out.add(e.from);
		}
		return out;
	});
	const track = (ev: Event) => {
		active = (ev.target as Element | null)?.closest?.('[data-node]')?.getAttribute('data-node') ?? null;
	};
	let size = $state({ w: 0, h: 0 });

	function draw() {
		if (!host) return;
		const box = host.getBoundingClientRect();
		size = { w: box.width, h: box.height };
		const out: { d: string; key: string; from: string; to: string }[] = [];
		// One edge per pair of lessons: a lesson may require two concepts the same lesson teaches,
		// and a repeated key in the keyed {#each} below throws (each_key_duplicate) and breaks the map.
		const seen = new Set<string>();
		for (const l of cat.lessons)
			for (const c of l.requires) {
				const from = graph.teaches.get(c);
				if (!from || seen.has(`${from}->${l.id}`)) continue;
				seen.add(`${from}->${l.id}`);
				const a = host.querySelector<HTMLElement>(`[data-node="${CSS.escape(from)}"]`);
				const b = host.querySelector<HTMLElement>(`[data-node="${CSS.escape(l.id)}"]`);
				if (!a || !b) continue;
				const ra = a.getBoundingClientRect(),
					rb = b.getBoundingClientRect();
				const sameRow = Math.abs(ra.top - rb.top) < ra.height;
				const [x1, y1, x2, y2] =
					sameRow || rb.left > ra.right
						? [ra.right - box.left, ra.top + ra.height / 2 - box.top, rb.left - box.left, rb.top + rb.height / 2 - box.top]
						: [ra.left + 12 - box.left, ra.bottom - box.top, rb.left + 12 - box.left, rb.top - box.top];
				const mx = (x1 + x2) / 2;
				const d = sameRow || rb.left > ra.right ? `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1 - 24},${(y1 + y2) / 2} ${x2 - 24},${(y1 + y2) / 2} ${x2},${y2}`;
				out.push({ d, key: `${from}->${l.id}`, from, to: l.id });
			}
		edges = out;
	}

	onMount(() => {
		const ro = new ResizeObserver(() => draw());
		ro.observe(host);
		import('#lib/learner.ts').then(async ({ done: get }) => {
			done = await get();
		});
		return () => ro.disconnect();
	});
</script>

<svelte:head><title>{t('map.title')}: {t('app.title')}</title></svelte:head>

<div class="container">
	<header class="head">
		<h1>{t('map.title')}</h1>
		<p class="lede">{t('map.lede')}</p>
		<ul class="legend">
			<li><span class="dot done" aria-hidden="true"></span>{t('map.legend.done')}</li>
			<li><span class="dot open" aria-hidden="true"></span>{t('map.legend.open')}</li>
			<li><span class="dot locked" aria-hidden="true"></span>{t('map.legend.locked')}</li>
		</ul>
	</header>

	<!-- The pointer and focus handlers only light the hovered lesson's edges; the lessons are links. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="map" class:tracing={!!active} bind:this={host} onpointerover={track} onfocusin={track} onpointerleave={() => (active = null)} onfocusout={() => (active = null)}>
		<svg class="edges" width={size.w} height={size.h} aria-hidden="true">
			{#each edges as e (e.key)}<path d={e.d} class:on={e.from === active || e.to === active} />{/each}
		</svg>
		{#each cat.parts as part (part.number)}
			{@const items = cat.lessons.filter((l) => l.part === part.number)}
			<section class="part" class:empty={!items.length} aria-labelledby="part-{part.number}">
				<h2 id="part-{part.number}"><span class="n">{part.number}</span> {part.title}</h2>
				<p class="summary">{part.summary}</p>
				{#if items.length}
					<ol>
						{#each items as l (l.id)}
							{@const s = statusOf(l.id)}
							<li>
								<a class="node {s}" class:near={near.has(l.id)} href={links.lesson(l.id)} data-node={l.id} data-testid="lesson-{l.id}" data-status={s}>
									<span class="title">{l.title}</span>
									<span class="meta">
										{#if s === 'done'}{t('map.status.done')}{:else if s === 'open'}{t('map.minutes', { n: l.minutes, minutes: pl(l.minutes, 'minute.forms') })}{:else}{t('map.status.locked', {
												needs: unmet(graph, l.id, done).map(conceptTitle).join(', ')
											})}{/if}
									</span>
								</a>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="soon">{t('map.empty')}</p>
				{/if}
			</section>
		{/each}
	</div>
</div>

<style>
	.head {
		padding-block: var(--space-8) var(--space-6);
	}
	h1 {
		font-size: var(--text-display);
		line-height: var(--lh-display);
		margin-bottom: var(--space-4);
		overflow-wrap: break-word;
		min-width: 0;
	}
	.lede {
		margin: 0 0 var(--space-5);
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.legend li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.dot {
		width: 10px;
		height: 10px;
		border: var(--line) solid var(--border-rule);
	}
	.dot.done {
		background: var(--accent-state);
		border-color: var(--accent-state);
	}
	.dot.open {
		border-color: var(--accent-measure);
	}
	.map {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: var(--space-7) var(--space-6);
	}
	.edges {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: visible;
	}
	.edges path {
		fill: none;
		stroke: var(--border-hairline);
		stroke-width: 1;
		transition: opacity var(--dur-micro) var(--ease-stop);
	}
	.tracing .edges path {
		opacity: 0.4;
	}
	.tracing .edges path.on {
		opacity: 1;
		stroke: var(--brass-500);
		stroke-width: 1.5;
	}
	.part {
		position: relative;
		min-width: 0;
	}
	h2 {
		font-size: var(--text-body-lg);
		line-height: 1.3;
		margin-bottom: var(--space-2);
		overflow-wrap: break-word;
		min-width: 0;
	}
	.n {
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
		margin-right: var(--space-1);
	}
	.summary {
		margin: 0 0 var(--space-4);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.empty h2 {
		color: var(--text-secondary);
	}
	.soon {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-muted);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}
	.node {
		position: relative;
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
		text-decoration: none;
		color: var(--text-primary);
		transition: border-color var(--dur-micro) var(--ease-stop);
	}
	.node:hover,
	.node.near {
		border-color: var(--border-brass);
	}
	.node.open {
		border-color: var(--accent-measure);
	}
	.node.done {
		border-color: var(--accent-state);
	}
	.node.locked .title {
		color: var(--text-secondary);
	}
	.meta {
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.node.done .meta {
		color: var(--accent-state-text);
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
	}
</style>
