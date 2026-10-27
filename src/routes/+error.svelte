<script lang="ts">
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
</script>

<svelte:head><title>{page.status === 404 ? t('error.404') : t('error.other')}: {t('app.title')}</title></svelte:head>

<div class="container err">
	<h1>{page.status === 404 ? t('error.404') : t('error.other')}</h1>
	<p>{t('error.404.lede')}</p>
	<p class="row">
		<a class="primary" href={links.home()}>{t('error.home')}</a>
		<a class="secondary" href={links.map()}>{t('error.map')}</a>
	</p>
</div>

<style>
	.err {
		padding-block: var(--space-9);
	}
	h1 {
		font-size: var(--text-display);
		line-height: 1.02;
		margin-bottom: var(--space-4);
		overflow-wrap: break-word;
		min-width: 0;
	}
	p {
		color: var(--text-body);
		max-width: var(--measure);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}
</style>
