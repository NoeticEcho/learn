<!--
	«Переменные и слои» (part 3, lesson 7). Two benches. The first one is a small themed card whose
	look comes from custom properties on its root: three sliders and a dark switch change the values,
	and the card, built with var(), changes with them, with the :root block printed live. The second
	is the rule of layers: three rules for one link, each in a layer the person chooses (or in none),
	and the cascade's answer: an unlayered rule beats any layer, a later layer beats an earlier one,
	and only inside a layer does specificity decide.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			vars: 'Переменные: один блок значений, много мест применения',
			hue: 'Оттенок',
			radius: 'Скругление',
			space: 'Отступ',
			dark: 'тёмная тема',
			cardTitle: 'Карточка услуги',
			cardText: 'Цвет, отступ и скругление берутся из переменных через',
			book: 'Записаться',
			out1: 'Чтобы сделать тему тёмной, мы не переписали ни одно правило карточки, а только поменяли значения переменных в одном месте.',
			layers: 'Слои: что сильнее',
			selector: 'Селектор',
			specificity: 'Специфичность',
			layer: 'Слой',
			layerOf: (sel: string) => `Слой правила ${sel}`,
			none: 'вне слоёв',
			earliest: 'base (самый ранний)',
			latest: 'utilities (самый поздний)',
			colours: { red: 'красный', blue: 'синий', green: 'зелёный' } as Record<string, string>,
			linkIs: 'Ссылка будет цвета',
			won: 'победило правило',
			becauseNone: ', потому что оно вне слоёв, а такое правило сильнее любого слоя',
			becauseShared: ', потому что его слой общий со всеми, и решила специфичность',
			becauseLater: ', потому что его слой поздний, и слой побеждает независимо от специфичности',
			declared: 'Порядок слоёв объявлен один раз:'
		},
		en: {
			vars: 'Variables: one block of values, many places that use it',
			hue: 'Hue',
			radius: 'Corner radius',
			space: 'Spacing',
			dark: 'dark theme',
			cardTitle: 'Service card',
			cardText: 'Color, spacing and corner radius all come from variables through',
			book: 'Book a call',
			out1: 'To make the theme dark we didn’t rewrite a single card rule. We only changed the variables’ values, in one place.',
			layers: 'Layers: what wins',
			selector: 'Selector',
			specificity: 'Specificity',
			layer: 'Layer',
			layerOf: (sel: string) => `Layer of the rule ${sel}`,
			none: 'no layer',
			earliest: 'base (earliest)',
			latest: 'utilities (latest)',
			colours: { red: 'red', blue: 'blue', green: 'green' } as Record<string, string>,
			linkIs: 'The link will be',
			won: 'the winner is',
			becauseNone: ', because it is outside every layer, and an unlayered rule beats any layer',
			becauseShared: ', because every rule shares its layer, so specificity decided',
			becauseLater: ', because its layer is later, and a later layer wins whatever the specificity',
			declared: 'The layer order is declared once:'
		}
	});

	let hue = $state(210);
	let radius = $state(8);
	let space = $state(1);
	let dark = $state(false);
	const vars = $derived(
		dark
			? `--color-bg: hsl(${hue} 25% 10%);\n  --color-surface: hsl(${hue} 25% 16%);\n  --color-text: hsl(${hue} 20% 92%);\n  --color-accent: hsl(${hue} 70% 70%);\n  --color-on-accent: hsl(${hue} 40% 10%);`
			: `--color-bg: hsl(${hue} 20% 99%);\n  --color-surface: hsl(${hue} 25% 94%);\n  --color-text: hsl(${hue} 30% 14%);\n  --color-accent: hsl(${hue} 65% 32%);\n  --color-on-accent: hsl(${hue} 20% 99%);`
	);
	const code = $derived(`:root {\n  ${vars}\n  --radius: ${radius}px;\n  --space: ${space}rem;\n}`);

	type L = 'none' | 'base' | 'components' | 'utilities';
	const order: L[] = ['base', 'components', 'utilities'];
	const rules = $state<{ sel: string; spec: number; colour: string; layer: L }[]>([
		{ sel: '#cta', spec: 100, colour: 'red', layer: 'base' },
		{ sel: '.button', spec: 10, colour: 'blue', layer: 'utilities' },
		{ sel: 'a', spec: 1, colour: 'green', layer: 'none' }
	]);
	const hex: Record<string, string> = { red: '#b83226', blue: '#1f5fae', green: '#2a7448' };
	const rank = (l: L) => (l === 'none' ? 99 : order.indexOf(l));
	const win = $derived(rules.reduce((w, r) => (rank(r.layer) > rank(w.layer) || (rank(r.layer) === rank(w.layer) && r.spec > w.spec) ? r : w)));
