<!--
	«Куда смотрит внимание» (part 14, lesson 1). A tall made-up page is cut into screens, and each
	screen is shaded by the share of viewing time it received in the Nielsen Norman Group's 2018
	eye-tracking study (57% on the first screen, 17% on the second, 7% on the third, 19% on
	everything below). The reader moves the call to action up and down the page and sees how much of
	the attention it can hope for. The shares are the study's averages for the pages it tested: a
	reference point for hypotheses, not a promise about the reader's own site. All pages are made up.
-->
<script lang="ts">
	import './shared.css';

	const screens = [
		{ n: 1, share: 57, name: 'Первый экран', has: 'шапка, заголовок, обещание' },
		{ n: 2, share: 17, name: 'Второй экран', has: 'как это работает' },
		{ n: 3, share: 7, name: 'Третий экран', has: 'примеры и доказательства' },
		{ n: 4, share: 19, name: 'Всё ниже', has: 'цены, вопросы, подвал' }
	];
	let at = $state(3);
	const share = $derived(screens[at - 1].share);
</script>

<figure class="dg">
	<figcaption>Где поставить кнопку</figcaption>
	<div class="dg-ctl" role="group" aria-label="Где находится призыв к действию">
		{#each screens as s (s.n)}
			<button type="button" aria-pressed={at === s.n} onclick={() => (at = s.n)}>{s.n === 4 ? 'Внизу' : `${s.n}-й экран`}</button>
		{/each}
	</div>
	<ol class="page">
		{#each screens as s (s.n)}
			<li style="--w: {s.share}%">
				<div class="heat" aria-hidden="true"></div>
				<div class="body">
					<strong>{s.name}</strong>: {s.has}
					<span class="dg-mono">внимания {s.share}%</span>
					{#if at === s.n}<span class="cta">[ Кнопка «Записаться» ]</span>{/if}
				</div>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		Если кнопка {at === 4 ? 'внизу страницы' : `на ${at}-м экране`}, на экран, где она стоит, приходится около <strong>{share}%</strong> времени, которое люди проводят на странице. Но кнопка работает не только по месту: если человек уже готов, он найдёт её и внизу, и поэтому кнопку часто ставят и вверху, и в конце.
	</p>
	<p class="dg-out">Доли взяты из исследования Nielsen Norman Group (2018) и усреднены по тем страницам, которые оно изучало. Для вашего сайта они ориентир для гипотезы, а не результат: проверять нужно на своих людях. Страница в схеме выдуманная.</p>
</figure>

<style>
	.page {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: 2px;
		max-width: 36rem;
	}
	li {
		position: relative;
		border: var(--line) solid var(--border-hairline);
		min-height: 4.5rem;
		overflow: hidden;
	}
	/* The share is a bar along the bottom of the screen, not a wash behind its words: under the
	   text, on Ink, the wash took the first screen's lines below 4.5:1 (axe, QA pass 28.10.2026). */
	.heat {
		position: absolute;
		inset: auto auto 0 0;
		height: 0.5rem;
		width: var(--w);
		background: var(--accent-measure);
	}
	.body {
		position: relative;
		display: grid;
		gap: 2px;
		padding: var(--space-3) var(--space-3) calc(var(--space-3) + 0.5rem);
	}
	.cta {
		font-weight: var(--weight-medium);
		color: var(--text-primary);
	}
</style>
