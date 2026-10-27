<!--
	Home. The first visit is the prologue (spec §3.1a), prerendered as its question screen so the
	first paint is the hero. A returning visit, once the store says the prologue was seen, is the
	person's own home: the next lesson, their streak and XP, and the line that their progress lives
	only in this browser.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t, pl } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Prologue, { type Answers } from '#lib/prologue/Prologue.svelte';
	import Project from '#lib/home/Project.svelte';
	import persona from '#lib/persona/default.ru.json';
	import type { HomeLesson } from '#lib/content/catalogue.ts';
	import Seo from '#lib/seo/Seo.svelte';
	import { course, website } from '#lib/seo/jsonld.ts';
	import { at } from '#lib/seo/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const example: Answers = {
		who: `${persona.name}, ${persona.people[0].role.split(',')[0]}`,
		forWhom: persona.forWhom,
		action: persona.mainAction.label
	};

	let mode = $state<'prologue' | 'home'>('prologue');
	let next = $state<{ id: string; title: string } | null>(null);
	let doneCount = $state(0);
	let xp = $state(0);
	let days = $state(0);
	let frozen = $state(false);
	let ready = $state(false);

	async function refresh() {
		const [{ db, progress }, { nextHome }, game, lessons] = await Promise.all([
			import('#lib/learner.ts'),
			import('#lib/content/catalogue.ts'),
			import('#lib/game/index.ts'),
			fetch(links.homeIndex(data.home.index)).then((r) => r.json() as Promise<HomeLesson[]>)
		]);
		const d = await db();
		const done = await progress.doneSet(d);
		next = nextHome(lessons, done) ?? null;
		doneCount = done.size;
		const log = await d.getAll('log');
		xp = game.totalXp(log);
		({ days, frozenThisWeek: frozen } = game.streak(log, new Date()));
		ready = true;
	}

	// The era scene is for a wide screen only, and is fetched only there, after home is drawn.
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
		const { db, progress } = await import('#lib/learner.ts');
		if (await progress.getSetting(await db(), 'prologueSeen')) {
			mode = 'home';
			wantScene();
			await refresh();
		}
	});

	async function seen() {
		const { db, progress } = await import('#lib/learner.ts');
		await progress.setSetting(await db(), 'prologueSeen', true);
	}

	async function save(a: Answers) {
		const [{ db, progress }, { fromAnswers }] = await Promise.all([import('#lib/learner.ts'), import('#lib/persona/render.ts')]);
		const d = await db();
		for (const [k, v] of Object.entries(fromAnswers(a))) await progress.setPersona(d, k, v);
		await seen();
	}

	const firstLesson = $derived(data.home.first);
	const total = $derived(data.home.total);
</script>

<Seo
	title={t('app.title')}
	full={t('seo.home.title')}
	description={t('seo.home.description')}
	image={{ file: data.seo.og, alt: t('seo.home.alt') }}
	jsonld={[
		course({ homeUrl: at.home(), description: t('seo.home.description'), image: at.file(data.seo.og), minutes: data.seo.minutes }),
		website(at.home(), t('seo.home.description'))
	]}
/>

<div class="container">
	{#if mode === 'prologue'}
		<Prologue
			{example}
			onsave={save}
			onskip={seen}
			startHref={firstLesson ? links.lesson(firstLesson) : links.map()}
			skipHref={links.map()}
		/>
	{:else}
		<div class="top">
			<section class="hero" aria-labelledby="home-h">
				<h1 id="home-h">{t('app.title')}</h1>
				<p class="lede">{t('home.lede')}</p>
				<div class="actions">
					{#if !ready}
						<span class="primary placeholder" aria-hidden="true">{t('home.start')}</span>
					{:else if next}
						<a class="primary" href={links.lesson(next.id)}>{t('home.continue', { title: next.title })}</a>
					{:else}
						<span class="done">{t('home.finished')}</span>
					{/if}
					<a class="secondary" href={links.map()}>{t('home.map')}</a>
				</div>
			</section>
			<aside class="side" aria-label="{t('project.label')} NoeticEcho">
				<div class="stage">{#if Scene}<Scene />{/if}</div>
				<Project />
			</aside>

			<section class="path" aria-label={t('home.stats')}>
				<dl>
					<div>
						<dt>{days ? t('home.streak', { n: days, days: pl(days, 'day.forms') }) : t('home.streak.none')}</dt>
						{#if frozen}<dd>{t('home.freeze')}</dd>{/if}
					</div>
					<div>
						<dt>{t('home.lessons', { done: doneCount, total })}</dt>
					</div>
					<div>
						<dt>{t('home.xp', { n: xp })}</dt>
					</div>
				</dl>
				<p class="private">
					{t('home.private')}
					<a href={links.settings()}>{t('home.private.link')}</a>
				</p>
				<button type="button" class="quiet" onclick={() => (mode = 'prologue')}>{t('home.replay')}</button>
			</section>
		</div>
	{/if}
</div>

<style>
	.top {
		display: grid;
		gap: var(--space-5) 0;
	}
	.hero {
		padding-block: var(--space-9) 0;
		max-width: 46rem;
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
		/* The scene and the line beside the hero and the path, so neither is pushed down. */
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
		max-width: 36ch;
		margin: 0 0 var(--space-6);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: center;
	}
	.placeholder {
		visibility: hidden;
	}
	.done {
		color: var(--text-body);
	}
	.path {
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
	.path .quiet {
		justify-self: start;
		padding-inline: 0;
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		.hero {
			padding-block: var(--space-7) 0;
		}
	}
</style>