</script>

<figure class="dg">
	<figcaption>{W.vars}</figcaption>
	<div class="ctl">
		<label>{W.hue}: <strong>{hue}°</strong><input type="range" min="0" max="360" bind:value={hue} aria-label={W.hue} /></label>
		<label>{W.radius}: <strong>{radius}px</strong><input type="range" min="0" max="24" bind:value={radius} aria-label={W.radius} /></label>
		<label>{W.space}: <strong>{space}rem</strong><input type="range" min="0.5" max="2" step="0.25" bind:value={space} aria-label={W.space} /></label>
		<label class="chk"><input type="checkbox" bind:checked={dark} /> {W.dark}</label>
	</div>
	<div class="cols">
		<pre class="dg-box dg-mono">{code}</pre>
		<div class="preview" style="{vars} --radius: {radius}px; --space: {space}rem">
			<div class="card">
				<div class="dh">{W.cardTitle}</div>
				<p>{W.cardText} <code>var()</code>.</p>
				<a href="#top" class="btn" onclick={(e) => e.preventDefault()}>{W.book}</a>
			</div>
		</div>
	</div>
	<p class="dg-out">{W.out1}</p>

	<div class="dh sub">{W.layers}</div>
	<div class="wrap">
		<table>
			<thead><tr><th scope="col">{W.selector}</th><th scope="col">{W.specificity}</th><th scope="col">color</th><th scope="col">{W.layer}</th></tr></thead>
			<tbody>
				{#each rules as r, i (r.sel)}
					<tr class:win={win === r}>
						<th scope="row" class="dg-mono">{r.sel}</th>
						<td class="dg-mono">{r.spec >= 100 ? '(1, 0, 0)' : r.spec >= 10 ? '(0, 1, 0)' : '(0, 0, 1)'}</td>
						<td>{W.colours[r.colour]}</td>
						<td>
							<select aria-label={W.layerOf(r.sel)} bind:value={rules[i].layer}>
								<option value="none">{W.none}</option>
								<option value="base">{W.earliest}</option>
								<option value="components">components</option>
								<option value="utilities">{W.latest}</option>
							</select>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.linkIs} <strong style="color: {hex[win.colour]}">{W.colours[win.colour]}</strong>: {W.won} <span class="dg-mono">{win.sel}</span>{win.layer === 'none' ? W.becauseNone : rules.every((r) => r === win || rank(r.layer) === rank(win.layer)) ? W.becauseShared : W.becauseLater}.
		{W.declared} <span class="dg-mono">@layer base, components, utilities;</span>
	</p>
</figure>

<style>
	.ctl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--space-2) var(--space-4);
		margin-bottom: var(--space-3);
	}
	.ctl label {
		display: grid;
	}
	.ctl label.chk {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-3);
		align-items: start;
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		font-size: 0.8rem;
	}
	.preview {
		padding: 1rem;
		background: var(--color-bg);
		color: var(--color-text);
	}
	.card {
		padding: var(--space);
		background: var(--color-surface);
		border-radius: var(--radius);
	}
	.card .dh,
	.card p {
		margin: 0 0 0.5rem;
		font-family: var(--font-sans);
		color: inherit;
	}
	.btn {
		display: inline-block;
		padding: 0.4rem 0.9rem;
		background: var(--color-accent);
		color: var(--color-on-accent);
		border-radius: var(--radius);
		text-decoration: none;
	}
	.sub {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.wrap {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: var(--text-body-sm);
	}
	th,
	td {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-1) var(--space-2);
		text-align: left;
	}
	thead th {
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	tr.win th,
	tr.win td {
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	select {
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
</style>
