<!--
	«Соединения и нормализация» (part 7, lesson 3). Two views on the same invented data, with the
	names of services taken from the person's brief. «Соединения»: services and categories, one
	service without a category and one category without services; INNER, LEFT and RIGHT JOIN shown
	as the rows that come out. «Нормализация»: one wide table of orders before and after it is split,
	and three events (a price changes, a phone changes, the only order is cancelled) showing how
	many rows each one touches.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let names = $state(['Первая услуга', 'Вторая услуга', 'Третья услуга', 'Четвёртая услуга']);
	onMount(async () => {
		try {
			const t = (await (await import('#lib/learner.ts')).persona()).items?.map((i) => i.title).filter(Boolean);
			if (t?.length) names = [...t, ...names].slice(0, 4);
		} catch {
			/* the example stays */
		}
	});

	let tab = $state<'join' | 'normal'>('join');

	/* ---- joins ---- */
	type Kind = 'inner' | 'left' | 'right';
	let kind = $state<Kind>('inner');
	const categories = [
		{ id: 1, name: 'Основное' },
		{ id: 2, name: 'Дополнительное' },
		{ id: 3, name: 'Архив' }
	];
	const items = $derived(names.map((title, i) => ({ id: i + 1, title, category_id: [1, 1, 2, null][i] as number | null })));
	const joined = $derived.by(() => {
		const rows: { title: string | null; cat: string | null }[] = [];
		const used = new Set<number>();
		for (const it of items) {
			const c = categories.find((x) => x.id === it.category_id);
			if (c) {
				rows.push({ title: it.title, cat: c.name });
				used.add(c.id);
			} else if (kind === 'left') rows.push({ title: it.title, cat: null });
		}
		if (kind === 'right') for (const c of categories) if (!used.has(c.id)) rows.push({ title: null, cat: c.name });
		return kind === 'right' ? rows.sort((a, b) => (a.cat ?? '').localeCompare(b.cat ?? '', 'ru')) : rows;
	});
	const sql = $derived(
		`SELECT items.title, categories.name\nFROM items\n${{ inner: 'JOIN', left: 'LEFT JOIN', right: 'RIGHT JOIN' }[kind]} categories\n  ON items.category_id = categories.id;`
	);
	const says: Record<Kind, string> = {
		inner: 'INNER JOIN (просто JOIN) оставляет только пары, у которых ключи совпали. Услуга без категории и категория без услуг из ответа пропадают.',
		left: 'LEFT JOIN оставляет все строки левой таблицы (услуги). Если пары нет, справа будет NULL. Так находят «услуги без категории»: WHERE categories.id IS NULL.',
		right: 'RIGHT JOIN то же самое, но все строки правой таблицы (категории). Слева будет NULL у категорий без услуг. Его почти всегда можно заменить на LEFT, поменяв таблицы местами.'
	};

	/* ---- normalisation ---- */
	type Ev = 'price' | 'phone' | 'cancel';
	let form = $state<'before' | 'after'>('before');
	let ev = $state<Ev>('price');
	const orders = $derived([
		{ n: 1, who: 'Клиент А', phone: '+7 000 000-00-01', item: names[0], price: 3000, cat: 'Основное' },
		{ n: 2, who: 'Клиент Б', phone: '+7 000 000-00-02', item: names[0], price: 3000, cat: 'Основное' },
		{ n: 3, who: 'Клиент В', phone: '+7 000 000-00-03', item: names[1], price: 12000, cat: 'Основное' },
		{ n: 4, who: 'Клиент А', phone: '+7 000 000-00-01', item: names[2], price: 1500, cat: 'Дополнительное' },
		{ n: 5, who: 'Клиент Г', phone: '+7 000 000-00-04', item: names[0], price: 3000, cat: 'Основное' },
		{ n: 6, who: 'Клиент Б', phone: '+7 000 000-00-02', item: names[2], price: 1500, cat: 'Дополнительное' }
	]);
	const events: Record<Ev, { title: string; hit: (o: { n: number; who: string; item: string }) => boolean; before: string; after: string }> = {
		price: {
			title: 'Изменилась цена первой услуги',
			hit: (o) => o.item === names[0],
			before: 'Цену надо исправить в каждой строке заказа, где есть эта услуга. Пропустите одну, и в базе будут две разные цены на одно и то же.',
			after: 'Цена лежит в одной строке таблицы услуг. Правим одно место, и все заказы видят новое значение через соединение.'
		},
		phone: {
			title: 'Клиент А сменил телефон',
			hit: (o) => o.who === 'Клиент А',
			before: 'Телефон повторён у каждого заказа клиента. Исправили не везде, и у одного человека два номера.',
			after: 'Телефон хранится один раз в таблице клиентов. Заказы только ссылаются на клиента.'
		},
		cancel: {
			title: 'Клиент Г отменил свой единственный заказ',
			hit: (o) => o.n === 5,
			before: 'Вместе со строкой заказа исчезли и сведения о клиенте Г: его телефона больше нигде нет. Это «аномалия удаления».',
			after: 'Удаляется только строка заказа. Клиент остаётся в таблице клиентов, и услуга остаётся в таблице услуг.'
		}
	};
	const cur = $derived(events[ev]);
	const touched = $derived(orders.filter((o) => cur.hit(o)).length);
