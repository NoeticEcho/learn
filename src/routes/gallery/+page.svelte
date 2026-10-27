<!--
	The gallery (spec §3.1, §4.6): the person's site in each era, as live thumbnails. Each is the
	same sandbox as the practice preview (allow-scripts only, the network blocked), loaded lazily.
	An era's site is its furthest practice step with saved work (progress.eraSites). The lessons'
	scaffolding (`data-scaffold`, scaffold.ts) is left out of the thumbnail and the zip.
-->
<script lang="ts">
	import Seo from '#lib/seo/Seo.svelte';
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import { buildSrcdoc } from '#lib/practice/sandbox.ts';
	import { withoutScaffold } from '#lib/practice/scaffold.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const ERAS = [1, 2, 3, 4, 5, 6, 7, 8];
	let sites = $state<Record<number, Record<string, string>>>({});
	let title = $state('');

	onMount(async () => {
		const { db, progress, persona } = await import('#lib/learner.ts');
		const all = await progress.eraSites(await db(), data.steps);
		sites = Object.fromEntries(
			Object.entries(all).map(([era, { files, legacy }]) => [era, { ...files, 'index.html': withoutScaffold(files['index.html'] ?? '', { legacy }) }])
		);
		title = (await persona()).name;
	});

	const srcdoc = (files: Record<string, string>) =>
		buildSrcdoc({ 'index.html': files['index.html'] ?? '', 'styles.css': files['styles.css'], 'script.js': files['script.js'] }, [], {});

	async function save(era: number) {
		const { siteZip, download } = await import('#lib/zip.ts');
		download(siteZip(sites[era], title, t(`era.${era}.name`)), `site-era-${era}.zip`);
	}
</script>

<Seo title={t('gallery.title')} description={t('seo.private')} noindex />

<div class="container">
	<header class="head">
		<h1>{t('gallery.title')}</h1>
		<p class="lede">{t('gallery.lede')}</p>
	</header>

	<ol class="eras">
		{#each ERAS as era (era)}
			{@const files = sites[era]}
			<li class:has={!!files}>
				<h2>{t(`era.${era}.name`)}</h2>
				{#if files}
					<!-- A picture of the site, not a page to use: inert, so its links and fields take no focus (axe frame-focusable-content). -->
					<div class="thumb">
						<iframe sandbox="allow-scripts" loading="lazy" title={t('gallery.preview', { year: t(`era.${era}.name`) })} srcdoc={srcdoc(files)} tabindex="-1" inert></iframe>
					</div>
					<button type="button" class="secondary" onclick={() => save(era)}>{t('gallery.download')}</button>
				{:else if data.starts[era]}
					<!-- What to do about an empty era, said once per era and different for each. -->
					<p class="empty">{t('gallery.starts')} <a href={links.lesson(data.starts[era].id)}>{data.starts[era].title}</a></p>
				{:else}
					<p class="empty">{t('gallery.soon')}</p>
				{/if}
			</li>
		{/each}
	</ol>
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
		margin: 0;
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
	}
	.eras {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}
	li {
		display: grid;
		grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
		gap: var(--space-3) var(--space-6);
		align-items: start;
		padding-block: var(--space-4);
		border-top: var(--line) solid var(--border-hairline);
	}
	li.has {
		grid-template-columns: minmax(0, 18rem) minmax(0, 1fr) auto;
	}
	h2 {
		font-size: var(--text-body-lg);
		line-height: 1.3;
		overflow-wrap: break-word;
		min-width: 0;
	}
	li:not(.has) h2 {
		color: var(--text-secondary);
	}
	.empty {
		margin: 0;
		color: var(--text-muted);
		font-size: var(--text-body-sm);
	}
	.thumb {
		height: 14rem;
		overflow: hidden;
		border: var(--line) solid var(--border-hairline);
		background: var(--preview-canvas);
	}
	iframe {
		width: 200%;
		height: 28rem;
		border: 0;
		transform: scale(0.5);
		transform-origin: 0 0;
		pointer-events: none;
	}
	@media (max-width: 1024px) {
		li,
		li.has {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
	}
</style>
