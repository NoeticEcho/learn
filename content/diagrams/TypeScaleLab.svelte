<!--
	«Лаборатория шкалы» (part 4, lesson 4). A base size and a ratio produce a ladder of sizes; the
	person sees the ladder as real headings with their own project's words, reads the CSS
	variables it would become, and then tries fluid type: a size that glides between a phone and a
	wide screen, written as clamp().
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let title = $state('Ваш проект');
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			title = (await learner.persona()).title;
		} catch {
			/* the example words stay */
		}
	});

	const ratios = [
		{ v: 1.125, name: '1.125 · большая секунда' },
		{ v: 1.2, name: '1.2 · малая терция' },
		{ v: 1.25, name: '1.25 · большая терция' },
		{ v: 1.333, name: '1.333 · кварта' },
		{ v: 1.5, name: '1.5 · квинта' },
		{ v: 1.618, name: '1.618 · золотое сечение' }
	];
	let ratio = $state(1.25);
	let base = $state(16);

	const names = ['sm', 'base', 'lg', 'xl', '2xl', '3xl'];
	const exps = [-1, 0, 1, 2, 3, 4];
	const rows = $derived(exps.map((e, i) => ({ name: names[i], px: base * Math.pow(ratio, e) })));
	const rem = (px: number) => (px / 16).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
	const css = $derived(`:root {\n  --ratio: ${ratio};\n${rows.map((r) => `  --fs-${r.name}: ${rem(r.px)}rem;`).join('\n')}\n}`);

	// fluid part
	let minVp = $state(360);
	let maxVp = $state(1280);
	let minPx = $state(32);
	let maxPx = $state(56);
	let vp = $state(800);

	const slope = $derived((maxPx - minPx) / (maxVp - minVp));
	const intercept = $derived(minPx - slope * minVp);
	const fluid = $derived(Math.min(maxPx, Math.max(minPx, intercept + slope * vp)));
	const clampCss = $derived(`font-size: clamp(${rem(minPx)}rem, ${rem(intercept)}rem + ${(slope * 100).toFixed(2)}vw, ${rem(maxPx)}rem);`);
</script>

<figure class="dg">
	<figcaption>Шкала размеров: база, коэффициент и лестница</figcaption>
	<div class="dg-ctl" role="group" aria-label="Коэффициент шкалы">
		{#each ratios as r (r.v)}
			<button type="button" aria-pressed={ratio === r.v} onclick={() => (ratio = r.v)}>{r.name}</button>
		{/each}
	</div>
	<label class="dg-ctl">
		Базовый размер: {base} px
		<input type="range" min="14" max="20" step="1" bind:value={base} />
	</label>

	<ol class="ladder" aria-label="Ступени шкалы">
		{#each [...rows].reverse() as r (r.name)}
			<li>
				<span class="meta">--fs-{r.name} · {r.px.toFixed(1)} px</span>
				<span class="sample" style="font-size:{Math.min(r.px, 56)}px;line-height:{r.px > 28 ? 1.1 : 1.4}">{r.name === 'base' || r.name === 'sm' ? 'Обычный текст страницы про ваше дело' : title}</span>
			</li>
		{/each}
	</ol>
	<pre class="dg-box dg-mono" aria-label="Переменные CSS для этой шкалы">{css}</pre>
	<p class="dg-out">
		Чем больше коэффициент, тем резче скачки между уровнями: <strong>1.125–1.2</strong> спокойны и подходят текстам и документации,
		<strong>1.25–1.333</strong> универсальны, <strong>1.5 и выше</strong> дают эффектные заголовки, но мелкие ступени растут слишком быстро.
	</p>

	<h4>Текучий размер: clamp()</h4>
	<p class="dg-out">Размер заголовка плавно растёт от телефона к широкому экрану, не выходя за пределы. Меняйте границы и «ширину экрана».</p>
	<div class="grid2">
		<label>Наименьший: {minPx} px <input type="range" min="20" max="48" step="2" bind:value={minPx} /></label>
		<label>Наибольший: {maxPx} px <input type="range" min="40" max="80" step="2" bind:value={maxPx} /></label>
		<label>Ширина экрана: {vp} px <input type="range" min={minVp} max={maxVp} step="20" bind:value={vp} /></label>
	</div>
	<p class="fluid" style="font-size:{fluid}px;line-height:1.1" aria-live="off">{title}</p>
	<p class="dg-out" aria-live="polite">На ширине {vp} px заголовок {fluid.toFixed(1)} px.</p>
	<pre class="dg-box dg-mono">{clampCss}</pre>
</figure>

<style>
	h4 {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.ladder {
		list-style: none;
		margin: var(--space-4) 0 !important;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.ladder li {
		display: grid;
		gap: 2px;
		padding-bottom: var(--space-2);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	.meta {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-secondary);
	}
	.sample {
		color: var(--text-primary);
		font-family: var(--font-serif);
		overflow-wrap: anywhere;
	}
	.grid2 {
		display: grid;
		gap: var(--space-2);
	}
	.fluid {
		margin: var(--space-3) 0;
		font-family: var(--font-serif);
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}
	pre {
		margin: var(--space-3) 0;
		white-space: pre-wrap;
	}
</style>
