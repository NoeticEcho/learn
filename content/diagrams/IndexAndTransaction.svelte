<!--
	«Индекс и транзакция» (part 7, lesson 4). Two small models, both labelled as models. The first
	counts how many pages the database would read to find a few rows with and without an index
	(100 rows per page, a tree with 200 children per node), for a table size and a share of matching
	rows the person sets: the index wins on big tables with rare matches and loses on small ones or
	common values, and every extra index adds a write. The second walks one purchase (a seat taken
	and an order recorded) through a crash with and without a transaction. Numbers are invented.
-->
<script lang="ts">
	import './shared.css';
	import { pick as words } from '#lib/i18n/index.ts';

	/* The words of the diagram, one entry per edition (docs/content-plan/README.md, «English edition»). */
	const W = words({
		ru: {
			locale: 'ru-RU',
			shares: ['одна строка', '0,1% строк', 'каждая десятая (10%)', 'половина (50%)'],
			a: 'В зале остался один билет, заказов пока нет.',
			s1: 'Билет списан сразу и насовсем.',
			crashNoTx: 'Заказ не записан. Билет списан, заказа нет: билет пропал и никто этого не заметит.',
			okNoTx: 'Обе записи прошли. Всё хорошо, но только потому, что ничего не сломалось.',
			crashSql: 'INSERT INTO orders …;  -- сервер упал',
			begin: 'Началась транзакция. Всё, что будет дальше, видно только вам и пока не окончательно.',
			s1Tx: 'Внутри транзакции билет списан, но для остальных всё ещё один.',
			crashTxSql: 'INSERT INTO orders …;  -- сервер упал → ROLLBACK',
			crashTx: 'Транзакция не дошла до COMMIT и откатилась: билет на месте, заказа нет. Состояние согласованное.',
			commit: 'COMMIT: обе записи стали окончательными разом.',
			capIndex: 'Индекс: сколько страниц читает база',
			capTx: 'Транзакция: всё или ничего',
			groupTab: 'Раздел схемы',
			tabIndex: 'Индекс',
			tabTx: 'Транзакция',
			query: 'Запрос:',
			modelNote: (perPage: number, fan: number) => `Это <strong>модель</strong>, а не замер: на странице помещается ${perPage} строк, а дерево индекса ветвится на ${fan}.`,
			rowsIn: 'Строк в таблице:',
			rowsValue: (n: string) => `${n} строк`,
			howMany: 'Сколько строк подходит:',
			extraIdx: 'Лишних индексов:',
			pages: 'Страниц прочитано',
			noIndex: 'Без индекса: читать всё подряд',
			withIndex: (depth: number, heap: string) => `С индексом: дерево (${depth}) + страницы строк (${heap})`,
			uses: 'Планировщик возьмёт индекс.',
			skips: 'Планировщик не станет пользоваться индексом.',
			usesWhy: (pages: string, times: string) => `Строк подходит мало, а таблица велика: идти по дереву быстрее, чем читать все ${pages} страниц. В ${times} раз меньше работы.`,
			small: 'Таблица такая маленькая, что целиком она умещается в несколько страниц: прочитать её проще, чем идти по дереву. Индекс на маленькой таблице бесполезен.',
			many: 'Подходит слишком много строк: за каждой пришлось бы ходить по индексу, а проще прочитать таблицу подряд. Индекс по столбцу с «половиной значений» (пол, да/нет) почти не нужен.',
			cost: 'Цена за запись:',
			costText: (extra: number, total: number) => `вставка одной строки пишет в таблицу, в индекс первичного ключа и ещё в дополнительные индексы, которых сейчас ${extra}. Всего записей: ${total}. Лишние индексы замедляют запись и занимают место.`,
			alt: 'Текстовая альтернатива:',
			altIndex: 'на большой таблице с редким значением индекс читает в десятки и сотни раз меньше страниц, чем просмотр всей таблицы. На маленькой таблице или при частом значении индекс не помогает, и база читает таблицу целиком. Каждый дополнительный индекс удорожает запись.',
			mode: 'Режим',
			noTx: 'Без транзакции',
			inTx: 'В транзакции',
			crashLabel: 'Сервер падает посреди покупки',
			tableSeats: 'Таблица seats',
			free: 'свободных билетов',
			inside: ' (внутри транзакции)',
			tableOrders: 'Таблица orders',
			orders: 'заказов',
			nothing: '(пока ничего не выполнено)',
			step: (a: number, b: number) => `Шаг ${a} из ${b}.`,
			back: 'Назад',
			next: 'Дальше',
			restart: 'Сначала',
			altTx: 'покупка это две записи: списать билет и записать заказ. Без транзакции сбой между ними оставляет билет списанным без заказа. В транзакции сбой откатывает обе записи, и данные остаются согласованными. Числа в схеме придуманы.'
		},
		en: {
			locale: 'en-US',
			shares: ['one row', '0.1% of the rows', 'every tenth row (10%)', 'half of them (50%)'],
			a: 'One ticket is left in the hall, and there are no orders yet.',
			s1: 'The ticket is taken off at once, for good.',
			crashNoTx: 'The order was not recorded. The ticket is gone and there is no order: the ticket has vanished and nobody will notice.',
			okNoTx: 'Both writes went through. All is well, but only because nothing broke.',
			crashSql: 'INSERT INTO orders …;  -- the server crashed',
			begin: 'A transaction has begun. Whatever comes next is visible only to you, and not yet final.',
			s1Tx: 'Inside the transaction the ticket is taken off, but everyone else still sees one.',
			crashTxSql: 'INSERT INTO orders …;  -- the server crashed → ROLLBACK',
			crashTx: 'The transaction never reached COMMIT and was rolled back: the ticket is still there, and there is no order. The state is consistent.',
			commit: 'COMMIT: both writes became final at once.',
			capIndex: 'Index: how many pages the database reads',
			capTx: 'Transaction: all or nothing',
			groupTab: 'Part of the diagram',
			tabIndex: 'Index',
			tabTx: 'Transaction',
			query: 'Query:',
			modelNote: (perPage: number, fan: number) => `This is a <strong>model</strong>, not a measurement: a page holds ${perPage} rows, and the index tree branches ${fan} ways.`,
			rowsIn: 'Rows in the table:',
			rowsValue: (n: string) => `${n} rows`,
			howMany: 'How many rows match:',
			extraIdx: 'Extra indexes:',
			pages: 'Pages read',
			noIndex: 'No index: read everything in order',
			withIndex: (depth: number, heap: string) => `With an index: the tree (${depth}) + the pages of the rows (${heap})`,
			uses: 'The planner will use the index.',
			skips: 'The planner will not use the index.',
			usesWhy: (pages: string, times: string) => `Few rows match and the table is large: walking the tree is faster than reading all ${pages} pages. That is ${times} times less work.`,
			small: 'The table is so small that it fits in a few pages: reading it is easier than walking a tree. An index on a small table is useless.',
			many: 'Too many rows match: each would need a trip through the index, and it is simpler to read the table straight through. An index on a column with “half of the values” (gender, yes/no) is hardly ever needed.',
			cost: 'The price of a write:',
			costText: (extra: number, total: number) => `inserting one row writes to the table, to the primary key index and to the extra indexes, of which there are ${extra} now. Writes in all: ${total}. Extra indexes slow writing down and take up space.`,
			alt: 'Text alternative:',
			altIndex: 'on a large table with a rare value, an index reads tens or hundreds of times fewer pages than scanning the whole table. On a small table, or with a common value, an index does not help, and the database reads the whole table. Every extra index makes writing more expensive.',
			mode: 'Mode',
			noTx: 'No transaction',
			inTx: 'In a transaction',
			crashLabel: 'The server crashes in the middle of the purchase',
			tableSeats: 'Table seats',
			free: 'free tickets',
			inside: ' (inside the transaction)',
			tableOrders: 'Table orders',
			orders: 'orders',
			nothing: '(nothing has run yet)',
			step: (a: number, b: number) => `Step ${a} of ${b}.`,
			back: 'Back',
			next: 'Next',
			restart: 'Start over',
			altTx: 'a purchase is two writes: take off a ticket and record an order. Without a transaction, a crash between them leaves the ticket taken with no order. In a transaction, a crash rolls both writes back, and the data stays consistent. The numbers in the diagram are made up.'
		}
	});

	let tab = $state<'index' | 'tx'>('index');

	/* ---- index ---- */
	const sizes = [100, 1000, 10000, 100000, 1000000];
	let sizeAt = $state(3);
	type Share = { label: string; part: number };
	const shares: Share[] = [
		{ label: W.shares[0], part: 0 },
		{ label: W.shares[1], part: 0.001 },
		{ label: W.shares[2], part: 0.1 },
		{ label: W.shares[3], part: 0.5 }
	];
	let shareAt = $state(1);
	let extra = $state(0);

	const n = $derived(sizes[sizeAt]);
	const matches = $derived(Math.max(1, Math.round(n * shares[shareAt].part)));
	const perPage = 100;
	const fan = 200;
	const seqPages = $derived(Math.max(1, Math.ceil(n / perPage)));
	const depth = $derived(Math.max(1, Math.ceil(Math.log(n) / Math.log(fan))));
	// matching rows lie in scattered pages: at most one page per row, never more than the table has
	const heapPages = $derived(Math.min(matches, seqPages));
	const idxPages = $derived(depth + heapPages);
	const pick = $derived(idxPages < seqPages ? 'index' : 'seq');
	const max = $derived(Math.max(seqPages, idxPages));
	const fmt = (x: number) => x.toLocaleString(W.locale);

	/* ---- transaction ---- */
	let useTx = $state(false);
	let crash = $state(true);
	type Step = { sql: string; note: string; seats: number; orders: number; pending?: boolean };
	const script = $derived.by<Step[]>(() => {
		const a: Step = { sql: '', note: W.a, seats: 1, orders: 0 };
		if (!useTx) {
			const s1: Step = { sql: 'UPDATE seats SET free = free - 1;', note: W.s1, seats: 0, orders: 0 };
			return crash
				? [a, s1, { sql: W.crashSql, note: W.crashNoTx, seats: 0, orders: 0 }]
				: [a, s1, { sql: 'INSERT INTO orders …;', note: W.okNoTx, seats: 0, orders: 1 }];
		}
		const b: Step = { sql: 'BEGIN;', note: W.begin, seats: 1, orders: 0, pending: true };
		const s1: Step = { sql: 'UPDATE seats SET free = free - 1;', note: W.s1Tx, seats: 0, orders: 0, pending: true };
		return crash
			? [a, b, s1, { sql: W.crashTxSql, note: W.crashTx, seats: 1, orders: 0 }]
			: [a, b, s1, { sql: 'INSERT INTO orders …; COMMIT;', note: W.commit, seats: 0, orders: 1 }];
	});
	let at = $state(0);
	$effect(() => {
		script;
		at = 0;
	});
	const cur = $derived(script[Math.min(at, script.length - 1)]);
	const broken = $derived(!useTx && crash && at === script.length - 1);
