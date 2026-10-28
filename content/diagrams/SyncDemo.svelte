<!--
	«Где растёт сложность» (part 5, lesson 6). One number (how many items there are) is shown in
	several places on a page. In the manual column each place has to be updated by a line of code
	written for it, and the person can "forget" one; in the reactive column each place is just
	the value, so none can be stale. The state is real (a Svelte rune) and the manual column
	really runs its update list, so the stale chip is a result and not a drawing.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			names: ['список', 'счётчик', 'значок в меню', 'быстрый переход', 'заголовок', 'подвал', 'вкладка', 'подсказка'],
			caption: 'Одно число, много мест',
			places: 'Сколько мест показывают число пунктов:',
			forget: 'программист забыл обновить последнее место',
			add: 'Добавить пункт',
			reset: 'Сначала',
			manualLabel: 'Ручной код',
			manual: (n: number) => `Вручную: строк обновления ${n}`,
			forgot: '   // забыли',
			reactiveLabel: 'Реактивный код',
			reactive: 'Реактивно: объявлено одно значение',
			stale: (n: number) => `Устарело мест: ${n}. Страница противоречит сама себе.`,
			fine: 'Все места совпадают, пока ничего не забыто.',
			nothing: 'Забыть нечего: каждое место выведено из одного значения и обновляется вместе с ним.'
		},
		en: {
			names: ['list', 'counter', 'menuBadge', 'quickNav', 'heading', 'footer', 'tab', 'tooltip'],
			caption: 'One number, many places',
			places: 'How many places show the number of items:',
			forget: 'the programmer forgot to update the last place',
			add: 'Add an item',
			reset: 'Start over',
			manualLabel: 'Manual code',
			manual: (n: number) => `By hand: ${n} update ${n === 1 ? 'line' : 'lines'}`,
			forgot: '   // forgot this one',
			reactiveLabel: 'Reactive code',
			reactive: 'Reactive: one value declared',
			stale: (n: number) => `Stale places: ${n}. The page contradicts itself.`,
			fine: 'Every place agrees, as long as nothing is forgotten.',
			nothing: 'Nothing to forget: every place is derived from one value and updates with it.'
		}
	});

	let places = $state(4);
	let forget = $state(false);
	let items = $state(3);

	// the manual column: every place has its own copy of the number, refreshed by hand
	let copies = $state<number[]>(Array.from({ length: 8 }, () => 3));
	const addManual = () => {
		items += 1;
		const n = forget ? places - 1 : places;
		for (let i = 0; i < n; i++) copies[i] = items;
	};
	const reset = () => {
		items = 3;
		copies = Array.from({ length: 8 }, () => 3);
	};
	const names = W.names;
	const stale = $derived(copies.slice(0, places).filter((c) => c !== items).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.places} {places}
			<input type="range" min="1" max="8" bind:value={places} />
		</label>
		<label><input type="checkbox" bind:checked={forget} /> {W.forget}</label>
		<button type="button" onclick={addManual}>{W.add}</button>
		<button type="button" onclick={reset}>{W.reset}</button>
	</div>

	<div class="two">
		<section aria-label={W.manualLabel}>
			<div class="dh">{W.manual(places)}</div>
			<pre class="dg-box dg-mono">{#each Array.from({ length: places }, (_, i) => i) as i (i)}{names[i]}.textContent = items.length;{forget && i === places - 1 ? W.forgot : ''}
{/each}</pre>
			<div class="chips" aria-live="polite">
				{#each copies.slice(0, places) as c, i (i)}
					<span class="chip" class:stale={c !== items}>{names[i]}: {c}</span>
				{/each}
			</div>
			<p class="verdict" class:bad={stale > 0}>{stale > 0 ? W.stale(stale) : W.fine}</p>
		</section>
		<section aria-label={W.reactiveLabel}>
			<div class="dh">{W.reactive}</div>
			<pre class="dg-box dg-mono">let items = $state(3);
{#each Array.from({ length: places }, (_, i) => i) as i (i)}{names[i]}: {'{items}'}
{/each}</pre>
			<div class="chips" aria-live="polite">
				{#each Array.from({ length: places }, (_, i) => i) as i (i)}
					<span class="chip">{names[i]}: {items}</span>
				{/each}
			</div>
			<p class="verdict">{W.nothing}</p>
		</section>
	</div>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0 0 var(--space-3);
		white-space: pre-wrap;
		font-size: 0.8rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.chip {
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		font-size: var(--text-body-sm);
	}
	.chip.stale {
		border-color: var(--brass-300);
		color: var(--brass-300);
		text-decoration: line-through;
	}
	.verdict {
		margin: var(--space-3) 0 0;
		color: var(--text-secondary);
	}
	.verdict.bad {
		color: var(--brass-300);
	}
</style>
