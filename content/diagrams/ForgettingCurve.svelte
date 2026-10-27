<!--
	«Кривая забывания» (part 0). A schematic, not FSRS itself: memory fades as exp(-t/S), where S,
	the stability, grows each time the person recalls the card. The person moves the interval
	between reviews and sees the two curves: with reviews and without.
-->
<script lang="ts">
	import './shared.css';
	const DAYS = 60;
	const W = 480,
		H = 250,
		L = 46,
		B = 28,
		T = 10,
		R = 10;
	const intervals = [1, 3, 7, 14, 21, 30];
	let interval = $state(3);

	const x = (d: number) => L + ((W - L - R) * d) / DAYS;
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
	const show = (p: number) => (p < 0.01 ? 'меньше 1%' : pct(p) + '%');
	const word = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'раз' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'раза' : 'раз');
</script>

<figure class="dg">
	<figcaption>Одна карточка за {DAYS} дней</figcaption>
	<div class="dg-ctl" role="group" aria-label="Как часто повторять карточку">
		{#each intervals as d (d)}
			<button type="button" aria-pressed={interval === d} onclick={() => (interval = d)}>
				каждые {d} {d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}
			</button>
		{/each}
	</div>
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="График: вероятность вспомнить карточку по дням, с повторениями и без" width="100%">
		{#each [0, 0.5, 1] as p (p)}
			<line x1={L} x2={W - R} y1={y(p)} y2={y(p)} stroke="var(--border-hairline)" />
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
		С повторениями ({withReviews.reviews.length} {word(withReviews.reviews.length)}) к {DAYS}-му дню: <strong>{show(withReviews.end)}</strong>. Без повторений:
		<strong>{show(without.end)}</strong>. Точки на графике: дни, когда вы смотрели карточку. Слишком редко (раз в 30 дней) карточка успевает забыться почти целиком, слишком часто
		(каждый день) уходит лишний труд. Это схема; реальное расписание считает алгоритм FSRS.
	</p>
</figure>
