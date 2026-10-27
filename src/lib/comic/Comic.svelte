<!--
	The lesson's comic (docs/content-plan/README.md, «Комикс»): two to four panels in which Эхо
	carries the lesson's one idea. On a wide screen it is the rail beside the theory, sticky while
	the theory scrolls; below 1100 px it is a strip under the lesson's header that scrolls sideways.

	The words are real text: a caption and one or two speech lines per panel, in an ordered list,
	each line named for who says it. The drawing is aria-hidden, so nothing may live only in it.
	Эхо is the approved mascot (design/mascot/echo.svg), inlined still: a panel is a frame, and a
	breathing figure beside text being read is a distraction. The one motion is the panels'
	arrival, and only for a person who has not asked for less motion.
-->
<script lang="ts">
	import raw from '../../../design/mascot/echo.svg?raw';
	import Prop from './Prop.svelte';
	import { lines, type Comic } from './kit.ts';
	import { t } from '#lib/i18n/index.ts';

	type Props = { comic: Comic; era?: number | null };
	let { comic, era = null }: Props = $props();

	const uid = $props.id();
	// The mascot's inside, without its own <svg> (the panel nests it) or its <title> (aria-hidden).
	const inner = raw
		.replace(/^[\s\S]*?<svg[^>]*>/, '')
		.replace(/<\/svg>\s*$/, '')
		.replace(/<title[\s\S]*?<\/title>/, '');
	const echo = (i: number) => inner.replaceAll('echo-glow', `${uid}-glow-${i}`);

	let strip = $state<HTMLElement>();
	let scrolls = $state(false);
	let height = $state(0);

	// A scroller needs a tab stop (WCAG 2.1.1); a rail that does not scroll should not have one.
	// The rail's height feeds its sticky offset, so a rail taller than the screen scrolls with
	// the text until its last panel shows, and stays there.
	$effect(() => {
		const el = strip;
		if (!el) return;
		const measure = () => {
			scrolls = el.scrollWidth > el.clientWidth + 1;
			height = el.offsetHeight;
		};
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	});
</script>

