<!--
	«Воронка и когорты» (part 14, lesson 4). Above: a five-step funnel of a made-up site (2000 visitors),
	with a slider on every step; the page names the weakest step and the overall conversion. Below: a
	cohort table (people who did the main action for the first time in a given week, and how many came
	back in each later week) computed from raw counts into percentages and shaded; the same numbers are
	the lesson's practice data. Everything is made up.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			names: ['Пришли на сайт', 'Увидели предложение', 'Нажали на кнопку', 'Начали заполнять форму', 'Отправили форму'],
			weeks: ['6 октября', '13 октября', '20 октября'],
			caption: 'Где теряются люди и кто возвращается',
			goOn: 'Переходят дальше',
			rateLabel: (n: string) => `Доля, переходящая с шага «${n}» дальше`,
			overall: 'Общая конверсия',
			ofWord: 'из',
			decimal: ',',
			weakA: 'Слабее всего шаг',
			weakB: (r: number) => `туда доходит ${r}% тех, кто был на предыдущем.`,
			quote: (s: string) => `«${s}»`,
			cohortHead: 'Когорты по неделям',
			cohortCol: 'Когорта (неделя первого действия)',
			people: 'Человек',
			week: (n: number) => `Неделя ${n}`,
			notYet: 'ещё не наступила',
			note: 'Читайте таблицу по строкам: в каждой своя когорта людей. Проценты это доля вернувшихся от размера когорты. Пустые клетки справа не нули, а «время ещё не пришло». Данные выдуманы.'
		},
		en: {
			names: ['Came to the site', 'Saw the offer', 'Pressed the button', 'Started filling in the form', 'Sent the form'],
			weeks: ['6 October', '13 October', '20 October'],
			caption: 'Where people are lost and who comes back',
			goOn: 'Go on',
			rateLabel: (n: string) => `Share that goes on from the step “${n}”`,
			overall: 'Overall conversion',
			ofWord: 'of',
			decimal: '.',
			weakA: 'The weakest step is',
			weakB: (r: number) => `only ${r}% of those at the previous step get there.`,
			quote: (s: string) => `“${s}”`,
			cohortHead: 'Cohorts by week',
			cohortCol: 'Cohort (week of the first action)',
			people: 'People',
			week: (n: number) => `Week ${n}`,
			notYet: 'not reached yet',
			note: 'Read the table by rows: each has its own cohort of people. The percentages are the share who came back out of the cohort’s size. The empty cells on the right are not zeros but “the time has not come”. The data is invented.'
		}
	});

	const names = W.names;
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
		{ week: W.weeks[0], size: 200, back: [70, 50, 40] },
		{ week: W.weeks[1], size: 160, back: [48, 32] },
		{ week: W.weeks[2], size: 120, back: [48] }
	];
	const pct = (n: number, d: number) => Math.round((n / d) * 100);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<ol class="funnel">
		{#each names as n, i (i)}
			<li>
				<div class="row"><span>{n}</span> <strong>{counts[i]}</strong></div>
				<div class="bar" style="width: {Math.max(2, (counts[i] / 2000) * 100)}%" aria-hidden="true"></div>
				{#if i < 4}
					<label class="c">
						{W.goOn}: <strong>{rates[i]}%</strong>
						<input type="range" min="5" max="100" bind:value={rates[i]} aria-label={W.rateLabel(n)} />
					</label>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">
		{W.overall}: <strong>{overall.toFixed(1).replace('.', W.decimal)}%</strong> ({counts[4]} {W.ofWord} 2000). {W.weakA} {W.quote(names[weakest + 1].toLowerCase())}: {W.weakB(rates[weakest])}
	</p>

	<div class="dh">{W.cohortHead}</div>
	<div class="wrap">
		<table>
			<thead>
				<tr><th scope="col">{W.cohortCol}</th><th scope="col">{W.people}</th><th scope="col">{W.week(1)}</th><th scope="col">{W.week(2)}</th><th scope="col">{W.week(3)}</th></tr>
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
								<td class="dg-mono none">{W.notYet}</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="dg-out">{W.note}</p>
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
	.dh {
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
