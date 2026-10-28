<!--
	«Лаборатория шкалы» (part 4, lesson 4). A base size and a ratio produce a ladder of sizes; the
	person sees the ladder as real headings with their own project's words, reads the CSS
	variables it would become, and then tries fluid type: a size that glides between a phone and a
	wide screen, written as clamp().
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			fallback: 'Ваш проект',
			ratios: ['большая секунда', 'малая терция', 'большая терция', 'кварта', 'квинта', 'золотое сечение'],
			caption: 'Шкала размеров: база, коэффициент и лестница',
			ratioGroup: 'Коэффициент шкалы',
			baseSize: 'Базовый размер',
			steps: 'Ступени шкалы',
			body: 'Обычный текст страницы про ваше дело',
			cssLabel: 'Переменные CSS для этой шкалы',
			note: ['Чем больше коэффициент, тем резче скачки между уровнями: ', ' спокойны и подходят текстам и документации, ', ' универсальны, ', ' дают эффектные заголовки, но мелкие ступени растут слишком быстро.'],
			notes: ['1.125–1.2', '1.25–1.333', '1.5 и выше'],
			fluid: 'Текучий размер: clamp()',
			fluidNote: 'Размер заголовка плавно растёт от телефона к широкому экрану, не выходя за пределы. Меняйте границы и «ширину экрана».',
			smallest: 'Наименьший',
			largest: 'Наибольший',
			width: 'Ширина экрана',
			result: (vp: number, px: string) => `На ширине ${vp} px заголовок ${px} px.`
		},
		en: {
			fallback: 'Your project',
			ratios: ['major second', 'minor third', 'major third', 'perfect fourth', 'perfect fifth', 'golden ratio'],
			caption: 'The size scale: a base, a ratio and a ladder',
			ratioGroup: 'The ratio of the scale',
			baseSize: 'Base size',
			steps: 'The steps of the scale',
			body: 'Ordinary text of a page about your work',
			cssLabel: 'CSS variables for this scale',
			note: ['The bigger the ratio, the sharper the jumps between levels: ', ' are calm and suit text and documentation, ', ' are all-round, ', ' give striking headings, but the small steps grow too fast.'],
			notes: ['1.125 to 1.2', '1.25 to 1.333', '1.5 and above'],
			fluid: 'Fluid size: clamp()',
			fluidNote: 'The heading’s size grows smoothly from a phone to a wide screen without leaving its limits. Change the limits and the “screen width”.',
			smallest: 'Smallest',
			largest: 'Largest',
			width: 'Screen width',
			result: (vp: number, px: string) => `At a width of ${vp} px the heading is ${px} px.`
		}
	});
	let title = $state(W.fallback);
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			title = (await learner.persona()).title;
		} catch {
			/* the example words stay */
		}
	});

	const ratios = [
		{ v: 1.125, name: `1.125 · ${W.ratios[0]}` },
		{ v: 1.2, name: `1.2 · ${W.ratios[1]}` },
		{ v: 1.25, name: `1.25 · ${W.ratios[2]}` },
		{ v: 1.333, name: `1.333 · ${W.ratios[3]}` },
		{ v: 1.5, name: `1.5 · ${W.ratios[4]}` },
		{ v: 1.618, name: `1.618 · ${W.ratios[5]}` }
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
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.ratioGroup}>
		{#each ratios as r (r.v)}
			<button type="button" aria-pressed={ratio === r.v} onclick={() => (ratio = r.v)}>{r.name}</button>
		{/each}
	</div>
	<label class="dg-ctl">
		{W.baseSize}: {base} px
		<input type="range" min="14" max="20" step="1" bind:value={base} />
	</label>

	<ol class="ladder" aria-label={W.steps}>
		{#each [...rows].reverse() as r (r.name)}
			<li>
				<span class="meta">--fs-{r.name} · {r.px.toFixed(1)} px</span>
				<span class="sample" style="font-size:{Math.min(r.px, 56)}px;line-height:{r.px > 28 ? 1.1 : 1.4}">{r.name === 'base' || r.name === 'sm' ? W.body : title}</span>
			</li>
		{/each}
	</ol>
	<pre class="dg-box dg-mono" aria-label={W.cssLabel}>{css}</pre>
	<p class="dg-out">
		{W.note[0]}<strong>{W.notes[0]}</strong>{W.note[1]}<strong>{W.notes[1]}</strong>{W.note[2]}<strong>{W.notes[2]}</strong>{W.note[3]}
	</p>

	<div class="dh">{W.fluid}</div>
	<p class="dg-out">{W.fluidNote}</p>
	<div class="grid2">
		<label>{W.smallest}: {minPx} px <input type="range" min="20" max="48" step="2" bind:value={minPx} /></label>
		<label>{W.largest}: {maxPx} px <input type="range" min="40" max="80" step="2" bind:value={maxPx} /></label>
		<label>{W.width}: {vp} px <input type="range" min={minVp} max={maxVp} step="20" bind:value={vp} /></label>
	</div>
	<p class="fluid" style="font-size:{fluid}px;line-height:1.1" aria-live="off">{title}</p>
	<p class="dg-out" aria-live="polite">{W.result(vp, fluid.toFixed(1))}</p>
	<pre class="dg-box dg-mono">{clampCss}</pre>
</figure>

<style>
	.dh {
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
