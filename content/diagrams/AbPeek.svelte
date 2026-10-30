<!--
	«Подглядывание» (part 14, lesson 6). 300 simulated experiments in the browser. Every visitor
	converts with probability 5% (both variants identical) or, with the switch on, variant B really
	converts at 6%. The reader chooses how many visitors each variant gets, and whether the experimenter
	looks at the result ten times along the way and stops at the first «значимая» difference, or looks
	once, at the end. A two-sided two-proportion z-test at the 5% level decides what «значимая» means.
	With identical variants a single look at the end gives about 5% false wins; ten looks give several
	times more. With the real uplift the same run shows how often the test notices it (its power). The
	rule of thumb n ≈ 16·p(1−p)/d² for 80% power is shown beside it. Nothing here is real data.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';


	const W = pick({
		ru: {
			caption: 'Сколько «побед» у двух одинаковых вариантов',
			group: 'Посетителей на вариант',
			per: (s: number) => `${s} на вариант`,
			peek: 'подглядывать 10 раз и остановиться при первой «победе»',
			real: 'у варианта B на самом деле 6% вместо 5%',
			go: 'Провести 300 экспериментов',
			noticed: 'Эксперимент заметил настоящую разницу (6% против 5%) в',
			cases: 'случаев из',
			needMore: (need: number) => `Для такой разницы нужно примерно ${need} человек на вариант: при меньшем числе тест часто не видит настоящего эффекта.`,
			enough: 'Выборка достаточна для этой разницы.',
			declaredA: '«Победителем» объявлен один из двух',
			identical: 'одинаковых',
			declaredB: 'вариантов в',
			peekNote: 'Честная норма около 5%: подглядывание умножило ложные победы.',
			onceNote: 'Один взгляд в конце даёт около 5%: так и задумано при выбранном пороге.',
			rule: (need: number) => `Правило для оценки: чтобы заметить разницу в d процентных пунктов при доле p, нужно около 16·p·(1−p)/d² человек на вариант. Для 5% против 6% это около ${need}. Это грубая оценка для привычных порогов (5% ложных побед и 80% шанса заметить). Всё в схеме смоделировано, настоящих людей нет.`
		},
		en: {
			caption: 'How many “wins” two identical variants get',
			group: 'Visitors per variant',
			per: (s: number) => `${s} per variant`,
			peek: 'peek 10 times and stop at the first “win”',
			real: 'variant B really converts at 6% instead of 5%',
			go: 'Run 300 experiments',
			noticed: 'The experiment noticed the real difference (6% against 5%) in',
			cases: 'cases out of',
			needMore: (need: number) => `For a difference like that you need about ${need} people per variant: with fewer, the test often misses the real effect.`,
			enough: 'The sample is enough for this difference.',
			declaredA: 'One of the two',
			identical: 'identical',
			declaredB: 'variants was declared the “winner” in',
			peekNote: 'The honest rate is about 5%: peeking multiplied the false wins.',
			onceNote: 'One look at the end gives about 5%: that is by design at the chosen threshold.',
			rule: (need: number) => `A rule of thumb: to notice a difference of d percentage points at a share p, you need about 16·p·(1−p)/d² people per variant. For 5% against 6% that is about ${need}. It is a rough estimate for the usual thresholds (5% false wins and an 80% chance of noticing). Everything in the diagram is simulated, there are no real people.`
		}
	});

	const sizes = [200, 1000, 3000, 7600, 15000];
	let n = $state(1000);
	let peek = $state(false);
	let real = $state(false);
	let result = $state<{ wins: number; trials: number } | null>(null);

	const P = 0.05;
	const TRIALS = 300;

	function z(ca: number, cb: number, m: number): number {
		const pool = (ca + cb) / (2 * m);
		if (pool === 0 || pool === 1) return 0;
		const se = Math.sqrt(pool * (1 - pool) * (2 / m));
		return (cb / m - ca / m) / se;
	}

	function go() {
		const looks = peek ? 10 : 1;
		const step = Math.max(1, Math.floor(n / looks));
		let wins = 0;
		for (let t = 0; t < TRIALS; t++) {
			let ca = 0;
			let cb = 0;
			let won = false;
			for (let i = 1; i <= n; i++) {
				if (Math.random() < P) ca++;
				if (Math.random() < (real ? 0.06 : P)) cb++;
				if (i % step === 0 || i === n) {
					if (Math.abs(z(ca, cb, i)) > 1.96 && (peek || i === n)) {
						won = true;
						break;
					}
				}
			}
			if (won) wins++;
		}
		result = { wins, trials: TRIALS };
	}
	const need = Math.round((16 * P * (1 - P)) / 0.01 ** 2);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each sizes as s (s)}
			<button type="button" aria-pressed={n === s} onclick={() => ((n = s), (result = null))}>{W.per(s)}</button>
		{/each}
	</div>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={peek} onchange={() => (result = null)} /> {W.peek}</label>
		<label><input type="checkbox" bind:checked={real} onchange={() => (result = null)} /> {W.real}</label>
	</div>
	<div class="dg-ctl"><button type="button" onclick={go}>{W.go}</button></div>

	{#if result}
		<p class="dg-out" aria-live="polite">
			{#if real}
				{W.noticed} <strong>{Math.round((result.wins / result.trials) * 100)}%</strong> {W.cases} {result.trials}. {n < need ? W.needMore(need) : W.enough}
			{:else}
				{W.declaredA} <em>{W.identical}</em> {W.declaredB} <strong>{Math.round((result.wins / result.trials) * 100)}%</strong> {W.cases} {result.trials}. {peek ? W.peekNote : W.onceNote}
			{/if}
		</p>
	{/if}
	<p class="dg-out">{W.rule(need)}</p>
</figure>
