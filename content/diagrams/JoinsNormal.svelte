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
	import { pick } from '#lib/i18n/index.ts';

	/* The words of the diagram, one entry per edition (docs/content-plan/README.md, «English edition»). */
	const W = pick({
		ru: {
			sample: ['Первая услуга', 'Вторая услуга', 'Третья услуга', 'Четвёртая услуга'],
			cats: ['Основное', 'Дополнительное', 'Архив'],
			clients: ['Клиент А', 'Клиент Б', 'Клиент В', 'Клиент Г'],
			phone: (n: number) => `+7 000 000-00-0${n}`,
			locale: 'ru',
			inner: 'INNER JOIN (просто JOIN) оставляет только пары, у которых ключи совпали. Услуга без категории и категория без услуг из ответа пропадают.',
			left: 'LEFT JOIN оставляет все строки левой таблицы (услуги). Если пары нет, справа будет NULL. Так находят «услуги без категории»: WHERE categories.id IS NULL.',
			right: 'RIGHT JOIN то же самое, но все строки правой таблицы (категории). Слева будет NULL у категорий без услуг. Его почти всегда можно заменить на LEFT, поменяв таблицы местами.',
			price: 'Изменилась цена первой услуги',
			priceBefore: 'Цену надо исправить в каждой строке заказа, где есть эта услуга. Пропустите одну, и в базе будут две разные цены на одно и то же.',
			priceAfter: 'Цена лежит в одной строке таблицы услуг. Правим одно место, и все заказы видят новое значение через соединение.',
			phoneTitle: 'Клиент А сменил телефон',
			phoneBefore: 'Телефон повторён у каждого заказа клиента. Исправили не везде, и у одного человека два номера.',
			phoneAfter: 'Телефон хранится один раз в таблице клиентов. Заказы только ссылаются на клиента.',
			cancelTitle: 'Клиент Г отменил свой единственный заказ',
			cancelBefore: 'Вместе со строкой заказа исчезли и сведения о клиенте Г: его телефона больше нигде нет. Это «аномалия удаления».',
			cancelAfter: 'Удаляется только строка заказа. Клиент остаётся в таблице клиентов, и услуга остаётся в таблице услуг.',
			capJoin: 'Соединения: какие строки попадают в ответ',
			capNormal: 'Нормализация: сколько строк затрагивает одна правка',
			groupTab: 'Раздел схемы',
			tabJoin: 'Соединения',
			tabNormal: 'Нормализация',
			groupKind: 'Вид соединения',
			itemsHead: 'items (услуги)',
			tableItems: 'Таблица items',
			tableCats: 'Таблица categories',
			result: (n: number) => `Результат: ${n} стр.`,
			tableResult: 'Результат соединения',
			altJoin: 'в таблице услуг одна услуга без категории, в таблице категорий одна категория без услуг. INNER JOIN теряет обе, LEFT JOIN сохраняет услугу без категории, RIGHT JOIN сохраняет категорию без услуг.',
			alt: 'Текстовая альтернатива:',
			groupForm: 'Форма таблиц',
			formBefore: 'Одна большая таблица',
			formAfter: 'Разнесено по таблицам',
			groupEvent: 'Событие',
			evPrice: 'Цена изменилась',
			evPhone: 'Клиент сменил телефон',
			evCancel: 'Отмена единственного заказа',
			scroll: 'Таблица, прокручивается по горизонтали',
			tableOrders: 'Одна таблица заказов',
			headOrders: ['заказ', 'клиент', 'телефон', 'услуга', 'цена', 'категория'],
			touched: (title: string, cancel: boolean, n: number) => `${title}: строк к правке ${cancel ? 'удалить: 1' : n}.`,
			tableClients: 'Таблица clients',
			tableItemsSplit: 'Таблица items после разбиения',
			tableCatsSplit: 'Таблица categories после разбиения',
			tableOrdersSplit: 'Таблица orders после разбиения',
			altNormal: 'в одной большой таблице цена и телефон повторяются в нескольких строках, и правка затрагивает все, а удаление единственного заказа стирает данные клиента. В разнесённых таблицах каждый факт лежит в одном месте. Данные придуманы.'
		},
		en: {
			sample: ['First service', 'Second service', 'Third service', 'Fourth service'],
			cats: ['Core', 'Extras', 'Archive'],
			clients: ['Client A', 'Client B', 'Client C', 'Client D'],
			phone: (n: number) => `+1 000 000 000${n}`,
			locale: 'en',
			inner: 'INNER JOIN (plain JOIN) keeps only the pairs whose keys match. A service with no category and a category with no services both drop out of the answer.',
			left: 'LEFT JOIN keeps every row of the left table (the services). Where there is no pair, the right side is NULL. That is how to find “services without a category”: WHERE categories.id IS NULL.',
			right: 'RIGHT JOIN is the same, but it keeps every row of the right table (the categories). Categories with no services get NULL on the left. It can almost always be replaced by LEFT JOIN with the tables swapped.',
			price: 'The price of the first service changed',
			priceBefore: 'The price has to be fixed in every order row that has this service. Miss one, and the database holds two different prices for the same thing.',
			priceAfter: 'The price sits in a single row of the services table. Fix one place, and every order sees the new value through the join.',
			phoneTitle: 'Client A changed their phone number',
			phoneBefore: 'The number is repeated in each of the client’s orders. If one is missed, the same person has two numbers.',
			phoneAfter: 'The number is stored once, in the clients table. Orders only refer to the client.',
			cancelTitle: 'Client D canceled their only order',
			cancelBefore: 'Along with the order row, everything known about client D is gone: their phone number is nowhere else. This is the “deletion anomaly”.',
			cancelAfter: 'Only the order row is deleted. The client stays in the clients table, and the service stays in the services table.',
			capJoin: 'Joins: which rows reach the answer',
			capNormal: 'Normalization: how many rows one change touches',
			groupTab: 'Part of the diagram',
			tabJoin: 'Joins',
			tabNormal: 'Normalization',
			groupKind: 'Kind of join',
			itemsHead: 'items (services)',
			tableItems: 'Table items',
			tableCats: 'Table categories',
			result: (n: number) => `Result: ${n} ${n === 1 ? 'row' : 'rows'}`,
			tableResult: 'Result of the join',
			altJoin: 'the services table has one service with no category, and the categories table has one category with no services. INNER JOIN loses both, LEFT JOIN keeps the service without a category, and RIGHT JOIN keeps the category without services.',
			alt: 'Text alternative:',
			groupForm: 'Shape of the tables',
			formBefore: 'One big table',
			formAfter: 'Split into tables',
			groupEvent: 'Event',
			evPrice: 'A price changed',
			evPhone: 'A client changed phone',
			evCancel: 'The only order is canceled',
			scroll: 'Table, scrolls sideways',
			tableOrders: 'One table of orders',
			headOrders: ['order', 'client', 'phone', 'service', 'price', 'category'],
			touched: (title: string, cancel: boolean, n: number) => `${title}: rows to ${cancel ? 'delete: 1' : `change: ${n}`}.`,
			tableClients: 'Table clients',
			tableItemsSplit: 'Table items after the split',
			tableCatsSplit: 'Table categories after the split',
			tableOrdersSplit: 'Table orders after the split',
			altNormal: 'in one big table the price and the phone number repeat across several rows, so a fix touches all of them, and deleting the only order erases the client’s data. In the split tables every fact lives in one place. The data is made up.'
		}
	});

	let names = $state(W.sample);
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
		{ id: 1, name: W.cats[0] },
		{ id: 2, name: W.cats[1] },
		{ id: 3, name: W.cats[2] }
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
		return kind === 'right' ? rows.sort((a, b) => (a.cat ?? '').localeCompare(b.cat ?? '', W.locale)) : rows;
	});
	const sql = $derived(
		`SELECT items.title, categories.name\nFROM items\n${{ inner: 'JOIN', left: 'LEFT JOIN', right: 'RIGHT JOIN' }[kind]} categories\n  ON items.category_id = categories.id;`
	);
	const says: Record<Kind, string> = { inner: W.inner, left: W.left, right: W.right };

	/* ---- normalisation ---- */
	type Ev = 'price' | 'phone' | 'cancel';
	let form = $state<'before' | 'after'>('before');
	let ev = $state<Ev>('price');
	const orders = $derived([
		{ n: 1, who: W.clients[0], phone: W.phone(1), item: names[0], price: 3000, cat: W.cats[0] },
		{ n: 2, who: W.clients[1], phone: W.phone(2), item: names[0], price: 3000, cat: W.cats[0] },
		{ n: 3, who: W.clients[2], phone: W.phone(3), item: names[1], price: 12000, cat: W.cats[0] },
		{ n: 4, who: W.clients[0], phone: W.phone(1), item: names[2], price: 1500, cat: W.cats[1] },
		{ n: 5, who: W.clients[3], phone: W.phone(4), item: names[0], price: 3000, cat: W.cats[0] },
		{ n: 6, who: W.clients[1], phone: W.phone(2), item: names[2], price: 1500, cat: W.cats[1] }
	]);
	const events: Record<Ev, { title: string; hit: (o: { n: number; who: string; item: string }) => boolean; before: string; after: string }> = {
		price: {
			title: W.price,
			hit: (o) => o.item === names[0],
			before: W.priceBefore,
			after: W.priceAfter
		},
		phone: {
			title: W.phoneTitle,
			hit: (o) => o.who === W.clients[0],
			before: W.phoneBefore,
			after: W.phoneAfter
		},
		cancel: {
			title: W.cancelTitle,
			hit: (o) => o.n === 5,
			before: W.cancelBefore,
			after: W.cancelAfter
		}
	};
	const cur = $derived(events[ev]);
	const touched = $derived(orders.filter((o) => cur.hit(o)).length);
