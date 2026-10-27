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
	import persona from '#lib/persona/default.ru.json';
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
		const [{ db, progress }, { nextHome }, game] = await Promise.all([
			import('#lib/learner.ts'),
			import('#lib/content/catalogue.ts'),
			import('#lib/game/index.ts')
		]);
		const d = await db();
		const done = await progress.doneSet(d);
		next = nextHome(data.home.lessons, done) ?? null;
		doneCount = done.size;
		const log = await d.getAll('log');
		xp = game.totalXp(log);
		({ days, frozenThisWeek: frozen } = game.streak(log, new Date()));
		ready = true;
	}

	onMount(async () => {
		const { db, progress } = await import('#lib/learner.ts');
		if (await progress.getSetting(await db(), 'prologueSeen')) {
			mode = 'home';
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

	const firstLesson = $derived(data.home.lessons[0]?.id);
	const total = $derived(data.home.lessons.length);
</script>

<svelte:head>
	<title>{t('app.title')}</title>
	<meta name="description" content={t('prologue.lede')} />
</svelte:head>

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
	{/if}
</div>

<style>
	.hero {
		padding-block: var(--space-9) var(--space-7);
		max-width: 46rem;
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
			padding-block: var(--space-7) var(--space-6);
		}
	}
</style>