</script>

<figure class="dg">
	<figcaption>{tab === 'index' ? W.capIndex : W.capTx}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.groupTab}>
		<button type="button" aria-pressed={tab === 'index'} onclick={() => (tab = 'index')}>{W.tabIndex}</button>
		<button type="button" aria-pressed={tab === 'tx'} onclick={() => (tab = 'tx')}>{W.tabTx}</button>
	</div>

	{#if tab === 'index'}
		<p class="dg-out">{W.query} <span class="dg-mono">SELECT * FROM items WHERE category_id = 7</span>. {@html W.modelNote(perPage, fan)}</p>
		<div class="ctl3">
			<label>{W.rowsIn} <strong>{fmt(n)}</strong>
				<input type="range" min="0" max={sizes.length - 1} step="1" bind:value={sizeAt} aria-valuetext={W.rowsValue(fmt(n))} />
			</label>
			<label>{W.howMany}
				<select bind:value={shareAt}>
					{#each shares as s, i (i)}<option value={i}>{s.label}</option>{/each}
				</select>
			</label>
			<label>{W.extraIdx} <strong>{extra}</strong>
				<input type="range" min="0" max="4" step="1" bind:value={extra} />
			</label>
		</div>

		<ul class="bars" aria-label={W.pages}>
			<li>
				<span class="lab">{W.noIndex}</span>
				<span class="bar" class:accent={pick === 'seq'} style="width: {Math.max(1.5, (seqPages / max) * 100)}%"></span>
				<span class="val">{fmt(seqPages)}</span>
			</li>
			<li>
				<span class="lab">{W.withIndex(depth, fmt(heapPages))}</span>
				<span class="bar" class:accent={pick === 'index'} style="width: {Math.max(1.5, (idxPages / max) * 100)}%"></span>
				<span class="val">{fmt(idxPages)}</span>
			</li>
		</ul>
		<p class="dg-out" aria-live="polite">
			<strong>{pick === 'index' ? W.uses : W.skips}</strong>
			{#if pick === 'index'}
				{W.usesWhy(fmt(seqPages), fmt(Math.round(seqPages / idxPages)))}
			{:else if n <= 1000}
				{W.small}
			{:else}
				{W.many}
			{/if}
		</p>
		<p class="dg-out"><strong>{W.cost}</strong> {W.costText(extra, 2 + extra)}</p>
		<p class="dg-out alt"><strong>{W.alt}</strong> {W.altIndex}</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label={W.mode}>
			<button type="button" aria-pressed={!useTx} onclick={() => (useTx = false)}>{W.noTx}</button>
			<button type="button" aria-pressed={useTx} onclick={() => (useTx = true)}>{W.inTx}</button>
			<label><input type="checkbox" bind:checked={crash} /> {W.crashLabel}</label>
		</div>
		<div class="row" aria-live="polite">
			<div class="box" class:bad={broken}>
				<strong>{W.tableSeats}</strong>
				<span class="num">{cur.seats}</span>
				<span>{W.free}{cur.pending ? W.inside : ''}</span>
			</div>
			<div class="box" class:bad={broken}>
				<strong>{W.tableOrders}</strong>
				<span class="num">{cur.orders}</span>
				<span>{W.orders}</span>
			</div>
		</div>
		<pre class="dg-box dg-mono">{cur.sql || W.nothing}</pre>
		<p class="dg-out" aria-live="polite"><strong>{W.step(at + 1, script.length)}</strong> {cur.note}</p>
		<div class="dg-ctl">
			<button type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0}>{W.back}</button>
			<button type="button" onclick={() => (at = Math.min(script.length - 1, at + 1))} disabled={at >= script.length - 1}>{W.next}</button>
			<button type="button" onclick={() => (at = 0)} disabled={at === 0}>{W.restart}</button>
		</div>
		<p class="dg-out alt"><strong>{W.alt}</strong> {W.altTx}</p>
	{/if}
</figure>

<style>
	.ctl3 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.ctl3 label {
		display: grid;
		align-items: start;
		gap: var(--space-1);
		min-height: 0;
	}
	.bars {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
	}
	.bars li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 4.5rem;
		grid-template-areas: 'lab lab' 'bar val';
		gap: var(--space-1) var(--space-2);
		align-items: center;
	}
	.lab {
		grid-area: lab;
	}
	.bar {
		grid-area: bar;
		display: block;
		height: 1.1rem;
		background: var(--border-rule);
	}
	.bar.accent {
		background: var(--accent-measure);
	}
	.val {
		grid-area: val;
		text-align: right;
	}
	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.box {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
		text-align: center;
	}
	.box.bad {
		border-color: var(--accent-measure);
	}
	.num {
		font-family: var(--font-serif);
		font-size: 2rem;
		color: var(--text-primary);
	}
	pre {
		margin: 0 0 var(--space-3);
		overflow-x: auto;
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 40rem) {
		.ctl3 {
			grid-template-columns: 1fr;
		}
	}
</style>
