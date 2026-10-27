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

	let tab = $state<'index' | 'tx'>('index');

	/* ---- index ---- */
	const sizes = [100, 1000, 10000, 100000, 1000000];
	let sizeAt = $state(3);
	type Share = { label: string; part: number };
	const shares: Share[] = [
		{ label: 'одна строка', part: 0 },
		{ label: '0,1% строк', part: 0.001 },
		{ label: 'каждая десятая (10%)', part: 0.1 },
		{ label: 'половина (50%)', part: 0.5 }
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
	const fmt = (x: number) => x.toLocaleString('ru-RU');

	/* ---- transaction ---- */
	let useTx = $state(false);
	let crash = $state(true);
	type Step = { sql: string; note: string; seats: number; orders: number; pending?: boolean };
	const script = $derived.by<Step[]>(() => {
		const a: Step = { sql: '', note: 'В зале остался один билет, заказов пока нет.', seats: 1, orders: 0 };
		if (!useTx) {
			const s1: Step = { sql: 'UPDATE seats SET free = free - 1;', note: 'Билет списан сразу и насовсем.', seats: 0, orders: 0 };
			return crash
				? [a, s1, { sql: 'INSERT INTO orders …;  -- сервер упал', note: 'Заказ не записан. Билет списан, заказа нет: билет пропал и никто этого не заметит.', seats: 0, orders: 0 }]
				: [a, s1, { sql: 'INSERT INTO orders …;', note: 'Обе записи прошли. Всё хорошо, но только потому, что ничего не сломалось.', seats: 0, orders: 1 }];
		}
		const b: Step = { sql: 'BEGIN;', note: 'Началась транзакция. Всё, что будет дальше, видно только вам и пока не окончательно.', seats: 1, orders: 0, pending: true };
		const s1: Step = { sql: 'UPDATE seats SET free = free - 1;', note: 'Внутри транзакции билет списан, но для остальных всё ещё один.', seats: 0, orders: 0, pending: true };
		return crash
			? [a, b, s1, { sql: 'INSERT INTO orders …;  -- сервер упал → ROLLBACK', note: 'Транзакция не дошла до COMMIT и откатилась: билет на месте, заказа нет. Состояние согласованное.', seats: 1, orders: 0 }]
			: [a, b, s1, { sql: 'INSERT INTO orders …; COMMIT;', note: 'COMMIT: обе записи стали окончательными разом.', seats: 0, orders: 1 }];
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
	<figcaption>{tab === 'index' ? 'Индекс: сколько страниц читает база' : 'Транзакция: всё или ничего'}</figcaption>
	<div class="dg-ctl" role="group" aria-label="Раздел схемы">
		<button type="button" aria-pressed={tab === 'index'} onclick={() => (tab = 'index')}>Индекс</button>
		<button type="button" aria-pressed={tab === 'tx'} onclick={() => (tab = 'tx')}>Транзакция</button>
	</div>

	{#if tab === 'index'}
		<p class="dg-out">Запрос: <span class="dg-mono">SELECT * FROM items WHERE category_id = 7</span>. Это <strong>модель</strong>, а не замер: на странице помещается 100 строк, а дерево индекса ветвится на 200.</p>
		<div class="ctl3">
			<label>Строк в таблице: <strong>{fmt(n)}</strong>
				<input type="range" min="0" max={sizes.length - 1} step="1" bind:value={sizeAt} aria-valuetext="{fmt(n)} строк" />
			</label>
			<label>Сколько строк подходит:
				<select bind:value={shareAt}>
					{#each shares as s, i (i)}<option value={i}>{s.label}</option>{/each}
				</select>
			</label>
			<label>Лишних индексов: <strong>{extra}</strong>
				<input type="range" min="0" max="4" step="1" bind:value={extra} />
			</label>
		</div>

		<ul class="bars" aria-label="Страниц прочитано">
			<li>
				<span class="lab">Без индекса: читать всё подряд</span>
				<span class="bar" class:accent={pick === 'seq'} style="width: {Math.max(1.5, (seqPages / max) * 100)}%"></span>
				<span class="val">{fmt(seqPages)}</span>
			</li>
			<li>
				<span class="lab">С индексом: дерево ({depth}) + страницы строк ({fmt(heapPages)})</span>
				<span class="bar" class:accent={pick === 'index'} style="width: {Math.max(1.5, (idxPages / max) * 100)}%"></span>
				<span class="val">{fmt(idxPages)}</span>
			</li>
		</ul>
		<p class="dg-out" aria-live="polite">
			<strong>{pick === 'index' ? 'Планировщик возьмёт индекс.' : 'Планировщик не станет пользоваться индексом.'}</strong>
			{#if pick === 'index'}
				Строк подходит мало, а таблица велика: идти по дереву быстрее, чем читать все {fmt(seqPages)} страниц. В {fmt(Math.round(seqPages / idxPages))} раз меньше работы.
			{:else if n <= 1000}
				Таблица такая маленькая, что целиком она умещается в несколько страниц: прочитать её проще, чем идти по дереву. Индекс на маленькой таблице бесполезен.
			{:else}
				Подходит слишком много строк: за каждой пришлось бы ходить по индексу, а проще прочитать таблицу подряд. Индекс по столбцу с «половиной значений» (пол, да/нет) почти не нужен.
			{/if}
		</p>
		<p class="dg-out"><strong>Цена за запись:</strong> вставка одной строки пишет в таблицу, в индекс первичного ключа и ещё в дополнительные индексы, которых сейчас {extra}. Всего записей: {2 + extra}. Лишние индексы замедляют запись и занимают место.</p>
		<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> на большой таблице с редким значением индекс читает в десятки и сотни раз меньше страниц, чем просмотр всей таблицы. На маленькой таблице или при частом значении индекс не помогает, и база читает таблицу целиком. Каждый дополнительный индекс удорожает запись.</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label="Режим">
			<button type="button" aria-pressed={!useTx} onclick={() => (useTx = false)}>Без транзакции</button>
			<button type="button" aria-pressed={useTx} onclick={() => (useTx = true)}>В транзакции</button>
			<label><input type="checkbox" bind:checked={crash} /> Сервер падает посреди покупки</label>
		</div>
		<div class="row" aria-live="polite">
			<div class="box" class:bad={broken}>
				<strong>Таблица seats</strong>
				<span class="num">{cur.seats}</span>
				<span>свободных билетов{cur.pending ? ' (внутри транзакции)' : ''}</span>
			</div>
			<div class="box" class:bad={broken}>
				<strong>Таблица orders</strong>
				<span class="num">{cur.orders}</span>
				<span>заказов</span>
			</div>
		</div>
		<pre class="dg-box dg-mono">{cur.sql || '(пока ничего не выполнено)'}</pre>
		<p class="dg-out" aria-live="polite"><strong>Шаг {at + 1} из {script.length}.</strong> {cur.note}</p>
		<div class="dg-ctl">
			<button type="button" onclick={() => (at = Math.max(0, at - 1))} disabled={at === 0}>Назад</button>
			<button type="button" onclick={() => (at = Math.min(script.length - 1, at + 1))} disabled={at >= script.length - 1}>Дальше</button>
			<button type="button" onclick={() => (at = 0)} disabled={at === 0}>Сначала</button>
		</div>
		<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> покупка это две записи: списать билет и записать заказ. Без транзакции сбой между ними оставляет билет списанным без заказа. В транзакции сбой откатывает обе записи, и данные остаются согласованными. Числа в схеме придуманы.</p>
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
