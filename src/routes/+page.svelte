<!--
	Home. The first visit is the prologue (spec §3.1a), prerendered as its question screen so the
	first paint is the hero; a returning visit, once the store says the prologue was seen, is home.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import { map } from '#lib/links.ts';
	import Prologue, { type Answers } from '#lib/prologue/Prologue.svelte';
	import persona from '#lib/persona/default.ru.json';

	const example: Answers = {
		who: `${persona.name}, ${persona.people[0].role.split(',')[0]}`,
		forWhom: persona.forWhom,
		action: persona.mainAction.label
	};

	let seen = $state(false);

	onMount(async () => {
		const [{ db }, progress] = await Promise.all([import('#lib/store/db.ts'), import('#lib/store/progress.ts')]);
		seen = !!(await progress.getSetting(await db(), 'prologueSeen'));
	});

	async function save(a: Answers) {
		const [{ db }, progress, { fromAnswers }] = await Promise.all([
			import('#lib/store/db.ts'),
			import('#lib/store/progress.ts'),
			import('#lib/persona/render.ts')
		]);
		const d = await db();
		for (const [k, v] of Object.entries(fromAnswers(a))) await progress.setPersona(d, k, v);
		await progress.setSetting(d, 'prologueSeen', true);
	}

	async function skip() {
		const [{ db }, progress] = await Promise.all([import('#lib/store/db.ts'), import('#lib/store/progress.ts')]);
		await progress.setSetting(await db(), 'prologueSeen', true);
	}
</script>

<svelte:head>
	<title>{t('app.title')}</title>
	<meta name="description" content={t('prologue.lede')} />
</svelte:head>

<main class="wrap">
	{#if seen}
		<h1>{t('app.title')}</h1>
		<p>{t('home.welcome.back')}</p>
		<a class="primary" href={map()}>{t('home.continue')}</a>
	{:else}
		<Prologue {example} onsave={save} onskip={skip} startHref={map()} skipHref={map()} />
	{/if}
</main>

<style>
	.wrap {
		max-width: 76rem;
		margin: 0 auto;
		padding: 0 var(--space-5);
	}
</style>
