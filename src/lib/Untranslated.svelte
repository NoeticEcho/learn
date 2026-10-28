<!--
	A lesson the English edition has not translated yet (docs/content-plan/README.md, «English
	edition»). It is an honest page rather than a 404 or a machine translation: what the lesson is,
	in the words it exists in, and the way to it. The page says noindex and is not in the English
	sitemap, so a search engine never takes it for the lesson.
-->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Echo from '#lib/guide/Echo.svelte';
	import type { Part } from '#lib/content/schema.ts';

	type Props = { lesson: { id: string; title: string; definition: string; order: number }; part: Part };
	let { lesson, part }: Props = $props();
</script>

<article class="container untranslated">
	<nav class="path" aria-label={t('lesson.path')}>
		<a href={links.map()}>{t('nav.map')}</a>
		<span aria-hidden="true">/</span>
		<a href="{links.map()}#part-{part.number}">{part.title}</a>
	</nav>
	<div class="body">
		<span class="echo" aria-hidden="true"><Echo mood="hmm" size={96} /></span>
		<div>
			<h1>{t('untranslated.heading')}</h1>
			<p class="lede">{t('untranslated.lede')}</p>
			<figure class="original" lang="ru">
				<p class="title">{lesson.title}</p>
				<p>{lesson.definition}</p>
			</figure>
			<p class="note">{t('untranslated.progress')}</p>
			<div class="actions">
				<a class="primary" href={links.lesson(lesson.id, 'ru')} hreflang="ru" data-sveltekit-reload>{t('untranslated.original')}</a>
				<a class="secondary" href="{links.map()}#part-{part.number}">{t('untranslated.map')}</a>
			</div>
		</div>
	</div>
</article>

<style>
	.untranslated {
		padding-block: var(--space-8) var(--space-6);
	}
	.path {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-6);
	}
	.path a {
		color: var(--text-secondary);
	}
	.body {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-6);
		align-items: start;
		max-width: var(--measure);
	}
	h1 {
		font-size: var(--text-display-sm);
		line-height: 1.1;
		margin: 0 0 var(--space-4);
		overflow-wrap: break-word;
	}
	.lede {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		margin: 0 0 var(--space-5);
	}
	.original {
		margin: 0 0 var(--space-5);
		padding: var(--space-4) var(--space-5);
		border-left: 2px solid var(--accent-measure);
		background: var(--surface-panel-solid);
	}
	.original p {
		margin: 0;
	}
	.original .title {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		margin-bottom: var(--space-2);
		color: var(--text-primary);
	}
	.note {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-5);
	}
	@media (max-width: 600px) {
		.body {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
