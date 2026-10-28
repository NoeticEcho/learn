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
	import { createDb, run, load, show, setLang } from './sqlmini.ts';
	import { pick, getLocale } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	// The teaching interpreter's own messages follow the same locale (sqlmini.ts `setLang`).
	setLang(getLocale());
	const W = pick({
		ru: {
			sample: ['Первая услуга', 'Вторая услуга', 'Третья услуга', 'Четвёртая услуга'],
			prices: [3000, 12000, 1500, 800, 5000, 2000],
			main: 'основная',
			extra: 'дополнительная',
			presets: [
				{ name: 'Все строки', sql: 'SELECT * FROM items' },
				{ name: 'Дороже 1000', sql: 'SELECT title, price FROM items\nWHERE price > 1000' },
				{ name: 'Две самые дорогие', sql: 'SELECT title, price FROM items\nORDER BY price DESC\nLIMIT 2' },
				{ name: 'По категориям', sql: 'SELECT category, COUNT(*) AS n, MAX(price)\nFROM items\nGROUP BY category\nORDER BY n DESC' },
				{ name: 'Изменить одну', sql: 'UPDATE items\nSET price = price + 500\nWHERE id = 1' },
				{ name: 'Удалить одну', sql: 'DELETE FROM items\nWHERE id = 2' },
				{ name: 'UPDATE без WHERE', sql: 'UPDATE items\nSET price = 0' }
			],
			title: 'Песочница SQL на ваших данных',
			intro1: 'Это ',
			intro2: 'учебный разборщик',
			intro3: ', который понимает несколько основных команд. Он не PostgreSQL: сообщения похожи на настоящие, но написаны здесь. Цены и категории придуманы, названия взяты из вашего брифа.',
			ready: 'Готовые запросы',
			table: 'Таблица items',
			scrollRegion: 'Таблица, прокручивается по горизонтали',
			resetTable: 'Сбросить таблицу',
			query: 'Запрос',
			run: 'Выполнить',
			orCtrl: 'или Ctrl+Enter',
			result: 'Результат запроса',
			rowsLabel: 'Строк в ответе:',
			error: 'Ошибка:',
			press: '{W.press}',
			order: 'В каком порядке выполняется SELECT',
			none: 'нет',
			stagesNote: 'Число под словом это сколько строк осталось после шага. Запрос читают не сверху вниз: сначала выбирается таблица (FROM), потом отсекаются строки (WHERE), потом группируются, и только затем показываются нужные столбцы (SELECT), упорядочиваются и обрезаются.',
			alt: 'Текстовая альтернатива:',
			altText: 'слева таблица услуг с идентификатором, названием, ценой и категорией, справа поле запроса и результат. Под результатом перечислены шаги выполнения SELECT с числом оставшихся строк.'
		},
		en: {
			sample: ['First service', 'Second service', 'Third service', 'Fourth service'],
			prices: [300, 1200, 150, 80, 500, 200],
			main: 'main',
			extra: 'extra',
			presets: [
				{ name: 'All rows', sql: 'SELECT * FROM items' },
				{ name: 'Over 100', sql: 'SELECT title, price FROM items\nWHERE price > 100' },
				{ name: 'Two most expensive', sql: 'SELECT title, price FROM items\nORDER BY price DESC\nLIMIT 2' },
				{ name: 'By category', sql: 'SELECT category, COUNT(*) AS n, MAX(price)\nFROM items\nGROUP BY category\nORDER BY n DESC' },
				{ name: 'Change one', sql: 'UPDATE items\nSET price = price + 50\nWHERE id = 1' },
				{ name: 'Delete one', sql: 'DELETE FROM items\nWHERE id = 2' },
				{ name: 'UPDATE without WHERE', sql: 'UPDATE items\nSET price = 0' }
			],
			title: 'SQL sandbox on your data',
			intro1: 'This is a ',
			intro2: 'teaching interpreter',
			intro3: ' that understands a few main commands. It is not PostgreSQL: the messages look like real ones, but they are written here. The prices and categories are invented, and the titles come from your brief.',
			ready: 'Ready-made queries',
			table: 'The items table',
			scrollRegion: 'Table, scrolls horizontally',
			resetTable: 'Reset the table',
			query: 'Query',
			run: 'Run',
			orCtrl: 'or Ctrl+Enter',
			result: 'Query result',
			rowsLabel: 'Rows in the result:',
			error: 'Error:',
			press: 'Press “Run”.',
			order: 'The order a SELECT runs in',
			none: 'none',
			stagesNote: 'The number under each word is how many rows are left after that step. A query isn’t read top to bottom: first the table is chosen (FROM), then rows are cut away (WHERE), then grouped, and only then are the columns you asked for shown (SELECT), sorted and trimmed.',
			alt: 'Text alternative:',
			altText: 'on the left is a table of services with an id, a title, a price and a category; on the right are the query box and the result. Under the result the steps of running a SELECT are listed, with the number of rows left.'
		}
	});

	type Row = { id: number; title: string; price: number; category: string };
	const sample = W.sample;
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
		names.map((title, i) => ({ id: i + 1, title, price: W.prices[i % 6], category: i % 2 === 0 ? W.main : W.extra }));

	let db: any = createDb();
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

	const presets: { name: string; sql: string }[] = W.presets;
	let sql = $state(presets[1].sql);
	let out = $state<any>(null);

	function exec() {
		out = run(db, sql);
		tick++;
	}
	const table = $derived.by(() => {
		tick;
		return ((db.tables.items?.rows ?? []) as Row[]).map((r) => ({ ...r }));
	});
	const last: any = $derived(out?.results.at(-1));
	const sel: any = $derived(last && last.kind === 'select' ? last : null);

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
	<figcaption>{W.title}</figcaption>
	<p class="dg-out">{W.intro1}<strong>{W.intro2}</strong>{W.intro3}</p>

	<div class="dg-ctl" role="group" aria-label={W.ready}>
		{#each presets as p (p.name)}
			<button type="button" onclick={() => ((sql = p.sql), (out = null))}>{p.name}</button>
		{/each}
	</div>

	<div class="grid">
		<div>
			<div class="dh">{W.table}</div>
			<div class="scroll" tabindex="0" role="region" aria-label={W.scrollRegion}>
				<table class="t" aria-label={W.table}>
					<thead><tr><th>id</th><th>title</th><th>price</th><th>category</th></tr></thead>
					<tbody>
						{#each table as r, i (i)}
							<tr><td>{r.id}</td><td>{r.title}</td><td>{show(r.price)}</td><td>{r.category}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="dg-ctl"><button type="button" onclick={() => reset(titles)}>{W.resetTable}</button></div>
		</div>

		<div>
			<label for="sqlbox"><strong>{W.query}</strong></label>
			<textarea id="sqlbox" class="dg-mono" rows="5" bind:value={sql} spellcheck="false" onkeydown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && exec()}></textarea>
			<div class="dg-ctl"><button type="button" class="on" onclick={exec}>{W.run}</button><span class="hint">{W.orCtrl}</span></div>
		</div>
	</div>

	<div aria-live="polite">
		{#if out}
			{#if sel}
				<div class="scroll" tabindex="0" role="region" aria-label={W.scrollRegion}>
					<table class="t" aria-label={W.result}>
						<thead><tr>{#each sel.columns as c, i (i)}<th>{c}</th>{/each}</tr></thead>
						<tbody>
							{#each sel.rows as r, i (i)}
								<tr>{#each r as v, j (j)}<td>{show(v)}</td>{/each}</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="dg-out">{W.rowsLabel} <strong>{sel.rows.length}</strong>.</p>
			{:else if last}
				<p class="dg-out"><strong>{last.kind === 'msg' ? last.message : ''}</strong></p>
			{/if}
			{#if out.error}
				<p class="dg-out err"><strong>{W.error}</strong> {out.error.message}</p>
			{/if}
		{:else}
			<p class="dg-out">{W.press}</p>
		{/if}
	</div>

	{#if stages.length}
		<div class="dh">{W.order}</div>
		<ol class="stages">
			{#each stages as s (s.name)}
				<li class:off={!s.on}><span class="dg-mono">{s.name}</span>{#if s.on && s.n !== null}<span class="n">{s.n}</span>{:else}<span class="n">{W.none}</span>{/if}</li>
			{/each}
		</ol>
		<p class="dg-out">{W.stagesNote}</p>
	{/if}

	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: var(--space-4);
		margin: var(--space-3) 0;
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