</script>

<figure class="dg">
	<figcaption>{tab === 'join' ? 'Соединения: какие строки попадают в ответ' : 'Нормализация: сколько строк затрагивает одна правка'}</figcaption>
	<div class="dg-ctl" role="group" aria-label="Раздел схемы">
		<button type="button" aria-pressed={tab === 'join'} onclick={() => (tab = 'join')}>Соединения</button>
		<button type="button" aria-pressed={tab === 'normal'} onclick={() => (tab = 'normal')}>Нормализация</button>
	</div>

	{#if tab === 'join'}
		<div class="dg-ctl" role="group" aria-label="Вид соединения">
			<button type="button" aria-pressed={kind === 'inner'} onclick={() => (kind = 'inner')}>INNER JOIN</button>
			<button type="button" aria-pressed={kind === 'left'} onclick={() => (kind = 'left')}>LEFT JOIN</button>
			<button type="button" aria-pressed={kind === 'right'} onclick={() => (kind = 'right')}>RIGHT JOIN</button>
		</div>
		<div class="three">
			<div>
				<h4>items (услуги)</h4>
				<table class="t" aria-label="Таблица items">
					<thead><tr><th>id</th><th>title</th><th>category_id</th></tr></thead>
					<tbody>
						{#each items as r, i (i)}
							<tr class:lost={r.category_id === null && kind === 'inner'}><td>{r.id}</td><td>{r.title}</td><td>{r.category_id ?? 'NULL'}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div>
				<h4>categories</h4>
				<table class="t" aria-label="Таблица categories">
					<thead><tr><th>id</th><th>name</th></tr></thead>
					<tbody>
						{#each categories as c (c.id)}
							<tr class:lost={c.id === 3 && kind !== 'right'}><td>{c.id}</td><td>{c.name}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div>
				<h4>Результат: {joined.length} стр.</h4>
				<table class="t" aria-label="Результат соединения" aria-live="polite">
					<thead><tr><th>title</th><th>name</th></tr></thead>
					<tbody>
						{#each joined as r, i (i)}
							<tr><td>{r.title ?? 'NULL'}</td><td>{r.cat ?? 'NULL'}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<pre class="dg-box dg-mono">{sql}</pre>
		<p class="dg-out" aria-live="polite">{says[kind]}</p>
		<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> в таблице услуг одна услуга без категории, в таблице категорий одна категория без услуг. INNER JOIN теряет обе, LEFT JOIN сохраняет услугу без категории, RIGHT JOIN сохраняет категорию без услуг.</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label="Форма таблиц">
			<button type="button" aria-pressed={form === 'before'} onclick={() => (form = 'before')}>Одна большая таблица</button>
			<button type="button" aria-pressed={form === 'after'} onclick={() => (form = 'after')}>Разнесено по таблицам</button>
		</div>
		<div class="dg-ctl" role="group" aria-label="Событие">
			<button type="button" aria-pressed={ev === 'price'} onclick={() => (ev = 'price')}>Цена изменилась</button>
			<button type="button" aria-pressed={ev === 'phone'} onclick={() => (ev = 'phone')}>Клиент сменил телефон</button>
			<button type="button" aria-pressed={ev === 'cancel'} onclick={() => (ev = 'cancel')}>Отмена единственного заказа</button>
		</div>
		{#if form === 'before'}
			<div class="scroll" tabindex="0" role="region" aria-label="Таблица, прокручивается по горизонтали">
				<table class="t" aria-label="Одна таблица заказов">
					<thead><tr><th>заказ</th><th>клиент</th><th>телефон</th><th>услуга</th><th>цена</th><th>категория</th></tr></thead>
					<tbody>
						{#each orders as o (o.n)}
							<tr class:hit={cur.hit(o)}><td>{o.n}</td><td>{o.who}</td><td>{o.phone}</td><td>{o.item}</td><td>{o.price}</td><td>{o.cat}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="dg-out" aria-live="polite"><strong>{cur.title}: строк к правке {ev === 'cancel' ? 'удалить: 1' : touched}.</strong> {cur.before}</p>
		{:else}
			<div class="four">
				<div>
					<h4>clients</h4>
					<table class="t" aria-label="Таблица clients">
						<thead><tr><th>id</th><th>name</th><th>phone</th></tr></thead>
						<tbody>
							<tr class:hit={ev === 'phone'}><td>1</td><td>Клиент А</td><td>+7 000 000-00-01</td></tr>
							<tr><td>2</td><td>Клиент Б</td><td>+7 000 000-00-02</td></tr>
							<tr><td>3</td><td>Клиент В</td><td>+7 000 000-00-03</td></tr>
							<tr><td>4</td><td>Клиент Г</td><td>+7 000 000-00-04</td></tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4>items</h4>
					<table class="t" aria-label="Таблица items после разбиения">
						<thead><tr><th>id</th><th>title</th><th>price</th><th>category_id</th></tr></thead>
						<tbody>
							<tr class:hit={ev === 'price'}><td>1</td><td>{names[0]}</td><td>3000</td><td>1</td></tr>
							<tr><td>2</td><td>{names[1]}</td><td>12000</td><td>1</td></tr>
							<tr><td>3</td><td>{names[2]}</td><td>1500</td><td>2</td></tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4>categories</h4>
					<table class="t" aria-label="Таблица categories после разбиения">
						<thead><tr><th>id</th><th>name</th></tr></thead>
						<tbody>
							<tr><td>1</td><td>Основное</td></tr>
							<tr><td>2</td><td>Дополнительное</td></tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4>orders</h4>
					<table class="t" aria-label="Таблица orders после разбиения">
						<thead><tr><th>id</th><th>client_id</th><th>item_id</th></tr></thead>
						<tbody>
							<tr><td>1</td><td>1</td><td>1</td></tr>
							<tr><td>2</td><td>2</td><td>1</td></tr>
							<tr><td>3</td><td>3</td><td>2</td></tr>
							<tr><td>4</td><td>1</td><td>3</td></tr>
							<tr class:hit={ev === 'cancel'}><td>5</td><td>4</td><td>1</td></tr>
							<tr><td>6</td><td>2</td><td>3</td></tr>
						</tbody>
					</table>
				</div>
			</div>
			<p class="dg-out" aria-live="polite"><strong>{cur.title}: строк к правке {ev === 'cancel' ? 'удалить: 1' : 1}.</strong> {cur.after}</p>
		{/if}
		<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> в одной большой таблице цена и телефон повторяются в нескольких строках, и правка затрагивает все, а удаление единственного заказа стирает данные клиента. В разнесённых таблицах каждый факт лежит в одном месте. Данные придуманы.</p>
	{/if}
</figure>

<style>
	.three {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.four {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		font-size: var(--text-body);
		color: var(--text-primary);
	}
	.scroll {
		overflow-x: auto;
	}
	.t {
		width: 100%;
		border-collapse: collapse;
	}
	.t th,
	.t td {
		padding: var(--space-1) var(--space-2);
		border: var(--line) solid var(--border-hairline);
		text-align: left;
		vertical-align: top;
	}
	.t th {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	tr.lost td {
		color: var(--text-secondary);
		text-decoration: line-through;
	}
	tr.hit td {
		border-color: var(--accent-measure);
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	pre {
		margin: 0;
		overflow-x: auto;
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 44rem) {
		.three,
		.four {
			grid-template-columns: 1fr;
		}
	}
</style>
