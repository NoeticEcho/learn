<!-- «Скачать курс целиком» (spec §4.8): asks the service worker to cache every page, and reports progress. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/index.ts';

	let phase = $state<'idle' | 'busy' | 'done' | 'unsupported'>('idle');
	let done = $state(0);
	let total = $state(0);

	onMount(() => {
		if (!('serviceWorker' in navigator)) {
			phase = 'unsupported';
			return;
		}
		const onMessage = (e: MessageEvent) => {
			if (e.data?.type === 'cache-progress') ({ done, total } = e.data);
			if (e.data?.type === 'cache-done') phase = 'done';
		};
		navigator.serviceWorker.addEventListener('message', onMessage);
		return () => navigator.serviceWorker.removeEventListener('message', onMessage);
	});

	async function start() {
		phase = 'busy';
		const reg = await navigator.serviceWorker.ready;
		reg.active?.postMessage({ type: 'cache-all' });
	}
</script>

<div class="offline">
	{#if phase === 'unsupported'}
		<p>{t('offline.unsupported')}</p>
	{:else if phase === 'done'}
		<p role="status">{t('offline.done')}</p>
	{:else}
		<button type="button" class="quiet" disabled={phase === 'busy'} onclick={start}>{t('offline.button')}</button>
		{#if phase === 'busy'}<p role="status">{total ? t('offline.progress', { done, total }) : t('offline.starting')}</p>{/if}
	{/if}
</div>

<style>
	.offline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-3);
	}
	.offline .quiet {
		padding-inline: 0;
	}
	p {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
