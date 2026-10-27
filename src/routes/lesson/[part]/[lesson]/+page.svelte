<script lang="ts">
	import LessonView from '#lib/LessonView.svelte';
	import { t } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.lesson.title}: {t('app.title')}</title>
	<meta name="description" content={data.lesson.summary} />
</svelte:head>

{#key data.lesson.id}
	<LessonView lesson={data.lesson} part={data.part} catalogue={data.catalogue} body={data.body} />
{/key}
