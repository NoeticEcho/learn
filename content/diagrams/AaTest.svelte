<!--
	«Два одинаковых текста» (part 12, lesson 13). An A/A test in the browser: two versions of a page
	that are identical, each shown to n visitors, 10% of whom (by construction) click. The reader runs
	twenty such tests and sees how often one «wins» by a few points purely by chance, and how that
	fades as n grows. Everything is random numbers on this page; nothing is measured on real people.
-->
<script lang="ts">
	import './shared.css';

	let n = $state(50);
	const ns = [20, 50, 200, 1000, 5000];
	const P = 0.1;
	type Run = { a: number; b: number; diff: number };
	let runs = $state<Run[]>([]);

	function binom(count: number): number {
		let k = 0;
		for (let i = 0; i < count; i++) if (Math.random() < P) k++;
		return k;
	}
	function go() {
		const out: Run[] = [];
		for (let i = 0; i < 20; i++) {
			const a = binom(n);
			const b = binom(n);
			out.push({ a: (a / n) * 100, b: (b / n) * 100, diff: ((b - a) / n) * 100 });
		}
		runs = out;
	}
	const looksLikeWinner = $derived(runs.filter((r) => Math.abs(r.diff) >= 3).length);
</script>

<figure class="dg">
	<figcaption>Два одинаковых текста: кто «победит»?</figcaption>
	<div class="dg-ctl" role="group" aria-label="Посетителей на версию">
		{#each ns as v (v)}
			<button type="button" aria-pressed={n === v} onclick={() => ((n = v), (runs = []))}>{v} на версию</button>
		{/each}
	</div>
	<div class="dg-ctl"><button type="button" onclick={go}>Провести 20 тестов</button></div>
	{#if runs.length}
		<ul class="runs" aria-label="Результаты тестов">
			{#each runs as r, i (i)}
				<li class:win={Math.abs(r.diff) >= 3}>
					<span class="dg-mono">A {r.a.toFixed(1)}% · B {r.b.toFixed(1)}%</span>
					<span>{Math.abs(r.diff) >= 3 ? (r.diff > 0 ? '← «победила» B' : '← «победила» A') : 'разницы нет'}</span>
				</li>
			{/each}
		</ul>
		<p class="dg-out" aria-live="polite">
			В <strong>{looksLikeWinner} из 20</strong> тестов один из двух <em>одинаковых</em> текстов «выиграл» три и более процентных пункта.
		</p>
	{/if}
	<p class="dg-out">Тексты в схеме одинаковые, и в каждом по замыслу кликают 10% посетителей. На малых числах случай легко создаёт «победителя». С ростом числа посетителей такие «победы» исчезают. Поэтому на двадцати посетителях нельзя делать вывод о тексте.</p>
</figure>

<style>
	.runs {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
		max-height: 14rem;
		overflow: auto;
	}
	.runs li {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-1) var(--space-2);
		border: var(--line) solid var(--border-hairline);
	}
	.runs li.win {
		border-color: var(--border-brass);
		border-left-width: 4px;
	}
</style>
