<!--
	The web course's page: what the home was to a returning person (the scene, the next lesson, the
	streak and the line that progress lives in this browser), and the seventeen parts with their
	lessons (spec 2026-11-01 §5.2). Its first action is the prologue until the store says it was
	seen. Without a script it is still a link to the prologue and to every lesson.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t, pl } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Project from '#lib/home/Project.svelte';
	import type { HomeLesson } from '#lib/content/catalogue.ts';
	import type { WebCourseView } from './types.ts';

	let { course }: { course: WebCourseView } = $props();

	let seen = $state(false);
	let next = $state<HomeLesson | null>(null);
	let done = $state(new Set<string>());
	let xp = $state(0);
	let days = $state(0);
	let frozen = $state(false);
	let ready = $state(false);
	// «Continue: <title>», with the title in its own language when the edition has not translated it yet.
	const [continueBefore, continueAfter] = t('home.continue', { title: '\u0000' }).split('\u0000');

	// The era scene is for a wide screen only, and is fetched only there, after the page is drawn.
	let Scene = $state<typeof import('#lib/home/EraScene.svelte').default | null>(null);
	function wantScene() {
		const wide = matchMedia('(min-width: 1024px)');
		const load = () => {
			if (wide.matches && !Scene) import('#lib/home/EraScene.svelte').then((m) => (Scene = m.default));
		};
		wide.addEventListener('change', load);
		load();
	}

	onMount(async () => {
		wantScene();
		const [{ db, progress }, { nextHome }, game] = await Promise.all([import('#lib/learner.ts'), import('#lib/content/catalogue.ts'), import('#lib/game/index.ts')]);
		const d = await db();
		seen = !!(await progress.getSetting(d, 'prologueSeen'));
		done = await progress.doneIn(d, 'web');
		const log = await d.getAll('log');
		xp = game.totalXp(log);
		({ days, frozenThisWeek: frozen } = game.streak(log, new Date()));
		ready = true;
		if (seen || done.size) {
			const lessons = (await fetch(links.homeIndex(course.index)).then((r) => r.json())) as HomeLesson[];
			next = nextHome(lessons, done) ?? null;
		}
	});

	const started = $derived(seen || done.size > 0);
</script>

<div class="container">
	<div class="top">
		<section class="hero" aria-labelledby="course-h">
			<nav class="path" aria-label={t('course.path')}><a href={links.home()}>{t('nav.courses')}</a></nav>
			<h1 id="course-h">{course.title}</h1>
			<p class="lede">{course.tagline}</p>
			<p class="about">{course.about}</p>
			<div class="actions">
				{#if !started}
					<a class="primary" href={links.prologue()}>{t('catalog.start')}</a>
					{#if course.first}<a class="secondary" href={links.lesson(course.first)}>{t('home.start')}</a>{/if}
				{:else if next}
					<a class="primary" href={links.lesson(next.id)}>{continueBefore}<span lang={next.lang}>{next.title}</span>{continueAfter}</a>
				{:else if ready}
					<span class="done">{t('home.finished')}</span>
				{/if}
				<a class="secondary" href={links.map()}>{t('home.map')}</a>
			</div>
		</section>
		<aside class="side" aria-label="{t('project.label')} NoeticEcho">
			<div class="stage">{#if Scene}<Scene />{/if}</div>
			<Project text="project.web" />
		</aside>

		<section class="stats" aria-label={t('home.stats')}>
			<dl>
				<div>
					<dt>{days ? t('home.streak', { n: days, days: pl(days, 'day.forms') }) : t('home.streak.none')}</dt>
					{#if frozen}<dd>{t('home.freeze')}</dd>{/if}
				</div>
				<div>
					<dt>{t('home.lessons', { done: done.size, total: course.lessons })}</dt>
				</div>
				<div>
					<dt>{t('home.xp', { n: xp })}</dt>
				</div>
			</dl>
			<p class="private">
				{t('home.private')}
				<a href={links.settings()}>{t('home.private.link')}</a>
			</p>
			<a class="replay" href={links.prologue()}>{t('home.replay')}</a>
		</section>
	</div>

	<section class="toc" aria-labelledby="toc-h">
		<h2 id="toc-h">{t('course.contents')}</h2>
		{#each course.parts as part (part.number)}
			<div class="part" id="part-{part.number}">
				<h3><span class="n">{t('course.part', { n: part.number })}</span> {part.title}</h3>
				<p>{part.summary}</p>
				<ol>
					{#each part.lessons as l (l.id)}
						<li class={{ passed: done.has(l.id) }}>
							<a href={links.lesson(l.id)} lang={l.lang}>{l.title}</a>
							{#if done.has(l.id)}<span class="mark">{t('course.done')}</span>{/if}
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</section>
</div>

<style>
	.top {
		display: grid;
		gap: var(--space-5) 0;
	}
	.hero {
		padding-block: var(--space-5) 0;
		max-width: 46rem;
	}
	.path {
		margin-bottom: var(--space-5);
		font-size: var(--text-body-sm);
	}
	.path a {
		color: var(--text-secondary);
	}
	/* The scene's box is reserved before it arrives, so nothing moves when it does. */
	.stage {
		display: none;
	}
	@media (min-width: 1024px) {
		.top {
			grid-template-columns: minmax(0, 1fr) 440px;
			column-gap: var(--space-8);
			align-items: start;
		}
		/* The scene and the line beside the hero and the stats, so neither is pushed down. */
		.side {
			grid-column: 2;
			grid-row: 1 / span 2;
			padding-top: var(--space-8);
		}
		.stage {
			display: block;
			min-height: calc(300px + var(--hit-min) + var(--space-2));
			margin-bottom: var(--space-3);
		}
	}
	@media (min-width: 1024px) and (prefers-reduced-motion: reduce) {
		.stage {
			min-height: 300px;
		}
	}
	h1 {
		font-size: var(--text-display);
		line-height: var(--lh-display);
		overflow-wrap: break-word;
		min-width: 0;
		margin-bottom: var(--space-5);
	}
	.lede {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-body);
		max-width: 44ch;
		margin: 0 0 var(--space-4);
	}
	.about {
		margin: 0 0 var(--space-6);
		max-width: var(--measure);
		color: var(--text-body);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: center;
		min-height: var(--hit-min);
	}
	.done {
		color: var(--text-body);
	}
	.stats {
		margin-top: var(--space-2);
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-6);
		display: grid;
		gap: var(--space-5);
	}
	dl {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4) var(--space-8);
		margin: 0;
	}
	dt {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}
	dd {
		margin: var(--space-1) 0 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.private {
		margin: 0;
		color: var(--text-body);
		max-width: var(--measure);
	}
	.replay {
		justify-self: start;
		font-size: var(--text-body-sm);
	}
	.toc {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: var(--line) solid var(--border-hairline);
	}
	.toc h2 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
		margin-bottom: var(--space-5);
	}
	.part {
		padding-block: var(--space-5);
		border-top: var(--line) solid var(--border-hairline);
		max-width: 56rem;
	}
	.part h3 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: 1.25;
		font-weight: 400;
	}
	.n {
		color: var(--text-secondary);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		font-variant-numeric: tabular-nums;
		margin-right: var(--space-2);
	}
	.part p {
		margin: 0 0 var(--space-3);
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		columns: 2;
		column-gap: var(--space-6);
	}
	li {
		break-inside: avoid;
		padding-block: var(--space-1);
		font-size: var(--text-body-sm);
	}
	.mark {
		margin-left: var(--space-2);
		color: var(--accent-state-text);
	}
	@media (max-width: 700px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		ol {
			columns: 1;
		}
	}
</style>
