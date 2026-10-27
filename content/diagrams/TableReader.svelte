<!--
	«Как таблицу читает диктор» (part 2, lesson 5). The same data in two tables, one with header
	cells (th with scope) and one made of plain cells. Pick a cell and see what a screen reader
	announces when the cursor lands on it: with headers it names the row and the column, without
	them it says only the value. The rows come from the person's own brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let rows = $state([
		{ title: 'Первая услуга', text: 'Что входит', price: 'от 5 000 ₽' },
		{ title: 'Вторая услуга', text: 'Что входит', price: 'по смете' },
		{ title: 'Третья услуга', text: 'Что входит', price: 'от 9 000 ₽' }
	]);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.length)
				rows = p.items.slice(0, 4).map((i) => ({ title: i.title, text: i.text, price: i.price || '—' }));
		} catch {
			/* the example stays */
		}
	});

	const cols = ['Позиция', 'Что входит', 'Цена'] as const;
	let proper = $state(true);
	let at = $state<{ r: number; c: 0 | 1 | 2 }>({ r: 0, c: 2 });
	const cell = (r: number, c: number) => (c === 0 ? rows[r].title : c === 1 ? rows[r].text : rows[r].price);
	const said = $derived(
		proper ? `${cols[at.c]}: ${cell(at.r, at.c)}. Строка: ${rows[at.r].title}.` : cell(at.r, at.c)
	);
	const choose = (r: number, c: number) => (at = { r, c: c as 0 | 1 | 2 });
</script>

<figure class="dg">
	<figcaption>Таблица с заголовками и без них</figcaption>
	<div class="dg-ctl" role="group" aria-label="Вид таблицы">
		<button type="button" aria-pressed={proper} onclick={() => (proper = true)}>С заголовками th и scope</button>
		<button type="button" aria-pressed={!proper} onclick={() => (proper = false)}>Из одних ячеек td</button>
	</div>
	<div class="wrap">
		<table>
			<caption>Что входит и сколько стоит</caption>
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
	<p class="dg-out" aria-live="polite">Диктор говорит: <strong>«{said}»</strong></p>
	<p class="dg-out">
		{#if proper}
			Заголовки столбцов (<span class="dg-mono">th scope="col"</span>) и строк (<span class="dg-mono">th scope="row"</span>) дают каждой ячейке контекст. Человек, который слышит одну ячейку, понимает, что это.
		{:else}
			Без заголовков ячейка — просто значение. Чтобы понять, что «от 5 000 ₽» относится к цене услуги, надо помнить всю таблицу.
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
