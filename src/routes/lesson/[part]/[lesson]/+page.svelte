<script lang="ts">
	import LessonView from '#lib/LessonView.svelte';
	import { t } from '#lib/i18n/index.ts';
	import Seo from '#lib/seo/Seo.svelte';
	import { breadcrumbs, learningResource } from '#lib/seo/jsonld.ts';
	import { at, describe } from '#lib/seo/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The definition is the snippet (search, answer engines); the «Зачем» is the invitation a
	// link preview shows under the title.
	const jsonld = $derived.by(() => {
		const { lesson, part } = data;
		const home = at.home();
		return [
			learningResource({
				lesson,
				url: at.lesson(lesson.id),
				homeUrl: home,
				image: at.file(data.og.file),
				teaches: data.concepts,
				dateModified: data.lastmod
			}),
			breadcrumbs([
				{ name: t('app.title'), url: home },
				{ name: t('map.title'), url: at.map() },
				{ name: `${t('map.part', { n: part.number })}. ${part.title}`, url: `${at.map()}#part-${part.number}` },
				{ name: lesson.title }
			])
		];
	});
</script>

<Seo
	title={data.lesson.title}
	description={describe(data.lesson.definition)}
	preview={describe(data.lesson.summary, 200)}
	image={data.og} type="article" {jsonld} />

{#key data.lesson.id}
	<LessonView lesson={data.lesson} part={data.part} concepts={data.concepts} index={data.index} body={data.body} />
{/key}