<aside class="comic" aria-labelledby="{uid}-h" style:--rail-h="{height}px">
	<h2 id="{uid}-h" class="visually-hidden">{t('comic.label')}</h2>
	<!-- A sideways scroller is reached by keyboard only through a tab stop (axe: scrollable-region-focusable). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<ol class="strip" bind:this={strip} tabindex={scrolls ? 0 : undefined} aria-labelledby={scrolls ? `${uid}-h` : undefined}>
		{#each comic.panels as p, i (i)}
			{@const said = lines(p)}
			{@const ring = p.era ?? comic.era ?? era}
			<li class="panel" style:--i={i}>
				{#if p.caption}<p class="caption">{p.caption}</p>{/if}
				<div class="words">
					{#each said as l, j (j)}
						<p class={['bubble', l.who ? 'prop' : 'echo', !p.prop ? 'at-center' : (l.who ? p.side === 'left' : p.side === 'right') ? 'at-right' : 'at-left']}>
							<span class="visually-hidden">{`${l.who ?? t('comic.echo')}: `}</span>{l.text}
						</p>
					{/each}
				</div>
				<svg class="scene" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
					<svg
						x={!p.prop ? 80 : p.side === 'left' ? -4 : 164}
						y="-6"
						width="160"
						height="160"
						viewBox="0 0 160 160"
						class={['echo', `mood-${p.mood}`, ring && `era-${ring}`]}
						overflow="visible">{@html echo(i)}</svg
					>
					{#if p.prop}
						<g transform="translate({p.side === 'left' ? 162 : 8} 14)"><Prop name={p.prop} label={p.label} /></g>
					{/if}
				</svg>
			</li>
		{/each}
	</ol>
</aside>

<style>
	.comic {
		min-width: 0;
	}
	.strip {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-4);
	}
	.panel {
		position: relative;
		display: grid;
		align-content: start;
		padding: var(--space-3) var(--space-3) 0;
		border: var(--line) solid var(--border-rule);
		background: var(--surface-body);
		overflow: hidden;
	}
	.caption {
		justify-self: start;
		margin: 0 0 var(--space-2);
		padding: var(--space-1) var(--space-2);
		/* The canvas, not the inset: secondary text holds 4.5:1 on it in both themes (on Paper's
		   inset it is 4.0:1). */
		background: var(--surface-canvas);
		color: var(--text-secondary);
		font-size: var(--text-caption);
		line-height: var(--lh-caption);
		font-variant-numeric: tabular-nums;
	}
	.words {
		display: grid;
		gap: var(--space-2);
		position: relative;
		z-index: 1;
	}
	.bubble {
		position: relative;
		max-width: 92%;
		margin: 0 0 var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-panel-solid);
		color: var(--text-primary);
		font-family: var(--font-serif);
		font-size: var(--text-body-sm);
		line-height: var(--lh-body-sm);
		text-wrap: pretty;
	}
	/* Эхо's voice is edged in its own light; a prop's in the plain rule. */
	.bubble.echo {
		border-color: var(--accent-echo);
	}
	.bubble.prop {
		font-family: var(--font-sans);
	}
	.at-right {
		justify-self: end;
	}
	.at-left {
		justify-self: start;
	}
	/* Эхо alone in a panel stands in its middle, and speaks from there. */
	.at-center {
		justify-self: center;
		text-align: center;
	}
	/* The tail points down at the speaker: Эхо's head sits a quarter in from its side. */
	.bubble::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-2) / 2 - 1px);
		width: var(--space-2);
		height: var(--space-2);
		background: inherit;
		border-right: inherit;
		border-bottom: inherit;
		transform: rotate(45deg);
	}
	.at-left::after {
		left: var(--space-7);
	}
	.at-right::after {
		right: var(--space-7);
	}
	.at-center::after {
		left: calc(50% - var(--space-2) / 2);
	}
	.scene {
		display: block;
		width: calc(100% + 2 * var(--space-3));
		margin: calc(-1 * var(--space-4)) calc(-1 * var(--space-3)) 0;
		height: auto;
		aspect-ratio: 320 / 150;
	}
	/* Still: the mascot's idle motion stays in the guide, where Эхо is talking to you. */
	.scene :global(.echo),
	.scene :global(.echo *) {
		animation: none !important;
		transition: none !important;
	}

	@media (prefers-reduced-motion: no-preference) {
		.panel {
			animation: comic-in var(--dur-ui) var(--ease-emerge) both;
			animation-delay: calc(var(--i) * 120ms + 150ms);
		}
	}
	@keyframes comic-in {
		from {
			opacity: 0;
			transform: translateY(var(--space-2));
		}
	}

	/* Wide: the rail beside the theory. Sticky; a rail taller than the screen offsets its top so
	   its last panel reaches the screen's foot and stays. */
	@media (min-width: 1100px) {
		.comic {
			position: sticky;
			top: min(var(--space-6), calc(100dvh - var(--rail-h, 0px) - var(--space-6)));
			align-self: start;
		}
	}

	/* Narrow: a strip under the header, a panel and a peek of the next, scrolled sideways. */
	@media (max-width: 1099.98px) {
		/* The strip runs to the screen's edges, so the peek of the next panel reads as «more». */
		.strip {
			--bleed: clamp(var(--space-4), 4vw, var(--space-7));
			margin-inline: calc(-1 * var(--bleed));
			padding-inline: var(--bleed);
			scroll-padding-inline: var(--bleed);
			display: flex;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			overscroll-behavior-x: contain;
			scrollbar-width: thin;
			padding-bottom: var(--space-2);
		}
		.panel {
			flex: 0 0 min(19rem, 84%);
			scroll-snap-align: start;
		}
	}
</style>
