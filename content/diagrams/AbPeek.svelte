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
	<figcaption>Сколько «побед» у двух одинаковых вариантов</figcaption>
	<div class="dg-ctl" role="group" aria-label="Посетителей на вариант">
		{#each sizes as s (s)}
			<button type="button" aria-pressed={n === s} onclick={() => ((n = s), (result = null))}>{s} на вариант</button>
		{/each}
	</div>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={peek} onchange={() => (result = null)} /> подглядывать 10 раз и остановиться при первой «победе»</label>
		<label><input type="checkbox" bind:checked={real} onchange={() => (result = null)} /> у варианта B на самом деле 6% вместо 5%</label>
	</div>
	<div class="dg-ctl"><button type="button" onclick={go}>Провести 300 экспериментов</button></div>

	{#if result}
		<p class="dg-out" aria-live="polite">
			{#if real}
				Эксперимент заметил настоящую разницу (6% против 5%) в <strong>{Math.round((result.wins / result.trials) * 100)}%</strong> случаев из {result.trials}. {n < need ? 'Для такой разницы нужно примерно ' + need + ' человек на вариант: при меньшем числе тест часто не видит настоящего эффекта.' : 'Выборка достаточна для этой разницы.'}
			{:else}
				«Победителем» объявлен один из двух <em>одинаковых</em> вариантов в <strong>{Math.round((result.wins / result.trials) * 100)}%</strong> случаев из {result.trials}. {peek ? 'Честная норма около 5%: подглядывание умножило ложные победы.' : 'Один взгляд в конце даёт около 5%: так и задумано при выбранном пороге.'}
			{/if}
		</p>
	{/if}
	<p class="dg-out">Правило для оценки: чтобы заметить разницу в d процентных пунктов при доле p, нужно около 16·p·(1−p)/d² человек на вариант. Для 5% против 6% это около {need}. Это грубая оценка для привычных порогов (5% ложных побед и 80% шанса заметить). Всё в схеме смоделировано, настоящих людей нет.</p>
</figure>
