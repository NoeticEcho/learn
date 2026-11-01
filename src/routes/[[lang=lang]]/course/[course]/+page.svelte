<!-- A course's page: the web course, or a planned course's table of contents (spec 2026-11-01 §5.2). -->
<script lang="ts">
	import { t, getLocale } from '#lib/i18n/index.ts';
	import Seo from '#lib/seo/Seo.svelte';
	import { breadcrumbs, course as courseLd } from '#lib/seo/jsonld.ts';
	import { at, describe } from '#lib/seo/site.ts';
	import WebCourse from '#lib/courses/WebCourse.svelte';
	import PlannedCourse from '#lib/courses/PlannedCourse.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const lang = getLocale();
	const course = $derived(data.course);
	const crumbs = $derived(breadcrumbs([{ name: t('app.title'), url: at.home(lang) }, { name: course.title }]));
	// A `Course` says it can be taken now, so only a course with a published lesson has one.
	const jsonld = $derived(
		course.kind === 'web'
			? [courseLd({ homeUrl: at.course('web', lang), name: course.title, description: t('seo.web.description'), image: at.file(data.og.file), minutes: data.minutes, lang }), crumbs]
			: [crumbs]
	);
</script>

<Seo
	title={course.title}
	full={course.kind === 'web' ? t('seo.web.title') : undefined}
	description={course.kind === 'web' ? t('seo.web.description') : describe(course.tagline)}
	preview={describe(course.about, 200)}
	image={data.og}
	feed
	{jsonld}
/>

{#if course.kind === 'web'}
	<WebCourse {course} />
{:else}
	<PlannedCourse {course} />
{/if}
