<!-- A lesson of a course other than the web one (spec 2026-11-01 §5.4): the web lesson's page, with its course's place instead of the web course's map. -->
<script lang="ts">
	import LessonView from '#lib/LessonView.svelte';
	import { t, getLocale } from '#lib/i18n/index.ts';
	import Seo from '#lib/seo/Seo.svelte';
	import { breadcrumbs, learningResource } from '#lib/seo/jsonld.ts';
	import { at, describe } from '#lib/seo/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const lang = getLocale();

	const jsonld = $derived.by(() => {
		const { lesson, course } = data;
		const home = at.course(course.id, lang);
		return [
			learningResource({
				lesson,
				url: at.lesson(lesson.id, lang),
				homeUrl: home,
				courseName: course.title,
				image: at.file(data.og.file),
				dateModified: data.lastmod,
				lang
			}),
			breadcrumbs([
				{ name: t('app.title'), url: at.home(lang) },
				{ name: course.title, url: home },
				{ name: `${t('course.part', { n: course.part.number })}. ${course.part.title}`, url: `${home}#part-${course.part.id}` },
				{ name: lesson.title }
			])
		];
	});
</script>

<Seo
	title={data.lesson.title}
	description={describe(data.lesson.definition)}
	preview={describe(data.lesson.summary, 200)}
	image={data.og}
	type="article"
	editions={data.editions}
	{jsonld} />

{#key data.lesson.id}
	<LessonView lesson={data.lesson} part={{ title: data.course.part.title }} concepts={[]} body={data.body} narration={data.narration ?? null} courseName={data.course.title} course={data.course} />
{/key}
