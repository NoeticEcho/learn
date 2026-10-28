<!--
	«Кривая забывания» (part 0). A schematic, not FSRS itself: memory fades as exp(-t/S), where S,
	the stability, grows each time the person recalls the card. The person moves the interval
	between reviews and sees the two curves: with reviews and without.

	Bilingual (docs/content-plan/README.md, «English edition»): its words are in `W`, one entry per
	edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick, pl } from '#lib/i18n/index.ts';
	const DAYS = 60;
	const WIDTH = 480,
		H = 250,
		L = 46,
		B = 28,
		T = 10,
		R = 10;
	const intervals = [1, 3, 7, 14, 21, 30];
	let interval = $state(3);

	const x = (d: number) => L + ((WIDTH - L - R) * d) / DAYS;
	const y = (p: number) => T + (H - T - B) * (1 - p);

	// stability in days; a recall at retention r multiplies it (more is gained when more was forgotten)
	function curve(step: number | null) {
		let s = 2,
			last = 0;
		const pts: [number, number][] = [];
		const reviews: number[] = [];
		for (let d = 0; d <= DAYS; d += 0.5) {
			if (step && d > 0 && d - last >= step - 1e-9) {
				const r = Math.exp(-(d - last) / s);
				s *= r > 0.5 ? 2.4 : 1.3;
				last = d;
				reviews.push(d);
				pts.push([d, 1]);
				continue;
			}
			pts.push([d, Math.exp(-(d - last) / s)]);
		}
		return { pts, reviews, end: pts[pts.length - 1][1] };
	}
	const path = (pts: [number, number][]) => pts.map(([d, p], i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
	const without = curve(null);
	const withReviews = $derived(curve(interval));
	const pct = (p: number) => Math.round(p * 100);
	const W = pick({
		ru: {
			caption: `Одна карточка за ${DAYS} дней`,
			group: 'Как часто повторять карточку',
			every: (d: number) => `каждые ${d} ${pl(d, 'day.forms', 'ru')}`,
			chart: 'График: вероятность вспомнить карточку по дням, с повторениями и без',
			under: 'меньше 1%',
			times: (n: number) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'раза' : 'раз'),
			with: (n: number, times: string) => `С повторениями (${n} ${times}) к ${DAYS}-му дню:`,
			without: 'Без повторений:',
			after:
				'Точки на графике: дни, когда вы смотрели карточку. Слишком редко (раз в 30 дней) карточка успевает забыться почти целиком, слишком часто (каждый день) уходит лишний труд. Это схема; реальное расписание считает алгоритм FSRS.'
		},
		en: {
			caption: `One card over ${DAYS} days`,
			group: 'How often to review the card',
			every: (d: number) => (d === 1 ? 'every day' : `every ${d} days`),
			chart: 'Chart: the chance of recalling the card, day by day, with reviews and without',
			under: 'under 1%',
			times: (n: number) => (n === 1 ? 'review' : 'reviews'),
			with: (n: number, times: string) => `With reviews (${n} ${times}), by day ${DAYS}:`,
			without: 'Without reviews:',
			after:
				'The dots on the chart are the days you looked at the card. Too rarely (once in 30 days) and the card is almost entirely forgotten in between; too often (every day) and the effort is wasted. This is a sketch; the real schedule is worked out by the FSRS algorithm.'
		}
	});
	const show = (p: number) => (p < 0.01 ? W.under : pct(p) + '%');
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each intervals as d (d)}
			<button type="button" aria-pressed={interval === d} onclick={() => (interval = d)}>
				{W.every(d)}
			</button>
		{/each}
	</div>
	<svg viewBox="0 0 {WIDTH} {H}" role="img" aria-label={W.chart} width="100%">
		{#each [0, 0.5, 1] as p (p)}
			<line x1={L} x2={WIDTH - R} y1={y(p)} y2={y(p)} stroke="var(--border-hairline)" />
			<text x={L - 6} y={y(p) + 4} text-anchor="end" font-size="13">{pct(p)}%</text>
		{/each}
		{#each [0, 15, 30, 45, 60] as d (d)}
			<text x={x(d)} y={H - 8} text-anchor="middle" font-size="13">{d}</text>
		{/each}
		<path d={path(without.pts)} fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-dasharray="5 4" />
		<path d={path(withReviews.pts)} fill="none" stroke="var(--accent-measure)" stroke-width="2.5" />
		{#each withReviews.reviews as d (d)}
			<circle cx={x(d)} cy={y(1)} r="3.5" fill="var(--accent-measure)" />
		{/each}
	</svg>
	<p class="dg-out" aria-live="polite">
		{W.with(withReviews.reviews.length, W.times(withReviews.reviews.length))} <strong>{show(withReviews.end)}</strong>. {W.without}
		<strong>{show(without.end)}</strong>. {W.after}
	</p>
</figure>
