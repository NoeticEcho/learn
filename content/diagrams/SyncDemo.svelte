<!--
	«Где растёт сложность» (part 5, lesson 6). One number (how many items there are) is shown in
	several places on a page. In the manual column each place has to be updated by a line of code
	written for it, and the person can "forget" one; in the reactive column each place is just
	the value, so none can be stale. The state is real (a Svelte rune) and the manual column
	really runs its update list, so the stale chip is a result and not a drawing.
-->
<script lang="ts">
	import './shared.css';

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
	const names = ['список', 'счётчик', 'значок в меню', 'быстрый переход', 'заголовок', 'подвал', 'вкладка', 'подсказка'];
	const stale = $derived(copies.slice(0, places).filter((c) => c !== items).length);
</script>

<figure class="dg">
	<figcaption>Одно число, много мест</figcaption>
	<div class="dg-ctl">
		<label>Сколько мест показывают число пунктов: {places}
			<input type="range" min="1" max="8" bind:value={places} />
		</label>
		<label><input type="checkbox" bind:checked={forget} /> программист забыл обновить последнее место</label>
		<button type="button" onclick={addManual}>Добавить пункт</button>
		<button type="button" onclick={reset}>Сначала</button>
	</div>

	<div class="two">
		<section aria-label="Ручной код">
			<h4>Вручную: строк обновления {places}</h4>
			<pre class="dg-box dg-mono">{#each Array.from({ length: places }, (_, i) => i) as i (i)}{names[i]}.textContent = items.length;{forget && i === places - 1 ? '   // забыли' : ''}
{/each}</pre>
			<div class="chips" aria-live="polite">
				{#each copies.slice(0, places) as c, i (i)}
					<span class="chip" class:stale={c !== items}>{names[i]}: {c}</span>
				{/each}
			</div>
			<p class="verdict" class:bad={stale > 0}>{stale > 0 ? `Устарело мест: ${stale}. Страница противоречит сама себе.` : 'Все места совпадают, пока ничего не забыто.'}</p>
		</section>
		<section aria-label="Реактивный код">
			<h4>Реактивно: объявлено одно значение</h4>
			<pre class="dg-box dg-mono">let items = $state(3);
{#each Array.from({ length: places }, (_, i) => i) as i (i)}{names[i]}: {'{items}'}
{/each}</pre>
			<div class="chips" aria-live="polite">
				{#each Array.from({ length: places }, (_, i) => i) as i (i)}
					<span class="chip">{names[i]}: {items}</span>
				{/each}
			</div>
			<p class="verdict">Забыть нечего: каждое место выведено из одного значения и обновляется вместе с ним.</p>
		</section>
	</div>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: var(--space-4);
	}
	h4 {
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
