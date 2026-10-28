<!--
	«Движение и покой» (part 3, lesson 8). A box that slides and fades when the person presses a
	button, with the duration and the easing curve of the transition under their control and the
	curve drawn from the same four numbers the browser uses. A switch plays the page's "reduce
	motion" case: the sliding goes, and only the soft appearance stays. The CSS for the chosen
	state is printed live. The switch is the diagram's own: it does not read the system setting.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			caption: 'Показать и спрятать плавно',
			duration: 'Длительность',
			seconds: 'с',
			curve: 'Кривая',
			reduce: 'Уменьшить движение',
			hide: 'Спрятать',
			show: 'Показать',
			curveLabel: (c: string) => `Кривая скорости: ${c}`,
			speed: 'скорость',
			time: 'время',
			card: 'Карточка',
			comment: 'только плавное появление, без перемещения',
			reducedOut: 'Без движения остаётся только плавное появление. Именно так просят делать людей, которым перемещения и вращения вредят: появление и исчезновение они переносят нормально.',
			normalOut: 'Анимируйте transform и opacity: браузер делает это на видеокарте, не пересчитывая раскладку. Ширина, высота и отступы заставили бы его перестраивать всю страницу на каждом кадре.'
		},
		en: {
			caption: 'Show and hide smoothly',
			duration: 'Duration',
			seconds: 's',
			curve: 'Easing curve',
			reduce: 'Reduce motion',
			hide: 'Hide',
			show: 'Show',
			curveLabel: (c: string) => `Speed curve: ${c}`,
			speed: 'speed',
			time: 'time',
			card: 'Card',
			comment: 'only a gentle fade, no movement',
			reducedOut: 'Without movement, only the gentle fade is left. That is what people ask for when sliding and spinning harm them: they cope with things fading in and out.',
			normalOut: 'Animate transform and opacity: the browser does that on the graphics card, without recalculating the layout. Width, height and margins would make it rebuild the whole page on every frame.'
		}
	});

	const curves: Record<string, [number, number, number, number]> = {
		ease: [0.25, 0.1, 0.25, 1],
		'ease-out': [0, 0, 0.58, 1],
		'ease-in': [0.42, 0, 1, 1],
		linear: [0, 0, 1, 1]
	};
	let duration = $state(0.4);
	let easing = $state<keyof typeof curves>('ease-out');
	let reduced = $state(false);
	let shown = $state(true);

	const [x1, y1, x2, y2] = $derived(curves[easing]);
	const path = $derived(`M0,100 C${x1 * 100},${100 - y1 * 100} ${x2 * 100},${100 - y2 * 100} 100,0`);
	const style = $derived(
		`transition-property: ${reduced ? 'opacity' : 'transform, opacity'}; transition-duration: ${duration}s; transition-timing-function: ${easing}; opacity: ${shown ? 1 : 0}; transform: ${reduced ? 'none' : shown ? 'translateX(0)' : 'translateX(-4rem)'}`
	);
	const code = $derived(
		`.card {\n  transition-property: ${reduced ? 'opacity' : 'transform, opacity'};\n  transition-duration: ${duration}s;\n  transition-timing-function: ${easing};\n}\n${reduced ? `\n@media (prefers-reduced-motion: reduce) {\n  /* ${W.comment} */\n}` : ''}`
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="grid">
		<div>
			<div class="dg-ctl">
				<label>{W.duration}: <strong>{duration.toFixed(2)} {W.seconds}</strong><input type="range" min="0.1" max="1.5" step="0.05" bind:value={duration} aria-label={W.duration} /></label>
			</div>
			<div class="dg-ctl" role="group" aria-label={W.curve}>
				{#each Object.keys(curves) as c (c)}<button type="button" aria-pressed={easing === c} onclick={() => (easing = c)}>{c}</button>{/each}
			</div>
			<div class="dg-ctl">
				<label><input type="checkbox" bind:checked={reduced} /> {W.reduce}</label>
				<button type="button" onclick={() => (shown = !shown)}>{shown ? W.hide : W.show}</button>
			</div>
		</div>
		<svg viewBox="-8 -8 116 116" role="img" aria-label={W.curveLabel(easing)}>
			<rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" stroke-opacity="0.25" />
			<path d={path} fill="none" stroke="currentColor" stroke-width="3" />
			<text x="2" y="-1" font-size="8">{W.speed}</text>
			<text x="70" y="108" font-size="8">{W.time}</text>
		</svg>
	</div>
	<div class="stage"><div class="box" {style}>{W.card}</div></div>
	<pre class="dg-box dg-mono">{code}</pre>
	<p class="dg-out" aria-live="polite">
		{#if reduced}
			{W.reducedOut}
		{:else}
			{W.normalOut}
		{/if}
	</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-4);
		align-items: center;
	}
	svg {
		max-width: 9rem;
		color: var(--text-secondary);
	}
	svg text {
		fill: currentColor;
	}
	.stage {
		overflow: hidden;
		margin: var(--space-3) 0;
		padding: var(--space-4) var(--space-4) var(--space-4) 5rem;
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
	}
	.box {
		display: inline-block;
		padding: var(--space-3) var(--space-5);
		background: #2f6fa8;
		color: #fff;
		border-radius: 0.5rem;
	}
	pre {
		margin: 0 0 var(--space-3);
		white-space: pre-wrap;
		font-size: 0.82rem;
	}
</style>
