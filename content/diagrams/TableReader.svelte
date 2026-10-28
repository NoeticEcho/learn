<!--
	«Как таблицу читает диктор» (part 2, lesson 5). The same data in two tables, one with header
	cells (th with scope) and one made of plain cells. Pick a cell and see what a screen reader
	announces when the cursor lands on it: with headers it names the row and the column, without
	them it says only the value. The rows come from the person's own brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per
	// edition, picked by the page's locale.
	const W = pick({
		ru: {
			rows: [
				{ title: 'Первая услуга', text: 'Что входит', price: 'от 5 000 ₽' },
				{ title: 'Вторая услуга', text: 'Что входит', price: 'по смете' },
				{ title: 'Третья услуга', text: 'Что входит', price: 'от 9 000 ₽' }
			],
			cols: ['Позиция', 'Что входит', 'Цена'] as readonly [string, string, string],
			row: 'Строка',
			caption: 'Таблица с заголовками и без них',
			view: 'Вид таблицы',
			withTh: 'С заголовками th и scope',
			withTd: 'Из одних ячеек td',
			tableCaption: 'Что входит и сколько стоит',
			says: 'Диктор говорит:',
			lq: '«',
			rq: '»',
			good1: 'Заголовки столбцов (',
			good2: ') и строк (',
			good3: ') дают каждой ячейке контекст. Человек, который слышит одну ячейку, понимает, что это.',
			bad: 'Без заголовков ячейка это просто значение. Чтобы понять, что «от 5 000 ₽» относится к цене услуги, надо помнить всю таблицу.'
		},
		en: {
			rows: [
				{ title: 'First service', text: 'What is included', price: 'from £000' },
				{ title: 'Second service', text: 'What is included', price: 'on quotation' },
				{ title: 'Third service', text: 'What is included', price: 'from £0,000' }
			],
			cols: ['Item', 'What is included', 'Price'] as readonly [string, string, string],
			row: 'Row',
			caption: 'A table with headers and without them',
			view: 'Table type',
			withTh: 'With th and scope headers',
			withTd: 'Plain td cells only',
			tableCaption: 'What is included and what it costs',
			says: 'The screen reader says:',
			lq: '“',
			rq: '”',
			good1: 'Column headers (',
			good2: ') and row headers (',
			good3: ') give every cell its context. A person who hears a single cell still knows what it is.',
			bad: 'Without headers a cell is just a value. To know that “from £000” is the price of a service, you have to remember the whole table.'
		}
	});

	let rows = $state(W.rows);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.length)
				rows = p.items.slice(0, 4).map((i) => ({ title: i.title, text: i.text, price: i.price || '—' }));
		} catch {
			/* the example stays */
		}
	});

	const cols = W.cols;
	let proper = $state(true);
	let at = $state<{ r: number; c: 0 | 1 | 2 }>({ r: 0, c: 2 });
	const cell = (r: number, c: number) => (c === 0 ? rows[r].title : c === 1 ? rows[r].text : rows[r].price);
	const said = $derived(
		proper ? `${cols[at.c]}: ${cell(at.r, at.c)}. ${W.row}: ${rows[at.r].title}.` : cell(at.r, at.c)
	);
	const choose = (r: number, c: number) => (at = { r, c: c as 0 | 1 | 2 });
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.view}>
		<button type="button" aria-pressed={proper} onclick={() => (proper = true)}>{W.withTh}</button>
		<button type="button" aria-pressed={!proper} onclick={() => (proper = false)}>{W.withTd}</button>
	</div>
	<div class="wrap">
		<table>
			<caption>{W.tableCaption}</caption>
			{#if proper}
				<thead><tr>{#each cols as c (c)}<th scope="col">{c}</th>{/each}</tr></thead>
			{:else}
				<tbody><tr>{#each cols as c (c)}<td><b>{c}</b></td>{/each}</tr></tbody>
			{/if}
			<tbody>
				{#each rows as r, i (i)}
					<tr>
						{#each [0, 1, 2] as c (c)}
							{#if c === 0 && proper}
								<th scope="row"><button type="button" class:on={at.r === i && at.c === 0} onclick={() => choose(i, 0)}>{r.title}</button></th>
							{:else}
								<td><button type="button" class:on={at.r === i && at.c === c} onclick={() => choose(i, c)}>{cell(i, c)}</button></td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="dg-out" aria-live="polite">{W.says} <strong>{W.lq}{said}{W.rq}</strong></p>
	<p class="dg-out">
		{#if proper}
			{W.good1}<span class="dg-mono">th scope="col"</span>{W.good2}<span class="dg-mono">th scope="row"</span>{W.good3}
		{:else}
			{W.bad}
		{/if}
	</p>
</figure>

<style>
	.wrap {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		min-width: 100%;
	}
	caption {
		text-align: left;
		padding-bottom: var(--space-2);
		color: var(--text-secondary);
	}
	th,
	td {
		border: var(--line) solid var(--border-hairline);
		padding: 0;
		text-align: left;
		font-weight: var(--weight-regular);
	}
	thead th {
		padding: var(--space-2) var(--space-3);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	td b {
		display: block;
		padding: var(--space-2) var(--space-3);
	}
	table button {
		display: block;
		width: 100%;
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		border: 0;
		text-align: left;
		font: inherit;
	}
	table button.on {
		background: var(--surface-canvas);
		outline: var(--line) solid var(--accent-measure);
		outline-offset: -2px;
	}
</style>
