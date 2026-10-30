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
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			screens: [
				{ name: 'Первый экран', has: 'шапка, заголовок, обещание' },
				{ name: 'Второй экран', has: 'как это работает' },
				{ name: 'Третий экран', has: 'примеры и доказательства' },
				{ name: 'Всё ниже', has: 'цены, вопросы, подвал' }
			],
			caption: 'Где поставить кнопку',
			group: 'Где находится призыв к действию',
			bottom: 'Внизу',
			nth: (n: number) => `${n}-й экран`,
			attention: 'внимания',
			button: '{W.button}',
			where: (at: number) => (at === 4 ? 'внизу страницы' : `на ${at}-м экране`),
			outA: (where: string) => `Если кнопка ${where}, на экран, где она стоит, приходится около`,
			outB: 'времени, которое люди проводят на странице. Но кнопка работает не только по месту: если человек уже готов, он найдёт её и внизу, и поэтому кнопку часто ставят и вверху, и в конце.',
			note: 'Доли взяты из исследования Nielsen Norman Group (2018) и усреднены по тем страницам, которые оно изучало. Для вашего сайта они ориентир для гипотезы, а не результат: проверять нужно на своих людях. Страница в схеме выдуманная.'
		},
		en: {
			screens: [
				{ name: 'First screen', has: 'header, headline, promise' },
				{ name: 'Second screen', has: 'how it works' },
				{ name: 'Third screen', has: 'examples and proof' },
				{ name: 'Everything below', has: 'prices, questions, footer' }
			],
			caption: 'Where to put the button',
			group: 'Where the call to action is',
			bottom: 'At the bottom',
			nth: (n: number) => (n === 1 ? '1st screen' : n === 2 ? '2nd screen' : '3rd screen'),
			attention: 'of attention',
			button: '[ Book a consultation button ]',
			where: (at: number) => (at === 4 ? 'at the bottom of the page' : `on screen ${at}`),
			outA: (where: string) => `If the button is ${where}, about`,
			outB: 'of the time people spend on the page falls on the screen where it stands. But a button doesn’t work by place alone: a person who is ready will find it at the bottom too, which is why a button is often put both at the top and at the end.',
			note: 'The shares come from the Nielsen Norman Group study (2018) and are averaged over the pages it examined. For your site they are a reference for a hypothesis, not a result: you have to test on your own people. The page in the diagram is invented.'
		}
	});

	const shares = [57, 17, 7, 19];
	const screens = shares.map((share, i) => ({ n: i + 1, share, ...W.screens[i] }));
	let at = $state(3);
	const share = $derived(screens[at - 1].share);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each screens as s (s.n)}
			<button type="button" aria-pressed={at === s.n} onclick={() => (at = s.n)}>{s.n === 4 ? W.bottom : W.nth(s.n)}</button>
		{/each}
	</div>
	<ol class="page">
		{#each screens as s (s.n)}
			<li style="--w: {s.share}%">
				<div class="heat" aria-hidden="true"></div>
				<div class="body">
					<strong>{s.name}</strong>: {s.has}
					<span class="dg-mono">{s.share}% {W.attention}</span>
					{#if at === s.n}<span class="cta">{W.button}</span>{/if}
				</div>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">{W.outA(W.where(at))} <strong>{share}%</strong> {W.outB}</p>
	<p class="dg-out">{W.note}</p>
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
