<!--
	«Линейка скромности» (part 12, lesson 12). A sample text about an invented expert is checked for
	four kinds of phrases that tend to cause trouble in the advertising of expert services:
	superlatives, guarantees of a result, comparisons with others, and testimonials. The detector is
	crude and only points at places to look; it is not legal advice and the lesson says so.
-->
<script lang="ts">
	import './shared.css';

	let text = $state(
		'Мы лучшие в городе и гарантируем результат. В отличие от других специалистов, мы никогда не проигрываем споры. Тысячи довольных клиентов оставили нам благодарные отзывы. Аттестат кадастрового инженера, стаж с 2012 года.'
	);
	const groups = [
		{ id: 'sup', name: 'Превосходные степени', re: /(лучш|№\s?1|номер один|самы[йеая]+\s|единственн|уникальн|топов)[а-яё]*/giu, why: 'Нужно подтверждение, по какому критерию и с кем сравнение. Без него лучше убрать.' },
		{ id: 'gar', name: 'Гарантии результата', re: /(гарантиру|100\s?%|обязательно\s+(выиграем|получите)|без\s+риска|никогда\s+не\s+проигрыва|всегда\s+выигрыва|вернём\s+деньги)[а-яё]*/giu, why: 'Исход дела или проверки зависит не только от вас. Обещать его нельзя.' },
		{ id: 'cmp', name: 'Сравнение с другими', re: /(в\s+отличие\s+от|лучше\s+чем|дешевле\s+чем|конкурент|другие\s+специалисты|остальные)[а-яё]*/giu, why: 'Сравнивать можно по проверяемым признакам и корректно, а чаще проще рассказать о себе.' },
		{ id: 'rev', name: 'Отзывы и рекомендации', re: /(отзыв|благодарн|рекоменду|довольн[а-яё]*\s+клиент)[а-яё]*/giu, why: 'Для некоторых профессий отзывы в рекламе ограничены правилами. Проверьте свои.' }
	];
	const results = $derived(groups.map((g) => ({ ...g, hits: [...text.matchAll(g.re)].map((m) => m[0].trim()) })));
	const total = $derived(results.reduce((n, r) => n + r.hits.length, 0));
</script>

<figure class="dg">
	<figcaption>Линейка скромности</figcaption>
	<label class="area">Текст о себе (можно заменить своим)
		<textarea rows="5" bind:value={text}></textarea>
	</label>
	<p class="dg-out" aria-live="polite">Мест, на которые стоит посмотреть ещё раз: <strong>{total}</strong>.</p>
	<ul class="res">
		{#each results as r (r.id)}
			<li class:hit={r.hits.length > 0}>
				<strong>{r.name}: {r.hits.length}</strong>
				{#if r.hits.length}<span class="dg-mono"> «{r.hits.join('», «')}»</span>{/if}
				<p>{r.why}</p>
			</li>
		{/each}
	</ul>
	<p class="dg-out">Программа ищет по словам и многое пропустит. Она не юрист и ничего не разрешает и не запрещает: её итог лишь повод перечитать текст и показать его специалисту.</p>
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
