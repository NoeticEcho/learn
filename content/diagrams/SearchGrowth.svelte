<!--
	«Перебор и эвристика» (course ai, lesson symbols/logic-theorist). An illustration, not Logic
	Theorist's own figures: if every step of a proof could be taken ten ways, the paths to try
	grow tenfold a step, while a rule of thumb that keeps only the two most promising moves grows
	them twofold. The person sets the proof's length and sees both counts, on a scale of powers of
	ten, with the numbers in text under the chart.

	Bilingual: its words are in `W`, one entry per edition, picked by the page's locale.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	const WAYS = 10;
	const KEPT = 2;
	const MAX = 8;
	let steps = $state(4);
	const blind = $derived(WAYS ** steps);
	const guided = $derived(KEPT ** steps);

	const WIDTH = 480;
	const L = 120;
	// a bar's length on a scale of powers of ten: 1 is the left edge, 10^8 the right
	const bar = (n: number) => Math.max(4, ((WIDTH - L - 16) * Math.log10(n)) / MAX);

	// «шаг», «шага», «шагов» after a number
	const steps3 = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'шаг' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'шага' : 'шагов');
	const W = pick({
		ru: {
			caption: 'Сколько путей проверить',
			label: 'Шагов в доказательстве',
			blind: 'Перебор',
			guided: 'Эвристика',
			chart: (b: string, g: string) => `Столбики на логарифмической шкале. Путей проверить: перебором ${b}, с эвристикой ${g}`,
			num: (n: number) => n.toLocaleString('ru-RU'),
			out: (s: number, b: string, g: string) =>
				`Если каждый шаг можно сделать ${WAYS} способами, а в доказательстве ${s} ${steps3(s)}, перебор проверяет ${b} путей. Правило, которое оставляет только ${KEPT} самых обещающих хода, проверяет ${g}. Цена эвристики: иногда она отбрасывает тот единственный путь, который вёл к цели. Числа условные, это схема, а не данные Logic Theorist.`
		},
		en: {
			caption: 'How many paths to try',
			label: 'Steps in the proof',
			blind: 'Brute force',
			guided: 'Heuristic',
			chart: (b: string, g: string) => `Bars on a logarithmic scale. Paths to try: ${b} by brute force, ${g} with a heuristic`,
			num: (n: number) => n.toLocaleString('en-US'),
			out: (s: number, b: string, g: string) =>
				`If every step can be taken ${WAYS} ways, a proof of ${s} ${s === 1 ? 'step' : 'steps'} means trying ${b} paths by brute force. A rule that keeps only the ${KEPT} most promising moves tries ${g}. The price of a heuristic: sometimes it throws away the one path that led to the goal. The numbers are made up: this is a sketch, not Logic Theorist’s data.`
		}
	});
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.label}: <strong>{steps}</strong>
			<input type="range" min="1" max={MAX} bind:value={steps} />
		</label>
	</div>
	<svg viewBox="0 0 {WIDTH} 110" role="img" aria-label={W.chart(W.num(blind), W.num(guided))} width="100%">
		<text x="0" y="36" font-size="14" fill="var(--text-primary)">{W.blind}</text>
		<rect x={L} y="20" width={bar(blind)} height="24" fill="var(--text-secondary)" />
		<text x="0" y="86" font-size="14" fill="var(--text-primary)">{W.guided}</text>
		<rect x={L} y="70" width={bar(guided)} height="24" fill="var(--accent-measure)" />
	</svg>
	<p class="dg-out" aria-live="polite">{W.out(steps, W.num(blind), W.num(guided))}</p>
</figure>
