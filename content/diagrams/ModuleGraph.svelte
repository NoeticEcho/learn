<!--
	«Граф модулей и сборка» (part 5, lesson 5). A small project as a graph of files joined by
	import, and a build button: the bundler follows the arrows, then optionally minifies and drops
	what is never imported (tree shaking). The sizes are illustrative, not measured, and the page
	says so: the point is the shape (a big library of which one function is used) and what each
	build step does to it, not the exact numbers.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			note: 'внешний пакет: 40 функций, а форме нужна одна',
			caption: 'Из файлов в бандл',
			useLib: 'подключить пакет dates-lib',
			minify: 'минификация',
			shake: 'tree shaking',
			build: 'Собрать',
			unbuild: 'Вернуть исходники',
			graph: 'Файлы проекта и их импорты',
			kb: 'кБ',
			imports: 'импортирует: ',
			nothing: 'ничего не импортирует',
			sourceHead: (kb: string, n: number) => `Исходники: ${kb} кБ в ${n} файлах.`,
			sourceTail: 'Браузер загружал бы их по одному, каждый со своими импортами.',
			bundleHead: (kb: string) => `Бандл: примерно ${kb} кБ в одном файле.`,
			shaken: 'Из пакета в него попала одна нужная функция, остальные 39 выброшены.',
			minified: 'Пробелы и длинные имена убраны, файл стал короче больше чем вдвое.',
			footnote: 'Цифры условные: они показывают порядок величин, а не измерение. Настоящий размер вам покажет сборщик и вкладка «Сеть».'
		},
		en: {
			note: 'an external package: 40 functions, and the form needs one',
			caption: 'From files to a bundle',
			useLib: 'add the dates-lib package',
			minify: 'minification',
			shake: 'tree shaking',
			build: 'Build',
			unbuild: 'Back to the source',
			graph: 'The project’s files and their imports',
			kb: 'KB',
			imports: 'imports: ',
			nothing: 'imports nothing',
			sourceHead: (kb: string, n: number) => `Source: ${kb} KB in ${n} files.`,
			sourceTail: 'A browser would load them one by one, each with its own imports.',
			bundleHead: (kb: string) => `Bundle: about ${kb} KB in one file.`,
			shaken: 'One needed function from the package made it in. The other 39 were dropped.',
			minified: 'Spaces and long names are gone, and the file is more than half the size.',
			footnote: 'The numbers are illustrative: they show orders of magnitude, not measurements. The real size comes from your bundler and the Network tab.'
		}
	});

	type File = { name: string; kb: number; imports: string[]; note?: string };
	const files: File[] = [
		{ name: 'main.js', kb: 1.2, imports: ['render.js', 'data.js', 'form.js'] },
		{ name: 'render.js', kb: 2.1, imports: ['data.js'] },
		{ name: 'form.js', kb: 1.8, imports: ['dates-lib'] },
		{ name: 'data.js', kb: 1.5, imports: [] },
		{ name: 'dates-lib', kb: 72, imports: [], note: W.note }
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
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={useLib} /> {W.useLib}</label>
		<label><input type="checkbox" bind:checked={minify} disabled={!built} /> {W.minify}</label>
		<label><input type="checkbox" bind:checked={shake} disabled={!built} /> {W.shake}</label>
		<button type="button" onclick={() => (built = !built)} aria-pressed={built}>{built ? W.unbuild : W.build}</button>
	</div>

	<ul class="graph" aria-label={W.graph}>
		{#each live as f (f.name)}
			<li>
				<code class="dg-mono">{f.name}</code>
				<span class="bar"><span class="fill" style="width:{pct(built && f.name === 'dates-lib' && shake ? 3 : f.kb)}%"></span></span>
				<span class="kb">{(built && f.name === 'dates-lib' && shake ? 3 : f.kb).toFixed(1)} {W.kb}</span>
				<span class="imp">{f.imports.filter((i) => useLib || i !== 'dates-lib').length ? W.imports + f.imports.filter((i) => useLib || i !== 'dates-lib').join(', ') : f.note && useLib ? f.note : W.nothing}</span>
			</li>
		{/each}
	</ul>

	<p class="dg-out" aria-live="polite">
		{#if !built}
			<strong>{W.sourceHead(source.toFixed(1), live.length)}</strong> {W.sourceTail}
		{:else}
			<strong>{W.bundleHead(final.toFixed(1))}</strong>
			{#if shake && useLib}{W.shaken}{/if}
			{#if minify}{W.minified}{/if}
		{/if}
	</p>
	<p class="note">{W.footnote}</p>
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
