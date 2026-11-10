<!--
	The catalog: the platform's home (docs/specs/2026-11-01-platform-design.md §5.1). Cards, grouped
	under the strands' headings, drawn as the cells of one ruled sheet: no rounded boxes, no shadows,
	no lift on hover. The whole card is one link, the heading's, stretched over it, so it works with
	no script. Only three things depend on the person, each in a slot it already had, so nothing
	moves when the store is read: the line under the head, a card's count and its progress rule.
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
	import { website } from '#lib/seo/jsonld.ts';
	import { at } from '#lib/seo/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const lang = getLocale();

	const count = (c: CourseRow, done: number | null) => {
		// a course with a lesson done, or a course that has opened only some of its lessons
		if (done !== null) return t('catalog.count.of', { done, n: c.lessons, lessons: pl(c.lessons, 'lesson.of.forms') });
		if (c.state === 'partly') return t('catalog.count.of', { done: c.open, n: c.lessons, lessons: pl(c.lessons, 'lesson.of.forms') });
		return t('catalog.count', { n: c.lessons, lessons: pl(c.lessons, 'lesson.forms') });
	};

	// The first two, and the course that opens its strand, carry more weight.
	const big = new Set(['web', 'ai', 'noetic-singularity', 'verify', 'numbers']);

	// The person, if the store knows them. Nothing is fetched for a first visit.
	let next = $state<HomeLesson | null>(null);
	let done = $state<Record<string, number>>({});
	let returning = $state(false);
	const [continueBefore, continueAfter] = t('home.continue', { title: '\u0000' }).split('\u0000');

	onMount(async () => {
		const { db, progress } = await import('#lib/learner.ts');
		const d = await db();
		const courses = await progress.courseProgress(d);
		done = Object.fromEntries(Object.entries(courses).map(([id, c]) => [id, c.done]));
		const finished = await progress.doneIn(d, 'web');
		if (!finished.size && !(await progress.getSetting(d, 'prologueSeen'))) return;
		const [{ nextHome }, lessons] = await Promise.all([import('#lib/content/catalogue.ts'), fetch(links.homeIndex(data.index)).then((r) => r.json() as Promise<HomeLesson[]>)]);
		next = nextHome(lessons, finished) ?? null;
		returning = true;
	});
</script>

<Seo
	title={t('app.title')}
	full={t('seo.home.title')}
	description={t('seo.home.description')}
	image={data.seo.og}
	feed
	jsonld={[website(at.home(lang), t('seo.home.description'), lang)]}
/>

<!-- One sprite, so the marks cost a few hundred bytes for the whole page. -->
<svg class="sprite" width="0" height="0" aria-hidden="true">
	<symbol id="m-machine" viewBox="0 0 16 16"><path d="M2.5 3.5h11v7h-11zM6 13.5h4" /></symbol>
	<symbol id="m-noetic" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5" /><circle cx="8" cy="8" r="6" stroke-dasharray="1.5 2.2" /></symbol>
	<symbol id="m-check" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5l3 3" /></symbol>
	<symbol id="m-yours" viewBox="0 0 16 16"><path d="M8 1.8l5 1.9v4c0 3-2 5.2-5 6.5-3-1.3-5-3.5-5-6.5v-4z" /></symbol>
</svg>

