<!-- Spaced repetition (spec §3.4 «Карточки», §4.6): the cards due now, one at a time. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t, pl } from '#lib/i18n/index.ts';
	import type { ReviewCard, RatingName } from '#lib/srs/index.ts';

	let queue = $state<ReviewCard[]>([]);
	let loaded = $state(false);
	let shown = $state(false);
	const card = $derived(queue[0]);

	onMount(async () => {
		const [{ db }, srs] = await Promise.all([import('#lib/learner.ts'), import('#lib/srs/index.ts')]);
		queue = await srs.due(await db());
		loaded = true;
	});

	async function rate(r: RatingName) {
		if (!card) return;
		const [{ db }, srs, { award }] = await Promise.all([import('#lib/learner.ts'), import('#lib/srs/index.ts'), import('#lib/game/index.ts')]);
		const d = await db();
		await srs.grade(d, card.id, r);
		await award(d, 'review');
		queue = queue.slice(1);
		shown = false;
	}

	const ratings: RatingName[] = ['again', 'hard', 'good', 'easy'];
</script>

<svelte:head><title>{t('review.title')}: {t('app.title')}</title></svelte:head>

<div class="container">
	<header class="head">
		<h1>{t('review.title')}</h1>
		<p class="lede">{t('review.lede')}</p>
	</header>

	{#if loaded}
		{#if card}
			<p class="count" role="status">{t('review.due', { n: queue.length, cards: pl(queue.length, 'card.forms') })}</p>
			<section class="card" aria-live="polite">
				<p class="front">{card.front}</p>
				{#if shown}
					<p class="back">{card.back}</p>
					<fieldset>
						<legend>{t('review.rate')}</legend>
						<div class="rates">
							{#each ratings as r (r)}
								<button type="button" class={r === 'good' ? 'primary' : 'secondary'} onclick={() => rate(r)}>{t(`review.${r}`)}</button>
							{/each}
						</div>
					</fieldset>
				{:else}
					<button type="button" class="secondary" onclick={() => (shown = true)}>{t('review.show')}</button>
				{/if}
			</section>
		{:else}
			<section class="empty">
				<p class="front">{t('review.empty')}</p>
				<p>{t('review.empty.next')}</p>
			</section>
		{/if}
	{/if}
</div>

<style>
	.head {
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
		margin: 0;
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
	}
	.count {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.card,
	.empty {
		max-width: 40rem;
		padding: var(--space-7) var(--space-6);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-body);
	}
	.front {
		margin: 0 0 var(--space-5);
		font-family: var(--font-serif);
		font-size: var(--text-display-sm);
		line-height: 1.2;
		color: var(--text-primary);
	}
	.back {
		margin: 0 0 var(--space-6);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-body);
	}
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
	}
	legend {
		padding: 0;
		margin-bottom: var(--space-3);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.rates {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	.empty p:last-child {
		margin: 0;
		color: var(--text-body);
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		.card,
		.empty {
			padding: var(--space-5) var(--space-4);
		}
	}
</style>
