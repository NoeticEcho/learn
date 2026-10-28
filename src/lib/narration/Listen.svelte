<!--
	«Слушать» (spec §4.9): shown only on a lesson whose every section has audio of its current text
	(narration.server.ts). The player itself is a chunk of its own, loaded on the first click, so a
	lesson that is only read pays for one button. The note that the voice is synthetic stays beside
	the button, before anyone presses it.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import type { Narration } from './types.ts';

	let { narration, lesson, title }: { narration: Narration; lesson: string; title: string } = $props();

	let Player = $state<Component<any> | null>(null);
	let open = $state(false);
	let loading = $state(false);
	const minutes = $derived(Math.max(1, Math.round(narration.duration / 60)));

	async function start() {
		if (open) return;
		loading = true;
		Player = (await import('./Player.svelte')).default;
		loading = false;
		open = true;
	}
</script>

<div class="listen" data-narration>
	<button type="button" class="secondary" onclick={start} disabled={loading} aria-expanded={open} aria-controls="narration-player">
		<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
		{t('narration.listen')}
		<span class="len">{t('narration.minutes', { n: minutes })}</span>
	</button>
	<p class="note">{t('narration.note')}</p>
</div>
{#if open && Player}
	<Player {narration} {lesson} {title} onclose={() => (open = false)} />
{/if}

<style>
	.listen {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-4);
		margin-top: var(--space-4);
	}
	.len {
		color: var(--text-secondary);
		font-weight: normal;
	}
	.note {
		margin: 0;
		max-width: 42ch;
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}
</style>
