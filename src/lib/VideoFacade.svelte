<!--
	A video, behind a click (spec §3.4, §9): nothing is requested from the video host until the
	person presses play. No thumbnail either, because a thumbnail is a request. YouTube is embedded
	from youtube-nocookie.com; anything else opens on its own site.
-->
<script lang="ts">
	import type { Source } from '#lib/content/schema.ts';
	import { t } from '#lib/i18n/index.ts';

	let { video }: { video: Source } = $props();
	let playing = $state(false);

	const youtubeId = $derived.by(() => {
		try {
			const u = new URL(video.url);
			if (u.hostname.endsWith('youtube.com')) return u.searchParams.get('v');
			if (u.hostname === 'youtu.be') return u.pathname.slice(1);
		} catch {
			/* not a URL: no embed */
		}
		return null;
	});
	const host = $derived(youtubeId ? 'youtube-nocookie.com' : new URL(video.url).hostname);
</script>

<figure class="video">
	{#if playing && youtubeId}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{youtubeId}?autoplay=1"
			title={video.title}
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			referrerpolicy="strict-origin-when-cross-origin"
		></iframe>
	{:else}
		<div class="facade">
			<p class="title">{video.title}</p>
			{#if youtubeId}
				<button type="button" class="secondary" onclick={() => (playing = true)}>{t('video.play')}</button>
			{/if}
			<p class="notice">{t('video.notice', { host })}</p>
		</div>
	{/if}
	<figcaption><a href={video.url} rel="noopener noreferrer" target="_blank">{t('video.open')}</a></figcaption>
</figure>

<style>
	.video {
		margin: 0;
		max-width: 40rem;
	}
	.facade,
	iframe {
		aspect-ratio: 16 / 9;
		width: 100%;
		border: var(--line) solid var(--border-hairline);
	}
	.facade {
		display: grid;
		align-content: center;
		justify-items: start;
		gap: var(--space-3);
		padding: var(--space-6);
		background: var(--surface-body);
	}
	.title {
		margin: 0;
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		max-width: 30ch;
	}
	.notice {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	figcaption {
		margin-top: var(--space-2);
		font-size: var(--text-body-sm);
	}
</style>
