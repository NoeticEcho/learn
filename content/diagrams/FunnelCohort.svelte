<!--
	«Воронка и когорты» (part 14, lesson 4). Above: a five-step funnel of a made-up site (2000 visitors),
	with a slider on every step; the page names the weakest step and the overall conversion. Below: a
	cohort table (people who did the main action for the first time in a given week, and how many came
	back in each later week) computed from raw counts into percentages and shaded; the same numbers are
	the lesson's practice data. Everything is made up.
-->
<script lang="ts">
	import './shared.css';

	const names = ['Пришли на сайт', 'Увидели предложение', 'Нажали на кнопку', 'Начали заполнять форму', 'Отправили форму'];
	let rates = $state([40, 30, 50, 50]);
	const counts = $derived(
		names.reduce<number[]>((a, _, i) => {
			a.push(i === 0 ? 2000 : Math.round((a[i - 1] * rates[i - 1]) / 100));
			return a;
		}, [])
	);
	const weakest = $derived(rates.reduce((a, r, i) => (r < rates[a] ? i : a), 0));
	const overall = $derived((counts[4] / counts[0]) * 100);

	const cohorts = [
		{ week: '6 октября', size: 200, back: [70, 50, 40] },
		{ week: '13 октября', size: 160, back: [48, 32] },
		{ week: '20 октября', size: 120, back: [48] }
	];
	const pct = (n: number, d: number) => Math.round((n / d) * 100);
</script>

<figure class="dg">
	<figcaption>Где теряются люди и кто возвращается</figcaption>
	<ol class="funnel">
		{#each names as n, i (i)}
			<li>
				<div class="row"><span>{n}</span> <strong>{counts[i]}</strong></div>
				<div class="bar" style="width: {Math.max(2, (counts[i] / 2000) * 100)}%" aria-hidden="true"></div>
				{#if i < 4}
					<label class="c">
						Переходят дальше: <strong>{rates[i]}%</strong>
						<input type="range" min="5" max="100" bind:value={rates[i]} aria-label="Доля, переходящая с шага «{n}» дальше" />
					</label>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		Общая конверсия: <strong>{overall.toFixed(1).replace('.', ',')}%</strong> ({counts[4]} из 2000). Слабее всего шаг «{names[weakest + 1].toLowerCase()}»: туда доходит {rates[weakest]}% тех, кто был на предыдущем.
	</p>

	<h4>Когорты по неделям</h4>
	<div class="wrap">
		<table>
			<thead>
				<tr><th scope="col">Когорта (неделя первого действия)</th><th scope="col">Человек</th><th scope="col">Неделя 1</th><th scope="col">Неделя 2</th><th scope="col">Неделя 3</th></tr>
			</thead>
			<tbody>
				{#each cohorts as c (c.week)}
					<tr>
						<th scope="row">{c.week}</th>
						<td class="dg-mono">{c.size}</td>
						{#each [0, 1, 2] as w (w)}
							{#if c.back[w] !== undefined}
								<td class="dg-mono" style="--a: {pct(c.back[w], c.size) / 50}">{c.back[w]} ({pct(c.back[w], c.size)}%)</td>
							{:else}
								<td class="dg-mono none">ещё не наступила</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="dg-out">Читайте таблицу по строкам: в каждой своя когорта людей. Проценты это доля вернувшихся от размера когорты. Пустые клетки справа не нули, а «время ещё не пришло». Данные выдуманы.</p>
</figure>

<style>
	.funnel {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0 0 var(--space-3);
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.bar {
		height: 0.8rem;
		background: var(--accent-measure);
		margin: var(--space-1) 0;
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.c {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		align-items: center;
		color: var(--text-secondary);
	}
	h4 {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.wrap {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th,
	td {
		padding: var(--space-2) var(--space-3);
		border-bottom: var(--line) solid var(--border-hairline);
		text-align: left;
	}
	td[style] {
		background: color-mix(in srgb, var(--accent-measure) calc(var(--a) * 40%), transparent);
	}
	.none {
		color: var(--text-secondary);
	}
</style>
