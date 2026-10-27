<!--
	«Две ловушки цифр» (part 14, lesson 5). Tab one: a made-up site is rewarded for the number of
	leads, and a slider is the pressure put on that number (a shorter form, a pop-up, a sweetener). The
	number of leads grows, the share of useful leads falls, and the count of useful leads rises a
	little and then drops: Goodhart's law in four lines of arithmetic. Tab two: Simpson's paradox with
	made-up weekly numbers: both device groups improved, and the total fell, because the mix of visitors
	changed. Everything is invented; the formulas are the author's illustration, not measured behaviour.
-->
<script lang="ts">
	import './shared.css';

	let tab = $state<'goodhart' | 'simpson'>('goodhart');
	let pressure = $state(0);
	const base = 100;
	const leads = $derived(Math.round(base * (1 + 0.8 * (pressure / 100))));
	const share = $derived(0.6 * (1 - 0.7 * (pressure / 100)));
	const useful = $derived(Math.round(leads * share));

	let bySegment = $state(true);
	const weeks = [
		{ name: 'Неделя 1', seg: [{ n: 'Телефон', v: 100, c: 5 }, { n: 'Компьютер', v: 900, c: 90 }] },
		{ name: 'Неделя 2', seg: [{ n: 'Телефон', v: 900, c: 54 }, { n: 'Компьютер', v: 100, c: 12 }] }
	];
	const pct = (c: number, v: number) => ((c / v) * 100).toFixed(1).replace('.', ',') + '%';
</script>

<figure class="dg">
	<figcaption>Как цифры обманывают без вранья</figcaption>
	<div class="dg-ctl" role="group" aria-label="Ловушка">
		<button type="button" aria-pressed={tab === 'goodhart'} onclick={() => (tab = 'goodhart')}>Цель стала мишенью</button>
		<button type="button" aria-pressed={tab === 'simpson'} onclick={() => (tab = 'simpson')}>Среднее и состав</button>
	</div>

	{#if tab === 'goodhart'}
		<label class="v">
			Давление на «число заявок»: <strong>{pressure}%</strong>
			<input type="range" min="0" max="100" step="5" bind:value={pressure} aria-label="Насколько сильно вы давите на число заявок" />
		</label>
		<table>
			<tbody>
				<tr><th scope="row">Заявок в месяц</th><td class="dg-mono">{leads}</td></tr>
				<tr><th scope="row">Доля настоящих заявок</th><td class="dg-mono">{Math.round(share * 100)}%</td></tr>
				<tr><th scope="row">Настоящих заявок</th><td class="dg-mono">{useful}</td></tr>
			</tbody>
		</table>
		<p class="dg-out" aria-live="polite">
			{#if pressure === 0}
				Без давления: {leads} заявок, из них {useful} настоящие.
			{:else if useful < 60}
				Показатель «число заявок» вырос до {leads}, а настоящих заявок стало {useful}: меньше, чем в начале. Метрика стала мишенью и перестала измерять то, что вы хотели.
			{:else}
				Заявок {leads}, а настоящих {useful}: почти столько же, сколько было. Число растёт, польза нет. Давите сильнее, и настоящих станет меньше.
			{/if}
		</p>
		<p class="dg-out">Формулы упрощены: давление растит число заявок и снижает долю настоящих. Числа выдуманы, а смысл не выдуман: показатель, за который награждают, начинают улучшать любыми способами.</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label="Как смотреть">
			<button type="button" aria-pressed={bySegment} onclick={() => (bySegment = true)}>По группам</button>
			<button type="button" aria-pressed={!bySegment} onclick={() => (bySegment = false)}>Всего</button>
		</div>
		<div class="two">
			{#each weeks as w (w.name)}
				<div class="dg-box">
					<h4>{w.name}</h4>
					{#if bySegment}
						<ul>
							{#each w.seg as s (s.n)}<li>{s.n}: {s.c} из {s.v}, конверсия <strong>{pct(s.c, s.v)}</strong></li>{/each}
						</ul>
					{:else}
						{@const v = w.seg.reduce((a, s) => a + s.v, 0)}
						{@const c = w.seg.reduce((a, s) => a + s.c, 0)}
						<p>Всего: {c} из {v}, конверсия <strong>{pct(c, v)}</strong></p>
					{/if}
				</div>
			{/each}
		</div>
		<p class="dg-out" aria-live="polite">
			{#if bySegment}
				В каждой группе конверсия выросла: у телефонов с 5% до 6%, у компьютеров с 10% до 12%.
			{:else}
				В целом конверсия упала с 9,5% до 6,6%, хотя в каждой группе выросла. Дело в составе: на второй неделе больше посетителей с телефона, где конверсия ниже.
			{/if}
		</p>
		<p class="dg-out">Это парадокс Симпсона. Вывод не «числа лгут», а «общее среднее смешивает группы, и когда состав меняется, оно может говорить обратное каждой из них».</p>
	{/if}
</figure>

<style>
	label.v {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	table {
		border-collapse: collapse;
		margin-bottom: var(--space-3);
	}
	th,
	td {
		padding: var(--space-2) var(--space-4) var(--space-2) 0;
		text-align: left;
		border-bottom: var(--line) solid var(--border-hairline);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-3);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.dg-box p {
		margin: 0;
	}
</style>
