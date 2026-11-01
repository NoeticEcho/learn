<!--
	The catalog: the platform's home (docs/specs/2026-11-01-platform-design.md §5.1). An editorial
	index, not a grid of cards. The web course's row comes first and larger, and it is the only part
	of the page that depends on the person: once the store says they have been here, its state and
	its action become theirs, in the slot they already had.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import echo from '../../../design/mascot/echo.svg';
	import { t, pl, getLocale } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Project from '#lib/home/Project.svelte';
	import type { HomeLesson } from '#lib/content/catalogue.ts';
	import type { CourseRow } from '#lib/courses/types.ts';
	import Seo from '#lib/seo/Seo.svelte';
	import { courseList, website } from '#lib/seo/jsonld.ts';
	import { at } from '#lib/seo/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const lang = getLocale();

	const courses = $derived(data.catalog.strands.flatMap((s) => s.courses));
	const stateOf = (c: CourseRow) =>
		c.state === 'open'
			? t('catalog.state.open', { n: c.lessons, lessons: pl(c.lessons, 'lesson.forms') })
			: c.state === 'partly'
				? t('catalog.state.partly', { open: c.open, n: c.lessons })
				: t('catalog.state.planned', { n: c.lessons, lessons: pl(c.lessons, 'lesson.forms') });

	// The person, if the store knows them. Nothing is fetched for a first visit.
	let next = $state<HomeLesson | null>(null);
	let done = $state<number | null>(null);
	const [continueBefore, continueAfter] = t('home.continue', { title: '\u0000' }).split('\u0000');

	onMount(async () => {
		const { db, progress } = await import('#lib/learner.ts');
		const d = await db();
		const finished = await progress.doneIn(d, 'web');
		if (!finished.size && !(await progress.getSetting(d, 'prologueSeen'))) return;
		done = finished.size;
		const [{ nextHome }, lessons] = await Promise.all([import('#lib/content/catalogue.ts'), fetch(links.homeIndex(data.index)).then((r) => r.json() as Promise<HomeLesson[]>)]);
		next = nextHome(lessons, finished) ?? null;
	});
</script>

<Seo
	title={t('app.title')}
	full={t('seo.home.title')}
	description={t('seo.home.description')}
	image={data.seo.og}
	feed
	jsonld={[website(at.home(lang), t('seo.home.description'), lang), courseList(courses.map((c) => ({ name: c.title, url: at.course(c.id, lang) })))]}
/>

<div class="container">
	<header class="head">
		<div>
			<h1>{t('app.title')}</h1>
			<p class="lede">{t('catalog.lede')}</p>
			<p class="private">{t('catalog.private')}</p>
		</div>
		<img class="echo" src={echo} width="168" height="168" alt="" />
	</header>

	{#each data.catalog.strands as strand, s (strand.id)}
		<section class="strand" aria-labelledby="strand-{strand.id}">
			<h2 id="strand-{strand.id}">{strand.title}</h2>
			<p class="summary">{strand.summary}</p>
			<ul>
				{#each strand.courses as c, i (c.id)}
					<li class={['row', { lead: s === 0 && i === 0 }]}>
						<div class="line">
							<h3><a href={links.course(c.id)}>{c.title}</a></h3>
							<p class="tagline">{c.tagline}</p>
							{#if c.id === 'ai'}<p class="note">{t('catalog.first')}</p>{/if}
						</div>
						{#if s === 0 && i === 0}
							<div class="lead-side">
								<p class="state">{done === null ? stateOf(c) : t('catalog.state.progress', { done, n: c.lessons })}</p>
								<p class="actions">
									{#if done === null}
										<a class="primary" href={links.prologue()}>{t('catalog.start')}</a>
									{:else if next}
										<a class="primary" href={links.lesson(next.id)}>{continueBefore}<span lang={next.lang}>{next.title}</span>{continueAfter}</a>
									{/if}
									<a class="secondary" href={links.course(c.id)}>{t('catalog.openCourse')}</a>
								</p>
							</div>
						{:else}
							<p class={['state', { soon: c.state === 'planned' }]}>{stateOf(c)}</p>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<section class="foot" aria-labelledby="follow-h">
		<div>
			<h2 id="follow-h">{t('catalog.follow')}</h2>
			<p>{t('catalog.follow.text')}</p>
			<p><a href={links.feed()} data-sveltekit-reload>{t('catalog.feed')}</a></p>
		</div>
		<Project />
	</section>
</div>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-6);
		padding-block: var(--space-8) var(--space-6);
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
		max-width: 44ch;
		margin: 0 0 var(--space-3);
	}
	.private {
		margin: 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		max-width: var(--measure);
	}
	.echo {
		flex: none;
	}
	.strand {
		padding-top: var(--space-7);
	}
	.strand h2 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
		margin-bottom: var(--space-3);
	}
	.summary {
		margin: 0 0 var(--space-5);
		max-width: var(--measure);
		color: var(--text-body);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--line) solid var(--border-hairline);
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 13rem;
		gap: var(--space-2) var(--space-6);
		align-items: baseline;
		padding-block: var(--space-4);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	h3 {
		margin: 0 0 var(--space-1);
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: 1.25;
		font-weight: 400;
	}
	h3 a {
		color: var(--text-primary);
		text-decoration: none;
	}
	h3 a:hover {
		text-decoration: underline;
		text-decoration-color: var(--accent-measure);
		text-underline-offset: 0.2em;
	}
	.tagline,
	.note {
		margin: 0;
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	.note {
		margin-top: var(--space-1);
		color: var(--text-secondary);
	}
	.state {
		margin: 0;
		color: var(--accent-state-text);
		font-size: var(--text-body-sm);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.state.soon {
		color: var(--text-secondary);
	}
	/* The first row: the course that can be taken today. */
	.lead {
		grid-template-columns: minmax(0, 1fr) minmax(0, 24rem);
		align-items: start;
		padding-block: var(--space-6);
	}
	.lead h3 {
		font-size: var(--text-display-sm);
		margin-bottom: var(--space-3);
	}
	.lead .tagline {
		font-size: var(--text-body);
	}
	.lead-side .state {
		margin-bottom: var(--space-3);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-3);
		margin: 0;
	}
	.foot {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-6);
		align-items: end;
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: var(--line) solid var(--border-hairline);
	}
	.foot h2 {
		font-size: var(--text-body-lg);
		font-family: var(--font-serif);
		font-weight: 400;
		margin-bottom: var(--space-2);
	}
	.foot p {
		margin: 0 0 var(--space-2);
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	@media (max-width: 700px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		.head {
			padding-block: var(--space-7) var(--space-5);
		}
		/* A small page on a small screen: the mascot stays in the launcher and the panel. */
		.echo {
			display: none;
		}
		.row,
		.lead,
		.foot {
			grid-template-columns: minmax(0, 1fr);
		}
		.state {
			text-align: left;
		}
		.actions {
			justify-content: flex-start;
		}
	}
</style>