</script>

<figure class="dg">
	<figcaption>{tab === 'join' ? W.capJoin : W.capNormal}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.groupTab}>
		<button type="button" aria-pressed={tab === 'join'} onclick={() => (tab = 'join')}>{W.tabJoin}</button>
		<button type="button" aria-pressed={tab === 'normal'} onclick={() => (tab = 'normal')}>{W.tabNormal}</button>
	</div>

	{#if tab === 'join'}
		<div class="dg-ctl" role="group" aria-label={W.groupKind}>
			<button type="button" aria-pressed={kind === 'inner'} onclick={() => (kind = 'inner')}>INNER JOIN</button>
			<button type="button" aria-pressed={kind === 'left'} onclick={() => (kind = 'left')}>LEFT JOIN</button>
			<button type="button" aria-pressed={kind === 'right'} onclick={() => (kind = 'right')}>RIGHT JOIN</button>
		</div>
		<div class="three">
			<div>
				<div class="dh">{W.itemsHead}</div>
				<table class="t" aria-label={W.tableItems}>
					<thead><tr><th>id</th><th>title</th><th>category_id</th></tr></thead>
					<tbody>
						{#each items as r, i (i)}
							<tr class:lost={r.category_id === null && kind === 'inner'}><td>{r.id}</td><td>{r.title}</td><td>{r.category_id ?? 'NULL'}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div>
				<div class="dh">categories</div>
				<table class="t" aria-label={W.tableCats}>
					<thead><tr><th>id</th><th>name</th></tr></thead>
					<tbody>
						{#each categories as c (c.id)}
							<tr class:lost={c.id === 3 && kind !== 'right'}><td>{c.id}</td><td>{c.name}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div>
				<div class="dh">{W.result(joined.length)}</div>
				<table class="t" aria-label={W.tableResult} aria-live="polite">
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
		<p class="dg-out alt"><strong>{W.alt}</strong> {W.altJoin}</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label={W.groupForm}>
			<button type="button" aria-pressed={form === 'before'} onclick={() => (form = 'before')}>{W.formBefore}</button>
			<button type="button" aria-pressed={form === 'after'} onclick={() => (form = 'after')}>{W.formAfter}</button>
		</div>
		<div class="dg-ctl" role="group" aria-label={W.groupEvent}>
			<button type="button" aria-pressed={ev === 'price'} onclick={() => (ev = 'price')}>{W.evPrice}</button>
			<button type="button" aria-pressed={ev === 'phone'} onclick={() => (ev = 'phone')}>{W.evPhone}</button>
			<button type="button" aria-pressed={ev === 'cancel'} onclick={() => (ev = 'cancel')}>{W.evCancel}</button>
		</div>
		{#if form === 'before'}
			<div class="scroll" tabindex="0" role="region" aria-label={W.scroll}>
				<table class="t" aria-label={W.tableOrders}>
					<thead><tr>{#each W.headOrders as h (h)}<th>{h}</th>{/each}</tr></thead>
					<tbody>
						{#each orders as o (o.n)}
							<tr class:hit={cur.hit(o)}><td>{o.n}</td><td>{o.who}</td><td>{o.phone}</td><td>{o.item}</td><td>{o.price}</td><td>{o.cat}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="dg-out" aria-live="polite"><strong>{W.touched(cur.title, ev === 'cancel', touched)}</strong> {cur.before}</p>
		{:else}
			<div class="four">
				<div>
					<div class="dh">clients</div>
					<table class="t" aria-label={W.tableClients}>
						<thead><tr><th>id</th><th>name</th><th>phone</th></tr></thead>
						<tbody>
							<tr class:hit={ev === 'phone'}><td>1</td><td>{W.clients[0]}</td><td>{W.phone(1)}</td></tr>
							<tr><td>2</td><td>{W.clients[1]}</td><td>{W.phone(2)}</td></tr>
							<tr><td>3</td><td>{W.clients[2]}</td><td>{W.phone(3)}</td></tr>
							<tr><td>4</td><td>{W.clients[3]}</td><td>{W.phone(4)}</td></tr>
						</tbody>
					</table>
				</div>
				<div>
					<div class="dh">items</div>
					<table class="t" aria-label={W.tableItemsSplit}>
						<thead><tr><th>id</th><th>title</th><th>price</th><th>category_id</th></tr></thead>
						<tbody>
							<tr class:hit={ev === 'price'}><td>1</td><td>{names[0]}</td><td>3000</td><td>1</td></tr>
							<tr><td>2</td><td>{names[1]}</td><td>12000</td><td>1</td></tr>
							<tr><td>3</td><td>{names[2]}</td><td>1500</td><td>2</td></tr>
						</tbody>
					</table>
				</div>
				<div>
					<div class="dh">categories</div>
					<table class="t" aria-label={W.tableCatsSplit}>
						<thead><tr><th>id</th><th>name</th></tr></thead>
						<tbody>
							<tr><td>1</td><td>{W.cats[0]}</td></tr>
							<tr><td>2</td><td>{W.cats[1]}</td></tr>
						</tbody>
					</table>
				</div>
				<div>
					<div class="dh">orders</div>
					<table class="t" aria-label={W.tableOrdersSplit}>
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
			<p class="dg-out" aria-live="polite"><strong>{W.touched(cur.title, ev === 'cancel', 1)}</strong> {cur.after}</p>
		{/if}
		<p class="dg-out alt"><strong>{W.alt}</strong> {W.altNormal}</p>
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
	.dh {
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
