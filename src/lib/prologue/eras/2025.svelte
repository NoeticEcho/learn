<!--
	2025: an AI builder. The person's answers become the prompt, and the page streams in beside
	it, a few characters at a time, as from a model. Under reduced motion it is there at once.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import type { FrameProps } from '../types.ts';
	let { brief, still = false }: FrameProps = $props();

	const pieces = $derived([brief.title, `${t('era.for')} ${brief.forWhom}`, brief.action]);
	const length = $derived(pieces.reduce((n, p) => n + p.length, 0));
	let shown = $state(Number.MAX_SAFE_INTEGER);

	onMount(() => {
		if (still) return;
		shown = 0;
		const step = Math.max(1, Math.ceil(length / 160));
		const id = setInterval(() => {
			shown += step;
			if (shown >= length) clearInterval(id);
		}, 28);
		return () => clearInterval(id);
	});

	const slice = (i: number) => {
		const before = pieces.slice(0, i).reduce((n, p) => n + p.length, 0);
		return pieces[i].slice(0, Math.max(0, shown - before));
	};
	const streaming = $derived(shown < length);
</script>

<div class="builder">
	<aside class="prompt">
		<p class="you">{t('era.2025.you')}</p>
		<p class="ask">{t('era.2025.prompt', { who: brief.title, forWhom: brief.forWhom, action: brief.action })}</p>
		<p class="status" class:streaming>{streaming ? t('era.2025.building') : t('era.2025.done')}</p>
	</aside>
	<div class="site">
		<h1>{slice(0)}</h1>
		<p class="lede">{slice(1)}</p>
		{#if slice(2)}<span class="action">{slice(2)}</span>{/if}
	</div>
</div>

<style>
	.builder {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.6fr);
		height: 100%;
		background: var(--ink-100);
		color: var(--text-body);
		font-family: var(--font-sans);
		overflow: hidden;
	}
	.prompt {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5);
		border-right: var(--line) solid var(--border-hairline);
		font-size: var(--text-body-sm);
	}
	.you {
		margin: 0;
		color: var(--text-secondary);
	}
	.ask {
		margin: 0;
		color: var(--text-primary);
		line-height: var(--lh-body-sm);
	}
	.status {
		margin: auto 0 0;
		color: var(--text-secondary);
	}
	.status.streaming {
		color: var(--echo-400);
	}
	.site {
		padding: var(--space-7) var(--space-6);
		background: var(--surface-canvas);
	}
	h1 {
		min-height: 1.1em;
		margin: 0 0 var(--space-4);
		font-size: var(--text-display-sm);
		line-height: 1.1;
		color: var(--text-primary);
		overflow-wrap: break-word;
		min-width: 0;
	}
	.lede {
		margin: 0 0 var(--space-5);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-body);
		max-width: 40ch;
	}
	.action {
		display: inline-flex;
		align-items: center;
		min-height: var(--hit-min);
		padding: 0 var(--space-5);
		background: var(--brass-fill);
		color: var(--text-on-brass);
		font-weight: var(--weight-medium);
		font-size: var(--text-body-sm);
	}
	@container prologue (max-width: 640px) {
		.builder {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
		.prompt {
			border-right: 0;
			border-bottom: var(--line) solid var(--border-hairline);
		}
		.site {
			padding: var(--space-5);
		}
	}
</style>
