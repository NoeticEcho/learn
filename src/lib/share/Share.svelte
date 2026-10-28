<!--
	«Поделиться»: a lesson's address, sent where the person chooses. Where the browser has the
	Web Share API (phones, mostly), one button opens the system's own sheet. Elsewhere, and before
	the script runs, plain links to Telegram, VK, X and WhatsApp with the address and a caption
	filled in. No third-party script, iframe or pixel: a share is an ordinary link the person
	follows, and nothing is sent anywhere until they do (spec §4.1). «Скопировать ссылку» appears
	where the clipboard can be written.

	The preview the other side shows is drawn from the page's own Open Graph tags (Seo.svelte), so
	the caption here is only what the person sends with it.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t, getLocale } from '#lib/i18n/index.ts';
	import { targets } from './targets.ts';

	type Props = { url: string; title: string; text: string; label?: string };
	let { url, title, text, label = t('share.label') }: Props = $props();

	let native = $state(false);
	let clipboard = $state(false);
	let status = $state('');
	onMount(() => {
		native = typeof navigator.share === 'function';
		clipboard = !!navigator.clipboard?.writeText && isSecureContext;
	});

	const links = $derived(targets({ url, title, text, lang: getLocale() }));

	async function share() {
		try {
			await navigator.share({ title, text, url });
		} catch (e) {
			// The person closed the sheet: nothing to say. Anything else: the links are the fallback.
			if ((e as DOMException)?.name !== 'AbortError') native = false;
		}
	}
	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			status = t('share.copied');
		} catch {
			status = t('share.copy.failed');
		}
	}
</script>

<div class="share" role="group" aria-label={label}>
	<span class="label" aria-hidden="true">{label}</span>
	{#if native}
		<button type="button" class="secondary" onclick={share}>{t('share.native')}</button>
	{:else}
		<ul>
			{#each links as l (l.id)}
				<li>
					<a href={l.href} target="_blank" rel="noopener noreferrer" data-share={l.id}
						><span class="visually-hidden">{t('share.to')} </span>{l.name}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
	{#if clipboard}<button type="button" class="link" onclick={copy}>{t('share.copy')}</button>{/if}
	<span class="status" role="status">{status}</span>
</div>

<style>
	.share {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-4);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-4);
		list-style: none;
		margin: 0;
		padding: 0;
	}
	a,
	.link {
		display: inline-flex;
		align-items: center;
		min-height: var(--hit-min);
		color: var(--text-link);
	}
	a:hover,
	.link:hover {
		color: var(--text-link-hover);
	}
	.link {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.status:empty {
		display: none;
	}
</style>
