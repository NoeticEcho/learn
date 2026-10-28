<!--
	«Арифметика лестницы» (part 13, lesson 3). A made-up month of visitors to a lead-magnet page and
	four conversion rates, step by step down the ladder. For every step the diagram shows the expected
	count and an honest range («примерно от … до …»: two standard deviations of a binomial count), so
	that the reader sees how wide the range is when the traffic is small and learns not to read a
	one-person difference as a trend. All numbers are made up.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			steps: ['Оставили почту', 'Подтвердили адрес', 'Купили недорогое первое предложение', 'Заказали основную услугу'],
			caption: 'Месяц на лестнице ценности',
			visitors: 'Посетителей страницы в месяц',
			step: 'Шаг',
			rate: 'Доля, %',
			expected: 'Человек (ожидаем)',
			range: 'Честный разброс',
			rateLabel: (n: string) => `Доля: ${n}, процентов`,
			fromTo: (a: string, b: string) => `от ${a} до ${b}`,
			sep: ',',
			outA: 'В месяц на основную услугу придёт примерно',
			outB: 'человек, а по случайным причинам их может быть от',
			outC: 'до',
			small: 'При таких числах невозможно отличить удачный месяц от улучшения: сравнивайте подряд несколько месяцев, а не два.',
			big: 'Сдвиг в пределах разброса ещё не доказывает, что вы что-то улучшили.',
			made: 'Доли и посетители придуманы. Реальные числа вы получите, когда поставите счётчик (часть про метрики).'
		},
		en: {
			steps: ['Left an email', 'Confirmed the address', 'Bought the low-priced first offer', 'Ordered the core service'],
			caption: 'A month on the value ladder',
			visitors: 'Visitors to the page per month',
			step: 'Step',
			rate: 'Rate, %',
			expected: 'People (expected)',
			range: 'Plausible range',
			rateLabel: (n: string) => `Rate: ${n}, percent`,
			fromTo: (a: string, b: string) => `${a} to ${b}`,
			sep: '.',
			outA: 'About',
			outB: 'people a month will order the core service, but by chance alone the number can be anywhere from',
			outC: 'to',
			small: 'With numbers this small you can’t tell a lucky month from an improvement: compare several months in a row, not two.',
			big: 'A shift inside the range doesn’t yet prove you improved anything.',
			made: 'The rates and visitors are invented. You’ll get real numbers once you install a counter (the part on metrics).'
		}
	});

	let visitors = $state(1500);
	const steps = [10, 80, 10, 25].map((rate, i) => ({ name: W.steps[i], rate }));
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
	const fmt = (x: number) => (x < 10 ? x.toFixed(1) : Math.round(x).toString()).replace('.', W.sep);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<label class="v">
		{W.visitors}: <strong>{visitors}</strong>
		<input type="range" min="50" max="5000" step="50" bind:value={visitors} aria-label={W.visitors} />
	</label>

	<div class="wrap"><table>
		<thead>
			<tr><th scope="col">{W.step}</th><th scope="col">{W.rate}</th><th scope="col">{W.expected}</th><th scope="col">{W.range}</th></tr>
		</thead>
		<tbody>
			{#each rows as r, i (i)}
				<tr>
					<th scope="row">{r.name}</th>
					<td><input type="number" min="0.5" max="100" step="0.5" bind:value={rates[i]} aria-label={W.rateLabel(r.name)} /></td>
					<td class="dg-mono">{fmt(r.n)}</td>
					<td class="dg-mono">{W.fromTo(fmt(r.low), fmt(r.high))}</td>
				</tr>
			{/each}
		</tbody>
	</table></div>
	<p class="dg-out" aria-live="polite">
		{W.outA} <strong>{fmt(last.n)}</strong> {W.outB} <strong>{fmt(last.low)}</strong> {W.outC} <strong>{fmt(last.high)}</strong>.
		{#if last.n < 5}
			{W.small}
		{:else}
			{W.big}
		{/if}
	</p>
	<p class="dg-out">{W.made}</p>
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
