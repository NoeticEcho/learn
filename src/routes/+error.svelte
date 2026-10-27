<script lang="ts">
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Echo from '#lib/guide/Echo.svelte';
	import Seo from '#lib/seo/Seo.svelte';
</script>

<Seo title={page.status === 404 ? t('error.404') : t('error.other')} description={t('seo.home.description')} noindex />

<div class="container err">
	<span class="echo" aria-hidden="true"><Echo mood="hmm" size={120} /></span>
	<h1>{page.status === 404 ? t('error.404') : t('error.other')}</h1>
	<p>{t('error.404.lede')}</p>
	<p class="row">
		<a class="primary" href={links.home()}>{t('error.home')}</a>
		<a class="secondary" href={links.map()}>{t('error.map')}</a>
	</p>
</div>

<style>
	.err {
		padding-block: var(--space-8) var(--space-9);
	}
	.echo {
		display: block;
		margin-bottom: var(--space-5);
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
