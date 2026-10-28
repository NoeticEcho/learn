<!--
	«Линейка скромности» (part 12, lesson 12). A sample text about an invented expert is checked for
	four kinds of phrases that tend to cause trouble in the advertising of expert services:
	superlatives, guarantees of a result, comparisons with others, and testimonials. The detector is
	crude and only points at places to look; it is not legal advice and the lesson says so.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			text: 'Мы лучшие в городе и гарантируем результат. В отличие от других специалистов, мы никогда не проигрываем споры. Тысячи довольных клиентов оставили нам благодарные отзывы. Аттестат кадастрового инженера, стаж с 2012 года.',
			groups: [
				{ id: 'sup', name: 'Превосходные степени', re: /(лучш|№\s?1|номер один|самы[йеая]+\s|единственн|уникальн|топов)[а-яё]*/giu, why: 'Нужно подтверждение, по какому критерию и с кем сравнение. Без него лучше убрать.' },
				{ id: 'gar', name: 'Гарантии результата', re: /(гарантиру|100\s?%|обязательно\s+(выиграем|получите)|без\s+риска|никогда\s+не\s+проигрыва|всегда\s+выигрыва|вернём\s+деньги)[а-яё]*/giu, why: 'Исход дела или проверки зависит не только от вас. Обещать его нельзя.' },
				{ id: 'cmp', name: 'Сравнение с другими', re: /(в\s+отличие\s+от|лучше\s+чем|дешевле\s+чем|конкурент|другие\s+специалисты|остальные)[а-яё]*/giu, why: 'Сравнивать можно по проверяемым признакам и корректно, а чаще проще рассказать о себе.' },
				{ id: 'rev', name: 'Отзывы и рекомендации', re: /(отзыв|благодарн|рекоменду|довольн[а-яё]*\s+клиент)[а-яё]*/giu, why: 'Для некоторых профессий отзывы в рекламе ограничены правилами. Проверьте свои.' }
			],
			quote: (h: string[]) => ` «${h.join('», «')}»`,
			caption: 'Линейка скромности',
			area: 'Текст о себе (можно заменить своим)',
			count: 'Мест, на которые стоит посмотреть ещё раз: ',
			note: 'Программа ищет по словам и многое пропустит. Она не юрист и ничего не разрешает и не запрещает: её итог лишь повод перечитать текст и показать его специалисту.'
		},
		en: {
			text: 'We are the best in town and guarantee results. Unlike other specialists, we never lose a dispute. Thousands of happy clients have left us glowing reviews. Licensed land surveyor, in practice since 2012.',
			groups: [
				{ id: 'sup', name: 'Superlatives', re: /(?<!\w)(best|finest|number one|no\.\s?1|#\s?1|top[- ]rated|leading|unrivall?ed|unmatched|unique|only|most (?:experienced|trusted|qualified|reliable)|world[- ]class)(?!\w)/giu, why: 'Needs proof of the criterion and of who it is compared with. Without it, better to remove.' },
				{ id: 'gar', name: 'Guarantees of a result', re: /(?<!\w)(guarantee[ds]?|100\s?%|risk[- ]free|never lose[s]?|always win[s]?|certain to|money[- ]back|we(?:'|’)ll win|we will win)(?!\w)/giu, why: 'The outcome of a case or an inspection depends on more than you. It cannot be promised.' },
				{ id: 'cmp', name: 'Comparisons with others', re: /(?<!\w)(unlike (?:other|most|many)|better than|cheaper than|competitors?|other (?:specialists|lawyers|attorneys|surveyors|experts|firms)|everyone else|the rest)(?!\w)/giu, why: 'Comparisons are allowed only if fair and checkable, and it is usually simpler to talk about yourself.' },
				{ id: 'rev', name: 'Testimonials and recommendations', re: /(?<!\w)(testimonials?|reviews?|recommend\w*|thank\w*|(?:happy|satisfied) (?:clients?|customers?))(?!\w)/giu, why: 'For some professions, testimonials in advertising are limited by rules. Check yours.' }
			],
			quote: (h: string[]) => ` “${h.join('”, “')}”`,
			caption: 'The modesty ruler',
			area: 'Text about yourself (you can replace it with your own)',
			count: 'Places worth another look: ',
			note: 'The program searches by words and will miss a lot. It is not a lawyer and neither permits nor forbids anything: its result is only a reason to reread the text and show it to a specialist.'
		}
	});
	let text = $state(W.text);
	const groups = W.groups;
	const results = $derived(groups.map((g) => ({ ...g, hits: [...text.matchAll(g.re)].map((m) => m[0].trim()) })));
	const total = $derived(results.reduce((n, r) => n + r.hits.length, 0));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<label class="area">{W.area}
		<textarea rows="5" bind:value={text}></textarea>
	</label>
	<p class="dg-out" aria-live="polite">{W.count}<strong>{total}</strong>.</p>
	<ul class="res">
		{#each results as r (r.id)}
			<li class:hit={r.hits.length > 0}>
				<strong>{r.name}: {r.hits.length}</strong>
				{#if r.hits.length}<span class="dg-mono">{W.quote(r.hits)}</span>{/if}
				<p>{r.why}</p>
			</li>
		{/each}
	</ul>
	<p class="dg-out">{W.note}</p>
</figure>

<style>
	.area {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	textarea {
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
		font: inherit;
		max-width: var(--measure);
	}
	.res {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.res li {
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.res li.hit {
		border-color: var(--border-brass);
		border-left-width: 4px;
	}
	.res p {
		margin: var(--space-1) 0 0;
		color: var(--text-secondary);
	}
</style>
