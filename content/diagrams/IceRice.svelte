<!--
	«ICE и RICE» (part 11, lesson 9). Five growth ideas of a made-up bicycle workshop, each scored
	twice: ICE (impact, confidence, ease; 1–10 each) and RICE (reach, impact, confidence, effort).
	The two rankings sit side by side and the page says why an idea moved. The names and numbers
	are editable. It is a lever for a conversation, not a verdict: the numbers are guesses, and the
	page says so.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Idea = { name: string; i: number; c: number; e: number; reach: number; impact: number; conf: number; effort: number };
	const W = pick({
		ru: {
			ideas: [
				{ name: 'Страница с ценами и сроками', i: 8, c: 8, e: 7, reach: 400, impact: 2, conf: 80, effort: 0.5 },
				{ name: 'Запись на ремонт в мессенджере', i: 7, c: 6, e: 5, reach: 250, impact: 1, conf: 80, effort: 1 },
				{ name: 'Статья «Как проверить тормоза самому»', i: 5, c: 5, e: 6, reach: 600, impact: 0.5, conf: 50, effort: 1 },
				{ name: 'Рекламная кампания в соцсети', i: 6, c: 4, e: 4, reach: 1500, impact: 1, conf: 50, effort: 2 },
				{ name: 'Письмо клиентам после ремонта с просьбой об отзыве', i: 6, c: 7, e: 9, reach: 80, impact: 1, conf: 80, effort: 0.25 }
			] as Idea[],
			caption: 'Пять идей, два способа оценки',
			idea: 'Идея',
			iceLegend: 'ICE, от 1 до 10',
			impact: 'Влияние',
			conf: 'Уверенность',
			ease: 'Лёгкость',
			reach: 'Охват, чел. в месяц',
			confPct: 'Уверенность, %',
			effort: 'Трудозатраты, человеко-месяцев',
			byIce: 'По ICE',
			byRice: 'По RICE',
			moved: (name: string, from: number, to: number, reach: number, effort: number) => `Идея «${name}» была ${from}-й по ICE, стала ${to}-й по RICE: RICE учитывает охват (${reach} чел.) и трудозатраты (${effort} чел.-мес.), а ICE их не видит. `,
			same: 'Порядок почти не изменился. Подвигайте охват или трудозатраты: так вы увидите, чем RICE отличается от ICE.',
			note: 'Все числа это догадки: уверенность (Confidence) нужна затем, чтобы честно сказать «я не уверен». Оценки помогают спорить о приоритетах, но не заменяют решение.'
		},
		en: {
			ideas: [
				{ name: 'A page with prices and timing', i: 8, c: 8, e: 7, reach: 400, impact: 2, conf: 80, effort: 0.5 },
				{ name: 'Booking a repair through a messenger', i: 7, c: 6, e: 5, reach: 250, impact: 1, conf: 80, effort: 1 },
				{ name: 'An article, “How to check your own brakes”', i: 5, c: 5, e: 6, reach: 600, impact: 0.5, conf: 50, effort: 1 },
				{ name: 'An ad campaign on social media', i: 6, c: 4, e: 4, reach: 1500, impact: 1, conf: 50, effort: 2 },
				{ name: 'An email to customers after a repair, asking for a review', i: 6, c: 7, e: 9, reach: 80, impact: 1, conf: 80, effort: 0.25 }
			] as Idea[],
			caption: 'Five ideas, two ways of scoring',
			idea: 'Idea',
			iceLegend: 'ICE, from 1 to 10',
			impact: 'Impact',
			conf: 'Confidence',
			ease: 'Ease',
			reach: 'Reach, people a month',
			confPct: 'Confidence, %',
			effort: 'Effort, person-months',
			byIce: 'By ICE',
			byRice: 'By RICE',
			moved: (name: string, from: number, to: number, reach: number, effort: number) => `The idea “${name}” was number ${from} by ICE and became number ${to} by RICE: RICE counts the reach (${reach} people) and the effort (${effort} person-months), and ICE doesn’t see them. `,
			same: 'The order has hardly changed. Move the reach or the effort: that way you’ll see how RICE differs from ICE.',
			note: 'All the numbers are guesses: Confidence is there so that you can honestly say “I’m not sure”. Scores help you argue about priorities, but they do not replace the decision.'
		}
	});
	let ideas = $state<Idea[]>(W.ideas.map((x) => ({ ...x })));
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
	<figcaption>{W.caption}</figcaption>
	<ul class="ideas">
		{#each ideas as x, k (k)}
			<li>
				<label class="name">{W.idea} <input type="text" bind:value={x.name} /></label>
				<div class="g">
					<fieldset>
						<legend>{W.iceLegend}</legend>
						<label>{W.impact} <input type="number" min="1" max="10" bind:value={x.i} /></label>
						<label>{W.conf} <input type="number" min="1" max="10" bind:value={x.c} /></label>
						<label>{W.ease} <input type="number" min="1" max="10" bind:value={x.e} /></label>
					</fieldset>
					<fieldset>
						<legend>RICE</legend>
						<label>{W.reach} <input type="number" min="0" bind:value={x.reach} /></label>
						<label>{W.impact}
							<select bind:value={x.impact}>{#each impacts as m (m)}<option value={m}>{m}</option>{/each}</select>
						</label>
						<label>{W.confPct} <input type="number" min="10" max="100" step="10" bind:value={x.conf} /></label>
						<label>{W.effort} <input type="number" min="0.05" step="0.05" bind:value={x.effort} /></label>
					</fieldset>
				</div>
			</li>
		{/each}
	</ul>

	<div class="rank">
		<div>
			<div class="dh">{W.byIce}</div>
			<ol>
				{#each byIce as k (k)}<li>{ideas[k].name}: <strong>{ice(ideas[k])}</strong></li>{/each}
			</ol>
		</div>
		<div>
			<div class="dh">{W.byRice}</div>
			<ol>
				{#each byRice as k (k)}<li>{ideas[k].name}: <strong>{rice(ideas[k])}</strong></li>{/each}
			</ol>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if moved.length}
			{#each moved as m (m.name)}{W.moved(m.name, m.from, m.to, m.reach, m.effort)}{/each}
		{:else}
			{W.same}
		{/if}
	</p>
	<p class="dg-out">{W.note}</p>
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
