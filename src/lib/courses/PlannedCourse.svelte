<!--
	A course with a table of contents and no lessons yet (spec 2026-11-01 §5.2). The list is the
	page's content. A planned lesson has no page of its own, and its line says «скоро» plainly.
-->
<script lang="ts">
	import { t, pl } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import type { PlannedCourseView } from './types.ts';

	let { course }: { course: PlannedCourseView } = $props();
	const lessonHref = (part: string, lesson: string) => `${links.course(course.id)}${part}/${lesson}/`;
</script>

<div class="container">
	<nav class="path" aria-label={t('course.path')}>
		<a href={links.home()}>{t('nav.courses')}</a>
	</nav>
	<header class="head">
		<h1>{course.title}</h1>
		<p class="lede">{course.tagline}</p>
		<p class="about">{course.about}</p>
		<p class="planned">{t('course.planned')} <a href={links.feed()} data-sveltekit-reload>{t('catalog.feed')}</a></p>
		<p class="count">{t('course.count', { n: course.lessons, lessons: pl(course.lessons, 'lesson.forms'), parts: course.parts.length, partsWord: pl(course.parts.length, 'part.forms') })}</p>
	</header>

	{#each course.parts as part, i (part.id)}
		<section class="part" aria-labelledby="part-{part.id}">
			<h2 id="part-{part.id}"><span class="n">{t('course.part', { n: i + 1 })}</span> {part.title}</h2>
			<p class="summary">{part.summary}</p>
			<ol>
				{#each part.lessons as lesson (lesson.id)}
					<li>
						<div>
							<h3>
								{#if lesson.open}<a href={lessonHref(part.id, lesson.id)}>{lesson.title}</a>{:else}{lesson.title}{/if}
							</h3>
							<p>{lesson.summary}</p>
						</div>
						{#if !lesson.open}<span class="soon">{t('course.soon')}</span>{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
</div>

<style>
	.path {
		padding-top: var(--space-5);
		font-size: var(--text-body-sm);
	}
	.path a {
		color: var(--text-secondary);
	}
	.head {
		padding-block: var(--space-5) var(--space-6);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	h1 {
		font-size: var(--text-display);
		line-height: var(--lh-display);
		margin-bottom: var(--space-4);
		overflow-wrap: break-word;
		min-width: 0;
	}
	.lede {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-body);
		max-width: 52ch;
		margin: 0 0 var(--space-4);
	}
	.about,
	.planned {
		margin: 0 0 var(--space-3);
		max-width: var(--measure);
		color: var(--text-body);
	}
	.count {
		margin: 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.part {
		padding-top: var(--space-7);
		max-width: 56rem;
	}
	h2 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
		margin-bottom: var(--space-3);
	}
	.n {
		display: block;
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
		margin-bottom: var(--space-1);
	}
	.summary {
		margin: 0 0 var(--space-4);
		max-width: var(--measure);
		color: var(--text-body);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--line) solid var(--border-hairline);
	}
	li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-5);
		padding-block: var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	h3 {
		margin: 0 0 var(--space-1);
		font-family: var(--font-sans);
		font-size: var(--text-body);
		font-weight: 500;
		line-height: 1.35;
		color: var(--text-primary);
	}
	li p {
		margin: 0;
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	.soon {
		flex: none;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		li {
			flex-direction: column;
			gap: var(--space-1);
		}
	}
</style>
