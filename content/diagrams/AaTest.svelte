<!--
	«Два одинаковых текста» (part 12, lesson 13). An A/A test in the browser: two versions of a page
	that are identical, each shown to n visitors, 10% of whom (by construction) click. The reader runs
	twenty such tests and sees how often one «wins» by a few points purely by chance, and how that
	fades as n grows. Everything is random numbers on this page; nothing is measured on real people.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			caption: 'Два одинаковых текста: кто «победит»?',
			group: 'Посетителей на версию',
			per: (v: number) => `${v} на версию`,
			go: 'Провести 20 тестов',
			results: 'Результаты тестов',
			noDiff: 'разницы нет',
			wonB: '← «победила» B',
			wonA: '← «победила» A',
			lead: 'В ',
			of: (k: number) => `${k} из 20`,
			tail: ' тестов один из двух ',
			same: 'одинаковых',
			tail2: ' текстов «выиграл» три и более процентных пункта.',
			note: 'Тексты в схеме одинаковые, и в каждом по замыслу кликают 10% посетителей. На малых числах случай легко создаёт «победителя». С ростом числа посетителей такие «победы» исчезают. Поэтому на двадцати посетителях нельзя делать вывод о тексте.'
		},
		en: {
			caption: 'Two identical texts: which one “wins”?',
			group: 'Visitors per version',
			per: (v: number) => `${v} per version`,
			go: 'Run 20 tests',
			results: 'Test results',
			noDiff: 'no difference',
			wonB: '← B “won”',
			wonA: '← A “won”',
			lead: 'In ',
			of: (k: number) => `${k} out of 20`,
			tail: ' tests, one of two ',
			same: 'identical',
			tail2: ' texts “won” by three or more percentage points.',
			note: 'The texts in the diagram are identical, and by design 10% of visitors click on each. With small numbers, chance easily creates a “winner”. As the number of visitors grows, such “wins” disappear. That is why you can’t draw a conclusion about a text from twenty visitors.'
		}
	});

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
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		{#each ns as v (v)}
			<button type="button" aria-pressed={n === v} onclick={() => ((n = v), (runs = []))}>{W.per(v)}</button>
		{/each}
	</div>
	<div class="dg-ctl"><button type="button" onclick={go}>{W.go}</button></div>
	{#if runs.length}
		<ul class="runs" aria-label={W.results}>
			{#each runs as r, i (i)}
				<li class:win={Math.abs(r.diff) >= 3}>
					<span class="dg-mono">A {r.a.toFixed(1)}% · B {r.b.toFixed(1)}%</span>
					<span>{Math.abs(r.diff) >= 3 ? (r.diff > 0 ? W.wonB : W.wonA) : W.noDiff}</span>
				</li>
			{/each}
		</ul>
		<p class="dg-out" aria-live="polite">
			{W.lead}<strong>{W.of(looksLikeWinner)}</strong>{W.tail}<em>{W.same}</em>{W.tail2}
		</p>
	{/if}
	<p class="dg-out">{W.note}</p>
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