<div class="container">
	<header class="head">
		<div>
			<h1>{t('app.title')}</h1>
			<p class="lede">{t('catalog.lede')}</p>
			<p class="private">{t('catalog.private')}</p>
			<!-- The slot is filled before the store is read, so nothing moves when it is. -->
			<p class="way">
				{#if returning && next}
					<a href={links.lesson(next.id)}>{continueBefore}<span lang={next.lang}>{next.title}</span>{continueAfter}</a>
				{:else if returning}
					{t('home.finished')}
				{:else}
					<a href={links.prologue()}>{t('catalog.begin')}</a>
				{/if}
			</p>
		</div>
		<img class="echo" src={echo} width="168" height="168" alt="" />
	</header>

	{#each data.catalog.strands as strand (strand.id)}
		<section class="strand" aria-labelledby="strand-{strand.id}">
			<h2 id="strand-{strand.id}">{strand.title}</h2>
			<p class="summary">{strand.summary}</p>
			<ul class="sheet">
				{#each strand.courses as c (c.id)}
					<li class={['card', { big: big.has(c.id), whole: c.id === 'noetic-singularity' }]} data-course={c.id}>
						<h3><a href={links.course(c.id)}>{c.title}</a></h3>
						<p class="line">{c.tagline}</p>
						{#if c.id === 'ai'}<p class="note">{t('catalog.first')}</p>{/if}
						<div class="foot">
							<span class="from"><svg class="mark" aria-hidden="true"><use href="#m-{strand.id}" /></svg>{strand.short}</span>
							<span class="count">{count(c, c.open && done[c.id] ? done[c.id] : null)}</span>
							<!-- The word says it; the filled or hollow mark and the colour only repeat it. A course with
							     its first lessons out still says «скоро», so its mark stays hollow too. -->
							<span class={['state', c.state === 'open' ? 'available' : 'soon']}>
								<span class="dot" aria-hidden="true"></span>{c.state === 'planned' || c.state === 'partly' ? t('catalog.state.soon') : t('catalog.state.available')}
							</span>
							{#if c.open}
								<span class="meter" aria-hidden="true"><span style:width="{((done[c.id] ?? 0) / c.lessons) * 100}%"></span></span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	<section class="foot-note" aria-labelledby="follow-h">
		<div>
			<h2 id="follow-h">{t('catalog.follow')}</h2>
			<p>{t('catalog.follow.text')}</p>
			<p><a href={links.feed()} data-sveltekit-reload>{t('catalog.feed')}</a></p>
		</div>
		<Project />
	</section>
</div>

<style>
	.sprite {
		position: absolute;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-6);
		padding-block: var(--space-8) var(--space-6);
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
		margin: 0 0 var(--space-4);
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		max-width: var(--measure);
	}
	/* Room for two lines on a phone, so a long lesson title does not push the cards down. */
	.way {
		margin: 0;
		max-width: var(--measure);
		min-height: 3.2em;
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
	/* One ruled sheet with the cards as its cells: the rules are shared, so it reads as a catalog
	   drawer and not as a row of floating boxes. Six tracks: an ordinary card takes two. */
	.sheet {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		border-top: var(--line) solid var(--border-rule);
		border-left: var(--line) solid var(--border-rule);
	}
	.card {
		position: relative;
		grid-column: span 2;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		border-right: var(--line) solid var(--border-rule);
		border-bottom: var(--line) solid var(--border-rule);
	}
	.big {
		grid-column: span 3;
		padding: var(--space-5);
	}
	.whole {
		grid-column: span 6;
	}
	h3 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: 1.25;
		font-weight: 400;
	}
	.big h3 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
		margin-bottom: var(--space-1);
	}
	h3 a {
		color: var(--text-primary);
		text-decoration: none;
		outline: none;
	}
	.card:hover h3 a {
		text-decoration: underline;
		text-decoration-color: var(--accent-measure);
		text-underline-offset: 0.2em;
	}
	/* The heading's link covers the card, and its focus ring is drawn around the whole of it. */
	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	h3 a:focus-visible::after {
		outline: 2px solid var(--border-focus);
		outline-offset: -2px;
	}
	.line,
	.note {
		margin: 0;
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	.big .line {
		font-size: var(--text-body);
		max-width: var(--measure);
	}
	.note {
		color: var(--text-secondary);
	}
	/* Three fixed slots, so a count that becomes «12 из 154 уроков» moves nothing. */
	.foot {
		margin-top: auto;
		padding-top: var(--space-3);
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-1) var(--space-3);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
	}
	.from {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.mark {
		flex: none;
		width: 16px;
		height: 16px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1;
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		border: var(--line) solid currentColor;
	}
	.available {
		color: var(--accent-state-text);
	}
	.available .dot {
		background: currentColor;
	}
	.meter {
		grid-column: 1 / -1;
		height: 2px;
		background: var(--border-hairline);
	}
	.meter span {
		display: block;
		height: 100%;
		background: var(--accent-state-text);
	}
	.foot-note {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-6);
		align-items: end;
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: var(--line) solid var(--border-hairline);
	}
	.foot-note h2 {
		font-size: var(--text-body-lg);
		font-family: var(--font-serif);
		font-weight: 400;
		margin-bottom: var(--space-2);
	}
	.foot-note p {
		margin: 0 0 var(--space-2);
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	@media (max-width: 1023px) {
		.sheet {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.card {
			grid-column: span 1;
		}
		.big {
			grid-column: span 2;
		}
	}
	@media (max-width: 700px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		.head {
			padding-block: var(--space-7) var(--space-4);
		}
		/* A small page on a small screen: the mascot stays in the launcher and the panel. */
		.echo {
			display: none;
		}
		.foot-note {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 560px) {
		.sheet {
			grid-template-columns: minmax(0, 1fr);
		}
		.card {
			grid-column: auto;
			padding: var(--space-4);
		}
		.big h3 {
			font-size: var(--text-body-lg);
		}
	}
</style>
