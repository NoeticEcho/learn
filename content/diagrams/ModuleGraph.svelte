<!--
	«Граф модулей и сборка» (part 5, lesson 5). A small project as a graph of files joined by
	import, and a build button: the bundler follows the arrows, then optionally minifies and drops
	what is never imported (tree shaking). The sizes are illustrative, not measured, and the page
	says so: the point is the shape (a big library of which one function is used) and what each
	build step does to it, not the exact numbers.
-->
<script lang="ts">
	import './shared.css';

	type File = { name: string; kb: number; imports: string[]; note?: string };
	const files: File[] = [
		{ name: 'main.js', kb: 1.2, imports: ['render.js', 'data.js', 'form.js'] },
		{ name: 'render.js', kb: 2.1, imports: ['data.js'] },
		{ name: 'form.js', kb: 1.8, imports: ['dates-lib'] },
		{ name: 'data.js', kb: 1.5, imports: [] },
		{ name: 'dates-lib', kb: 72, imports: [], note: 'внешний пакет: 40 функций, а форме нужна одна' }
	];
	let built = $state(false);
	let minify = $state(true);
	let shake = $state(true);
	let useLib = $state(true);

	const live = $derived(files.filter((f) => useLib || f.name !== 'dates-lib'));
	const source = $derived(live.reduce((s, f) => s + f.kb, 0));
	const afterShake = $derived(live.reduce((s, f) => s + (f.name === 'dates-lib' && shake ? 3 : f.kb), 0));
	const final = $derived(afterShake * (minify ? 0.45 : 1));
	const pct = (kb: number) => Math.max(2, Math.round((kb / 85) * 100));
</script>

<figure class="dg">
	<figcaption>Из файлов в бандл</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={useLib} /> подключить пакет dates-lib</label>
		<label><input type="checkbox" bind:checked={minify} disabled={!built} /> минификация</label>
		<label><input type="checkbox" bind:checked={shake} disabled={!built} /> tree shaking</label>
		<button type="button" onclick={() => (built = !built)} aria-pressed={built}>{built ? 'Вернуть исходники' : 'Собрать'}</button>
	</div>

	<ul class="graph" aria-label="Файлы проекта и их импорты">
		{#each live as f (f.name)}
			<li>
				<code class="dg-mono">{f.name}</code>
				<span class="bar"><span class="fill" style="width:{pct(built && f.name === 'dates-lib' && shake ? 3 : f.kb)}%"></span></span>
				<span class="kb">{(built && f.name === 'dates-lib' && shake ? 3 : f.kb).toFixed(1)} кБ</span>
				<span class="imp">{f.imports.filter((i) => useLib || i !== 'dates-lib').length ? 'импортирует: ' + f.imports.filter((i) => useLib || i !== 'dates-lib').join(', ') : f.note && useLib ? f.note : 'ничего не импортирует'}</span>
			</li>
		{/each}
	</ul>

	<p class="dg-out" aria-live="polite">
		{#if !built}
			<strong>Исходники: {source.toFixed(1)} кБ в {live.length} файлах.</strong> Браузер загружал бы их по одному, каждый со своими импортами.
		{:else}
			<strong>Бандл: примерно {final.toFixed(1)} кБ в одном файле.</strong>
			{#if shake && useLib}Из пакета в него попала одна нужная функция, остальные 39 выброшены.{/if}
			{#if minify}Пробелы и длинные имена убраны, файл стал короче больше чем вдвое.{/if}
		{/if}
	</p>
	<p class="note">Цифры условные: они показывают порядок величин, а не измерение. Настоящий размер вам покажет сборщик и вкладка «Сеть».</p>
</figure>

<style>
	.graph {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 7rem minmax(5rem, 1fr) 4.5rem;
		gap: var(--space-2) var(--space-3);
		align-items: center;
	}
	.bar {
		height: 0.75rem;
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.kb {
		text-align: right;
		font-family: var(--font-mono);
		font-size: var(--text-body-sm);
	}
	.imp {
		grid-column: 1 / -1;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.note {
		margin: var(--space-3) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
</style>
