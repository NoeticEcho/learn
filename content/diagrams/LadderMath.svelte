<!--
	«Арифметика лестницы» (part 13, lesson 3). A made-up month of visitors to a lead-magnet page and
	four conversion rates, step by step down the ladder. For every step the diagram shows the expected
	count and an honest range («примерно от … до …»: two standard deviations of a binomial count), so
	that the reader sees how wide the range is when the traffic is small and learns not to read a
	one-person difference as a trend. All numbers are made up.
-->
<script lang="ts">
	import './shared.css';

	let visitors = $state(1500);
	const steps = [
		{ name: 'Оставили почту', rate: 10 },
		{ name: 'Подтвердили адрес', rate: 80 },
		{ name: 'Купили недорогое первое предложение', rate: 10 },
		{ name: 'Заказали основную услугу', rate: 25 }
	];
	let rates = $state(steps.map((s) => s.rate));

	const rows = $derived(
		steps.reduce<{ name: string; n: number; low: number; high: number }[]>((acc, s, i) => {
			const prev = i === 0 ? visitors : acc[i - 1].n;
			const p = rates[i] / 100;
			const n = prev * p;
			const sd = Math.sqrt(prev * p * (1 - p));
			acc.push({ name: s.name, n, low: Math.max(0, n - 2 * sd), high: n + 2 * sd });
			return acc;
		}, [])
	);
	const last = $derived(rows[rows.length - 1]);
	const fmt = (x: number) => (x < 10 ? x.toFixed(1) : Math.round(x).toString()).replace('.', ',');
</script>

<figure class="dg">
	<figcaption>Месяц на лестнице ценности</figcaption>
	<label class="v">
		Посетителей страницы в месяц: <strong>{visitors}</strong>
		<input type="range" min="50" max="5000" step="50" bind:value={visitors} aria-label="Посетителей страницы в месяц" />
	</label>

	<div class="wrap"><table>
		<thead>
			<tr><th scope="col">Шаг</th><th scope="col">Доля, %</th><th scope="col">Человек (ожидаем)</th><th scope="col">Честный разброс</th></tr>
		</thead>
		<tbody>
			{#each rows as r, i (i)}
				<tr>
					<th scope="row">{r.name}</th>
					<td><input type="number" min="0.5" max="100" step="0.5" bind:value={rates[i]} aria-label="Доля: {r.name}, процентов" /></td>
					<td class="dg-mono">{fmt(r.n)}</td>
					<td class="dg-mono">от {fmt(r.low)} до {fmt(r.high)}</td>
				</tr>
			{/each}
		</tbody>
	</table></div>
	<p class="dg-out" aria-live="polite">
		В месяц на основную услугу придёт примерно <strong>{fmt(last.n)}</strong> человек, а по случайным причинам их может быть от <strong>{fmt(last.low)}</strong> до <strong>{fmt(last.high)}</strong>.
		{#if last.n < 5}
			При таких числах невозможно отличить удачный месяц от улучшения: сравнивайте подряд несколько месяцев, а не два.
		{:else}
			Сдвиг в пределах разброса ещё не доказывает, что вы что-то улучшили.
		{/if}
	</p>
	<p class="dg-out">Доли и посетители придуманы. Реальные числа вы получите, когда поставите счётчик (часть про метрики).</p>
</figure>

<style>
	label.v {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: var(--space-2) var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
		text-align: left;
		vertical-align: middle;
	}
	thead th {
		color: var(--text-secondary);
		font-weight: var(--weight-regular);
	}
	input[type='number'] {
		width: 5.5rem;
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font: inherit;
	}
</style>
