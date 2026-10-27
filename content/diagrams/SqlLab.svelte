<!--
	«Песочница SQL» (part 7, lesson 2). A small table made from the person's own items (prices are
	invented) and a query box. The query runs in `sqlmini.ts`, a teaching interpreter, NOT PostgreSQL;
	the lesson says so. Beside the result it shows the order a SELECT is carried out in
	(FROM, WHERE, GROUP BY, SELECT, ORDER BY, LIMIT) with the number of rows left after each step.
	UPDATE and DELETE change the table for real, and «Сбросить таблицу» puts it back.
-->
<script lang="ts">
	import './shared.css';
	import { onMount, untrack } from 'svelte';
	import { createDb, run, load, show } from './sqlmini.ts';

	type Row = { id: number; title: string; price: number; category: string };
	const sample = ['Первая услуга', 'Вторая услуга', 'Третья услуга', 'Четвёртая услуга'];
	let titles = $state<string[]>(sample);
	onMount(async () => {
		try {
			const t = (await (await import('#lib/learner.ts')).persona()).items?.map((i) => i.title).filter(Boolean);
			if (t?.length) titles = t.slice(0, 6);
		} catch {
			/* the example stays */
		}
	});

	const rowsFor = (names: string[]): Row[] =>
		names.map((title, i) => ({ id: i + 1, title, price: [3000, 12000, 1500, 800, 5000, 2000][i % 6], category: i % 2 === 0 ? 'основная' : 'дополнительная' }));

	let db = createDb();
	let tick = $state(0);
	function reset(names: string[]) {
		db = createDb();
		run(db, 'CREATE TABLE items (id integer PRIMARY KEY, title text NOT NULL, price integer, category text)');
		load(db, 'items', rowsFor(names));
		tick++;
		out = null;
	}
	$effect(() => {
		const names = titles;
		untrack(() => reset(names));
	});

	const presets: { name: string; sql: string }[] = [
		{ name: 'Все строки', sql: 'SELECT * FROM items' },
		{ name: 'Дороже 1000', sql: 'SELECT title, price FROM items\nWHERE price > 1000' },
		{ name: 'Две самые дорогие', sql: 'SELECT title, price FROM items\nORDER BY price DESC\nLIMIT 2' },
		{ name: 'По категориям', sql: 'SELECT category, COUNT(*) AS n, MAX(price)\nFROM items\nGROUP BY category\nORDER BY n DESC' },
		{ name: 'Изменить одну', sql: 'UPDATE items\nSET price = price + 500\nWHERE id = 1' },
		{ name: 'Удалить одну', sql: 'DELETE FROM items\nWHERE id = 2' },
		{ name: 'UPDATE без WHERE', sql: 'UPDATE items\nSET price = 0' }
	];
	let sql = $state(presets[1].sql);
	let out = $state<ReturnType<typeof run> | null>(null);

	function exec() {
		out = run(db, sql);
		tick++;
	}
	const table = $derived((tick, (db.tables.items?.rows ?? []).map((r: Row) => ({ ...r }))));
	const last = $derived(out?.results.at(-1));
	const sel = $derived(last && last.kind === 'select' ? last : null);

	const has = (re: RegExp) => re.test(sql);
	const stages = $derived(
		sel
			? [
					{ name: 'FROM', on: true, n: sel.trace.from },
					{ name: 'WHERE', on: has(/\bwhere\b/i), n: sel.trace.where },
					{ name: 'GROUP BY', on: has(/\bgroup\s+by\b/i), n: sel.trace.groups },
					{ name: 'SELECT', on: true, n: sel.trace.result },
					{ name: 'ORDER BY', on: has(/\border\s+by\b/i), n: sel.trace.result },
					{ name: 'LIMIT', on: has(/\blimit\b/i), n: sel.trace.limit }
				]
			: []
	);
</script>

<figure class="dg">
	<figcaption>Песочница SQL на ваших данных</figcaption>
	<p class="dg-out">Это <strong>учебный разборщик</strong>, который понимает несколько основных команд. Он не PostgreSQL: сообщения похожи на настоящие, но написаны здесь. Цены и категории придуманы, названия взяты из вашего брифа.</p>

	<div class="dg-ctl" role="group" aria-label="Готовые запросы">
		{#each presets as p (p.name)}
			<button type="button" onclick={() => ((sql = p.sql), (out = null))}>{p.name}</button>
		{/each}
	</div>

	<div class="grid">
		<div>
			<h4>Таблица items</h4>
			<div class="scroll">
				<table class="t" aria-label="Таблица items">
					<thead><tr><th>id</th><th>title</th><th>price</th><th>category</th></tr></thead>
					<tbody>
						{#each table as r, i (i)}
							<tr><td>{r.id}</td><td>{r.title}</td><td>{show(r.price)}</td><td>{r.category}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="dg-ctl"><button type="button" onclick={() => reset(titles)}>Сбросить таблицу</button></div>
		</div>

		<div>
			<label for="sqlbox"><strong>Запрос</strong></label>
			<textarea id="sqlbox" class="dg-mono" rows="5" bind:value={sql} spellcheck="false" onkeydown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && exec()}></textarea>
			<div class="dg-ctl"><button type="button" class="on" onclick={exec}>Выполнить</button><span class="hint">или Ctrl+Enter</span></div>
		</div>
	</div>

	<div aria-live="polite">
		{#if out}
			{#if sel}
				<div class="scroll">
					<table class="t" aria-label="Результат запроса">
						<thead><tr>{#each sel.columns as c, i (i)}<th>{c}</th>{/each}</tr></thead>
						<tbody>
							{#each sel.rows as r, i (i)}
								<tr>{#each r as v, j (j)}<td>{show(v)}</td>{/each}</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="dg-out">Строк в ответе: <strong>{sel.rows.length}</strong>.</p>
			{:else if last}
				<p class="dg-out"><strong>{last.kind === 'msg' ? last.message : ''}</strong></p>
			{/if}
			{#if out.error}
				<p class="dg-out err"><strong>Ошибка:</strong> {out.error.message}</p>
			{/if}
		{:else}
			<p class="dg-out">Нажмите «Выполнить».</p>
		{/if}
	</div>

	{#if stages.length}
		<h4>В каком порядке выполняется SELECT</h4>
		<ol class="stages">
			{#each stages as s (s.name)}
				<li class:off={!s.on}><span class="dg-mono">{s.name}</span>{#if s.on && s.n !== null}<span class="n">{s.n}</span>{:else}<span class="n">нет</span>{/if}</li>
			{/each}
		</ol>
		<p class="dg-out">Число под словом это сколько строк осталось после шага. Запрос читают не сверху вниз: сначала выбирается таблица (FROM), потом отсекаются строки (WHERE), потом группируются, и только затем показываются нужные столбцы (SELECT), упорядочиваются и обрезаются.</p>
	{/if}

	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> слева таблица услуг с идентификатором, названием, ценой и категорией, справа поле запроса и результат. Под результатом перечислены шаги выполнения SELECT с числом оставшихся строк.</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: var(--space-4);
		margin: var(--space-3) 0;
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
	textarea {
		width: 100%;
		margin-top: var(--space-1);
		padding: var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		resize: vertical;
	}
	.hint {
		color: var(--text-secondary);
	}
	.err {
		color: var(--text-primary);
	}
	.stages {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0 !important;
	}
	.stages li {
		display: grid;
		gap: var(--space-1);
		min-width: 5.5rem;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--accent-measure);
		text-align: center;
	}
	.stages li.off {
		border-color: var(--border-hairline);
		color: var(--text-secondary);
	}
	.n {
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 40rem) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
