<!--
	«ICE и RICE» (part 11, lesson 9). Five growth ideas of a made-up bicycle workshop, each scored
	twice: ICE (impact, confidence, ease; 1–10 each) and RICE (reach, impact, confidence, effort).
	The two rankings sit side by side and the page says why an idea moved. The names and numbers
	are editable. It is a lever for a conversation, not a verdict: the numbers are guesses, and the
	page says so.
-->
<script lang="ts">
	import './shared.css';

	type Idea = { name: string; i: number; c: number; e: number; reach: number; impact: number; conf: number; effort: number };
	let ideas = $state<Idea[]>([
		{ name: 'Страница с ценами и сроками', i: 8, c: 8, e: 7, reach: 400, impact: 2, conf: 80, effort: 0.5 },
		{ name: 'Запись на ремонт в мессенджере', i: 7, c: 6, e: 5, reach: 250, impact: 1, conf: 80, effort: 1 },
		{ name: 'Статья «Как проверить тормоза самому»', i: 5, c: 5, e: 6, reach: 600, impact: 0.5, conf: 50, effort: 1 },
		{ name: 'Рекламная кампания в соцсети', i: 6, c: 4, e: 4, reach: 1500, impact: 1, conf: 50, effort: 2 },
		{ name: 'Письмо клиентам после ремонта с просьбой об отзыве', i: 6, c: 7, e: 9, reach: 80, impact: 1, conf: 80, effort: 0.25 }
	]);
	const ice = (x: Idea) => Math.round(((x.i + x.c + x.e) / 3) * 10) / 10;
	const rice = (x: Idea) => Math.round(((x.reach * x.impact * (x.conf / 100)) / Math.max(x.effort, 0.05)) * 10) / 10;
	const rank = (f: (x: Idea) => number) => [...ideas.keys()].sort((a, b) => f(ideas[b]) - f(ideas[a]));
	const byIce = $derived(rank(ice));
	const byRice = $derived(rank(rice));
	const moved = $derived(
		ideas
			.map((x, k) => ({ name: x.name, from: byIce.indexOf(k) + 1, to: byRice.indexOf(k) + 1, reach: x.reach, effort: x.effort }))
			.filter((m) => Math.abs(m.from - m.to) >= 2)
	);
	const impacts = [0.25, 0.5, 1, 2, 3];
</script>

<figure class="dg">
	<figcaption>Пять идей, два способа оценки</figcaption>
	<ul class="ideas">
		{#each ideas as x, k (k)}
			<li>
				<label class="name">Идея <input type="text" bind:value={x.name} /></label>
				<div class="g">
					<fieldset>
						<legend>ICE, от 1 до 10</legend>
						<label>Влияние <input type="number" min="1" max="10" bind:value={x.i} /></label>
						<label>Уверенность <input type="number" min="1" max="10" bind:value={x.c} /></label>
						<label>Лёгкость <input type="number" min="1" max="10" bind:value={x.e} /></label>
					</fieldset>
					<fieldset>
						<legend>RICE</legend>
						<label>Охват, чел. в месяц <input type="number" min="0" bind:value={x.reach} /></label>
						<label>Влияние
							<select bind:value={x.impact}>{#each impacts as m (m)}<option value={m}>{m}</option>{/each}</select>
						</label>
						<label>Уверенность, % <input type="number" min="10" max="100" step="10" bind:value={x.conf} /></label>
						<label>Трудозатраты, человеко-месяцев <input type="number" min="0.05" step="0.05" bind:value={x.effort} /></label>
					</fieldset>
				</div>
			</li>
		{/each}
	</ul>

	<div class="rank">
		<div>
			<div class="dh">По ICE</div>
			<ol>
				{#each byIce as k (k)}<li>{ideas[k].name}: <strong>{ice(ideas[k])}</strong></li>{/each}
			</ol>
		</div>
		<div>
			<div class="dh">По RICE</div>
			<ol>
				{#each byRice as k (k)}<li>{ideas[k].name}: <strong>{rice(ideas[k])}</strong></li>{/each}
			</ol>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if moved.length}
			{#each moved as m (m.name)}Идея «{m.name}» была {m.from}-й по ICE, стала {m.to}-й по RICE: RICE учитывает охват ({m.reach} чел.) и трудозатраты ({m.effort} чел.-мес.), а ICE их не видит. {/each}
		{:else}
			Порядок почти не изменился. Подвигайте охват или трудозатраты: так вы увидите, чем RICE отличается от ICE.
		{/if}
	</p>
	<p class="dg-out">Все числа это догадки: уверенность (Confidence) нужна затем, чтобы честно сказать «я не уверен». Оценки помогают спорить о приоритетах, но не заменяют решение.</p>
</figure>

<style>
	.ideas {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-4);
		margin: 0 0 var(--space-4);
	}
	.ideas > li {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-2);
	}
	.name {
		display: grid;
		gap: var(--space-1);
	}
	input,
	select {
		padding: var(--space-1) var(--space-2);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
		max-width: 100%;
	}
	input[type='number'] {
		width: 6rem;
	}
	.g {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
	}
	fieldset {
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
	}
	.rank {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.rank ol {
		margin: 0;
	}
</style>
