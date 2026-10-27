<!--
	«Что человек хочет на самом деле» (part 13, lesson 5). Eight search queries of a made-up land-law
	specialist's audience. The reader labels each with one of four intents (узнать, выбрать, сделать,
	найти конкретное место) and gets an immediate reading: which page type serves that intent and
	which stage of See–Think–Do–Care it belongs to (part 11). Some queries are honestly ambiguous, and
	the diagram says so rather than pretending that intent is always one thing.
-->
<script lang="ts">
	import './shared.css';

	type Intent = 'know' | 'choose' | 'do' | 'find';
	const intents: { id: Intent; name: string; page: string; stdc: string }[] = [
		{ id: 'know', name: 'Узнать', page: 'статья или ответ на вопрос', stdc: 'See / Think' },
		{ id: 'choose', name: 'Выбрать', page: 'сравнение или разбор вариантов', stdc: 'Think' },
		{ id: 'do', name: 'Сделать', page: 'страница услуги с ценой и формой', stdc: 'Do' },
		{ id: 'find', name: 'Найти место', page: 'страница с контактами, карточка организации', stdc: 'Do / Care' }
	];
	const queries: { q: string; answer: Intent; note: string }[] = [
		{ q: 'как узнать границы своего участка', answer: 'know', note: 'человек ещё не думает о специалисте: ему нужен ответ' },
		{ q: 'чем межевание отличается от топосъёмки', answer: 'choose', note: 'человек выбирает между вариантами' },
		{ q: 'межевание участка цена', answer: 'do', note: 'человек почти решил и ищет цену и условия' },
		{ q: 'кадастровый инженер Заречье телефон', answer: 'find', note: 'человек ищет конкретный контакт рядом' },
		{ q: 'судебная землеустроительная экспертиза что это', answer: 'know', note: 'определение: нужна статья, а не прайс' },
		{ q: 'заказать выезд кадастрового инженера', answer: 'do', note: 'глагол «заказать» говорит о намерении действовать' },
		{ q: 'что делать, если сосед сдвинул забор', answer: 'know', note: 'неоднозначно: человеку нужен ответ, а потом, возможно, помощь' },
		{ q: 'услуги кадастрового инженера отзывы', answer: 'choose', note: 'человек сравнивает и ищет подтверждения' }
	];
	let picked = $state<(Intent | null)[]>(queries.map(() => null));
	const done = $derived(picked.filter((p) => p !== null).length);
	const right = $derived(picked.filter((p, i) => p === queries[i].answer).length);
	const intentOf = (id: Intent) => intents.find((x) => x.id === id)!;
</script>

<figure class="dg">
	<figcaption>Восемь запросов: чего хочет человек</figcaption>
	<ol>
		{#each queries as q, i (i)}
			<li>
				<p class="q">«{q.q}»</p>
				<div class="dg-ctl" role="group" aria-label="Намерение для запроса «{q.q}»">
					{#each intents as it (it.id)}
						<button type="button" aria-pressed={picked[i] === it.id} onclick={() => (picked[i] = it.id)}>{it.name}</button>
					{/each}
				</div>
				{#if picked[i]}
					<p class="fb" aria-live="polite">
						{#if picked[i] === q.answer}
							Верно: {q.note}. Подойдёт {intentOf(q.answer).page} (стадия {intentOf(q.answer).stdc}).
						{:else}
							Скорее всего иначе: {q.note}. Подойдёт {intentOf(q.answer).page} (стадия {intentOf(q.answer).stdc}).
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">Размечено: {done} из {queries.length}, совпало с авторской разметкой: {right}. Авторская разметка тоже мнение: проверяйте настоящие запросы по статистике Вебмастера и Search Console.</p>
</figure>

<style>
	ol {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-4);
	}
	.q {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.fb {
		margin: 0;
		color: var(--text-secondary);
	}
</style>
