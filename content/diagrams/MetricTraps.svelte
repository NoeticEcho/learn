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
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			caption: 'Как цифры обманывают без вранья',
			trap: 'Ловушка',
			t1: 'Цель стала мишенью',
			t2: 'Среднее и состав',
			pressure: 'Давление на «число заявок»',
			pressureLabel: 'Насколько сильно вы давите на число заявок',
			leads: 'Заявок в месяц',
			share: 'Доля настоящих заявок',
			real: 'Настоящих заявок',
			none: (l: number, u: number) => `Без давления: ${l} заявок, из них ${u} настоящие.`,
			low: (l: number, u: number) => `Показатель «число заявок» вырос до ${l}, а настоящих заявок стало ${u}: меньше, чем в начале. Метрика стала мишенью и перестала измерять то, что вы хотели.`,
			mid: (l: number, u: number) => `Заявок ${l}, а настоящих ${u}: почти столько же, сколько было. Число растёт, польза нет. Давите сильнее, и настоящих станет меньше.`,
			note1: 'Формулы упрощены: давление растит число заявок и снижает долю настоящих. Числа выдуманы, а смысл не выдуман: показатель, за который награждают, начинают улучшать любыми способами.',
			how: 'Как смотреть',
			bySeg: 'По группам',
			total: 'Всего',
			weeks: ['Неделя 1', 'Неделя 2'],
			segs: ['Телефон', 'Компьютер'],
			segLine: (n: string, c: number, v: number) => `${n}: ${c} из ${v}, конверсия`,
			totalLine: (c: number, v: number) => `Всего: ${c} из ${v}, конверсия`,
			decimal: ',',
			grew: 'В каждой группе конверсия выросла: у телефонов с 5% до 6%, у компьютеров с 10% до 12%.',
			fell: 'В целом конверсия упала с 9,5% до 6,6%, хотя в каждой группе выросла. Дело в составе: на второй неделе больше посетителей с телефона, где конверсия ниже.',
			note2: 'Это парадокс Симпсона. Вывод не «числа лгут», а «общее среднее смешивает группы, и когда состав меняется, оно может говорить обратное каждой из них».'
		},
		en: {
			caption: 'How numbers deceive without lying',
			trap: 'The trap',
			t1: 'A target becomes a bullseye',
			t2: 'The average and the mix',
			pressure: 'Pressure on the “number of leads”',
			pressureLabel: 'How hard you press on the number of leads',
			leads: 'Leads a month',
			share: 'Share of real leads',
			real: 'Real leads',
			none: (l: number, u: number) => `No pressure: ${l} leads, ${u} of them real.`,
			low: (l: number, u: number) => `The “number of leads” measure rose to ${l}, while real leads fell to ${u}: fewer than at the start. The metric became a target and stopped measuring what you wanted.`,
			mid: (l: number, u: number) => `${l} leads, ${u} of them real: about as many as before. The number grows, the value does not. Press harder and the real ones will be fewer.`,
			note1: 'The formulas are simplified: pressure raises the number of leads and lowers the share of real ones. The numbers are invented, but the point is not: a measure that is rewarded gets improved by any means.',
			how: 'How to look',
			bySeg: 'By group',
			total: 'In total',
			weeks: ['Week 1', 'Week 2'],
			segs: ['Phone', 'Desktop'],
			segLine: (n: string, c: number, v: number) => `${n}: ${c} of ${v}, conversion`,
			totalLine: (c: number, v: number) => `In total: ${c} of ${v}, conversion`,
			decimal: '.',
			grew: 'In each group conversion rose: for phones from 5% to 6%, for desktops from 10% to 12%.',
			fell: 'In total, conversion fell from 9.5% to 6.6%, though it rose in each group. The mix is the reason: in week 2 there were more visitors on phones, where conversion is lower.',
			note2: 'This is Simpson’s paradox. The lesson is not “numbers lie” but “an overall average mixes groups, and when the mix changes it can say the opposite of what each of them says”.'
		}
	});

	let tab = $state<'goodhart' | 'simpson'>('goodhart');
	let pressure = $state(0);
	const base = 100;
	const leads = $derived(Math.round(base * (1 + 0.8 * (pressure / 100))));
	const share = $derived(0.6 * (1 - 0.7 * (pressure / 100)));
	const useful = $derived(Math.round(leads * share));

	let bySegment = $state(true);
	const weeks = [
		{ name: W.weeks[0], seg: [{ n: W.segs[0], v: 100, c: 5 }, { n: W.segs[1], v: 900, c: 90 }] },
		{ name: W.weeks[1], seg: [{ n: W.segs[0], v: 900, c: 54 }, { n: W.segs[1], v: 100, c: 12 }] }
	];
	const pct = (c: number, v: number) => ((c / v) * 100).toFixed(1).replace('.', W.decimal) + '%';
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.trap}>
		<button type="button" aria-pressed={tab === 'goodhart'} onclick={() => (tab = 'goodhart')}>{W.t1}</button>
		<button type="button" aria-pressed={tab === 'simpson'} onclick={() => (tab = 'simpson')}>{W.t2}</button>
	</div>

	{#if tab === 'goodhart'}
		<label class="v">
			{W.pressure}: <strong>{pressure}%</strong>
			<input type="range" min="0" max="100" step="5" bind:value={pressure} aria-label={W.pressureLabel} />
		</label>
		<table>
			<tbody>
				<tr><th scope="row">{W.leads}</th><td class="dg-mono">{leads}</td></tr>
				<tr><th scope="row">{W.share}</th><td class="dg-mono">{Math.round(share * 100)}%</td></tr>
				<tr><th scope="row">{W.real}</th><td class="dg-mono">{useful}</td></tr>
			</tbody>
		</table>
		<p class="dg-out" aria-live="polite">
			{#if pressure === 0}
				{W.none(leads, useful)}
			{:else if useful < 60}
				{W.low(leads, useful)}
			{:else}
				{W.mid(leads, useful)}
			{/if}
		</p>
		<p class="dg-out">{W.note1}</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label={W.how}>
			<button type="button" aria-pressed={bySegment} onclick={() => (bySegment = true)}>{W.bySeg}</button>
			<button type="button" aria-pressed={!bySegment} onclick={() => (bySegment = false)}>{W.total}</button>
		</div>
		<div class="two">
			{#each weeks as w (w.name)}
				<div class="dg-box">
					<div class="dh">{w.name}</div>
					{#if bySegment}
						<ul>
							{#each w.seg as s (s.n)}<li>{W.segLine(s.n, s.c, s.v)} <strong>{pct(s.c, s.v)}</strong></li>{/each}
						</ul>
					{:else}
						{@const v = w.seg.reduce((a, s) => a + s.v, 0)}
						{@const c = w.seg.reduce((a, s) => a + s.c, 0)}
						<p>{W.totalLine(c, v)} <strong>{pct(c, v)}</strong></p>
					{/if}
				</div>
			{/each}
		</div>
		<p class="dg-out" aria-live="polite">
			{#if bySegment}
				{W.grew}
			{:else}
				{W.fell}
			{/if}
		</p>
		<p class="dg-out">{W.note2}</p>
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
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.dg-box p {
		margin: 0;
	}
</style>
