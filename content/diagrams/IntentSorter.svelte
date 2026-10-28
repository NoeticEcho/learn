<!--
	«Что человек хочет на самом деле» (part 13, lesson 5). Eight search queries of a made-up land-law
	specialist's audience. The reader labels each with one of four intents (узнать, выбрать, сделать,
	найти конкретное место) and gets an immediate reading: which page type serves that intent and
	which stage of See–Think–Do–Care it belongs to (part 11). Some queries are honestly ambiguous, and
	the diagram says so rather than pretending that intent is always one thing.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Intent = 'know' | 'choose' | 'do' | 'find';
	const W = pick({
		ru: {
			intents: [
				{ name: 'Узнать', page: 'статья или ответ на вопрос', stdc: 'See / Think' },
				{ name: 'Выбрать', page: 'сравнение или разбор вариантов', stdc: 'Think' },
				{ name: 'Сделать', page: 'страница услуги с ценой и формой', stdc: 'Do' },
				{ name: 'Найти место', page: 'страница с контактами, карточка организации', stdc: 'Do / Care' }
			],
			queries: [
				{ q: 'как узнать границы своего участка', note: 'человек ещё не думает о специалисте: ему нужен ответ' },
				{ q: 'чем межевание отличается от топосъёмки', note: 'человек выбирает между вариантами' },
				{ q: 'межевание участка цена', note: 'человек почти решил и ищет цену и условия' },
				{ q: 'кадастровый инженер Заречье телефон', note: 'человек ищет конкретный контакт рядом' },
				{ q: 'судебная землеустроительная экспертиза что это', note: 'определение: нужна статья, а не прайс' },
				{ q: 'заказать выезд кадастрового инженера', note: 'глагол «заказать» говорит о намерении действовать' },
				{ q: 'что делать, если сосед сдвинул забор', note: 'неоднозначно: человеку нужен ответ, а потом, возможно, помощь' },
				{ q: 'услуги кадастрового инженера отзывы', note: 'человек сравнивает и ищет подтверждения' }
			],
			caption: 'Восемь запросов: чего хочет человек',
			label: (q: string) => `Намерение для запроса «${q}»`,
			quote: (q: string) => `«${q}»`,
			right: 'Верно',
			wrong: 'Скорее всего иначе',
			fits: 'Подойдёт',
			stage: 'стадия',
			marked: 'Размечено',
			of: 'из',
			matched: 'совпало с авторской разметкой',
			after: 'Авторская разметка тоже мнение: проверяйте настоящие запросы по статистике Вебмастера и Search Console.'
		},
		en: {
			intents: [
				{ name: 'Know', page: 'an article or an answer to a question', stdc: 'See / Think' },
				{ name: 'Choose', page: 'a comparison or a walk through the options', stdc: 'Think' },
				{ name: 'Do', page: 'a service page with a price and a form', stdc: 'Do' },
				{ name: 'Find a place', page: 'a contact page, a business listing', stdc: 'Do / Care' }
			],
			queries: [
				{ q: 'how to find my property boundaries', note: 'the person isn’t yet thinking of a specialist: they need an answer' },
				{ q: 'boundary survey vs topographic survey', note: 'the person is choosing between options' },
				{ q: 'boundary survey cost', note: 'the person has nearly decided and wants the price and terms' },
				{ q: 'land surveyor Riverbend phone number', note: 'the person is looking for a specific contact nearby' },
				{ q: 'what is a boundary expert witness', note: 'a definition: an article is needed, not a price list' },
				{ q: 'book a land surveyor site visit', note: 'the verb “book” signals an intent to act' },
				{ q: 'what to do if my neighbor moved the fence', note: 'ambiguous: the person needs an answer first, and perhaps help afterwards' },
				{ q: 'land surveyor services reviews', note: 'the person is comparing and looking for proof' }
			],
			caption: 'Eight queries: what does the person want',
			label: (q: string) => `Intent of the query “${q}”`,
			quote: (q: string) => `“${q}”`,
			right: 'Right',
			wrong: 'Probably different',
			fits: 'It calls for',
			stage: 'stage',
			marked: 'Labeled',
			of: 'of',
			matched: 'agreeing with the author’s labels',
			after: 'The author’s labels are an opinion too: check real queries in the statistics of Search Console and Bing Webmaster Tools.'
		}
	});
	const ids: Intent[] = ['know', 'choose', 'do', 'find'];
	const answers: Intent[] = ['know', 'choose', 'do', 'find', 'know', 'do', 'know', 'choose'];
	const intents: { id: Intent; name: string; page: string; stdc: string }[] = W.intents.map((x, i) => ({ id: ids[i], ...x }));
	const queries: { q: string; answer: Intent; note: string }[] = W.queries.map((x, i) => ({ ...x, answer: answers[i] }));
	let picked = $state<(Intent | null)[]>(queries.map(() => null));
	const done = $derived(picked.filter((p) => p !== null).length);
	const right = $derived(picked.filter((p, i) => p === queries[i].answer).length);
	const intentOf = (id: Intent) => intents.find((x) => x.id === id)!;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<ol>
		{#each queries as q, i (i)}
			<li>
				<p class="q">{W.quote(q.q)}</p>
				<div class="dg-ctl" role="group" aria-label={W.label(q.q)}>
					{#each intents as it (it.id)}
						<button type="button" aria-pressed={picked[i] === it.id} onclick={() => (picked[i] = it.id)}>{it.name}</button>
					{/each}
				</div>
				{#if picked[i]}
					<p class="fb" aria-live="polite">
						{#if picked[i] === q.answer}
							{W.right}: {q.note}. {W.fits} {intentOf(q.answer).page} ({W.stage} {intentOf(q.answer).stdc}).
						{:else}
							{W.wrong}: {q.note}. {W.fits} {intentOf(q.answer).page} ({W.stage} {intentOf(q.answer).stdc}).
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">{W.marked}: {done} {W.of} {queries.length}, {W.matched}: {right}. {W.after}</p>
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
