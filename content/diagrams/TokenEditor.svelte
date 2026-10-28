<!--
	«Редактор токенов» (part 4, lesson 11). Three layers of design tokens in the shape the W3C
	Design Tokens Community Group describes (a $value and a $type, and references in curly braces).
	Change a base value or the theme and watch the alias chain carry the change to every semantic
	and component token and into the preview. The JSON on the left is generated from the state, so
	what you read is what the tool would write.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			caption: 'Три слоя токенов: изменение внизу доходит до самого верха',
			base: 'Базовый цвет акцента (color.accent.600):',
			which: 'Какую ступень акцента берёт semantic.action',
			refersTo: 'semantic.action ссылается на:',
			theme: 'Тема',
			light: 'Светлая тема',
			dark: 'Тёмная тема: меняется только слой semantic',
			file: 'Файл токенов в формате DTCG',
			card: 'Карточка проекта',
			action: 'Главное действие',
			chain: 'Цепочка ссылок и итоговое значение'
		},
		en: {
			caption: 'Three layers of tokens: a change at the bottom reaches the very top',
			base: 'Base accent color (color.accent.600):',
			which: 'Which accent step semantic.action takes',
			refersTo: 'semantic.action refers to:',
			theme: 'Theme',
			light: 'Light theme',
			dark: 'Dark theme: only the semantic layer changes',
			file: 'A tokens file in the DTCG format',
			card: 'A project card',
			action: 'Main action',
			chain: 'The chain of references and the final value'
		}
	});

	let accent = $state('#0b5cad');
	let pickStep = $state<'500' | '600' | '700'>('600');
	let dark = $state(false);

	const hexToRgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
	const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
	const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v * (1 - t) + b[i] * t);

	const base = $derived.by(() => {
		const rgb = hexToRgb(accent);
		return {
			'color.accent.500': toHex(mix(rgb, [255, 255, 255], 0.2)),
			'color.accent.600': accent,
			'color.accent.700': toHex(mix(rgb, [0, 0, 0], 0.25)),
			'color.neutral.50': '#faf9f7',
			'color.neutral.900': '#1c1b19'
		} as Record<string, string>;
	});

	const semantic = $derived({
		'semantic.action': { ref: `color.accent.${pickStep}`, val: base[`color.accent.${pickStep}`] },
		'semantic.surface': { ref: dark ? 'color.neutral.900' : 'color.neutral.50', val: dark ? base['color.neutral.900'] : base['color.neutral.50'] },
		'semantic.text': { ref: dark ? 'color.neutral.50' : 'color.neutral.900', val: dark ? base['color.neutral.50'] : base['color.neutral.900'] }
	}) as Record<string, { ref: string; val: string }>;

	const component = $derived({
		'component.button.bg': { ref: 'semantic.action', val: semantic['semantic.action'].val },
		'component.button.fg': { ref: 'semantic.surface', val: semantic['semantic.surface'].val }
	}) as Record<string, { ref: string; val: string }>;

	const json = $derived(
		JSON.stringify(
			{
				color: {
					$type: 'color',
					accent: { '500': { $value: base['color.accent.500'] }, '600': { $value: base['color.accent.600'] }, '700': { $value: base['color.accent.700'] } },
					neutral: { '50': { $value: base['color.neutral.50'] }, '900': { $value: base['color.neutral.900'] } }
				},
				semantic: {
					$type: 'color',
					action: { $value: `{${semantic['semantic.action'].ref}}` },
					surface: { $value: `{${semantic['semantic.surface'].ref}}` },
					text: { $value: `{${semantic['semantic.text'].ref}}` }
				},
				component: {
					button: { bg: { $type: 'color', $value: '{semantic.action}' }, fg: { $type: 'color', $value: '{semantic.surface}' } }
				}
			},
			null,
			2
		)
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="ctl">
		<label>{W.base} <input type="color" bind:value={accent} /> <code class="dg-mono">{accent}</code></label>
		<div class="dg-ctl" role="group" aria-label={W.which} style="margin:0">
			<span>{W.refersTo}</span>
			{#each ['500', '600', '700'] as s (s)}
				<button type="button" aria-pressed={pickStep === s} onclick={() => (pickStep = s as '500' | '600' | '700')}>color.accent.{s}</button>
			{/each}
		</div>
		<div class="dg-ctl" role="group" aria-label={W.theme} style="margin:0">
			<button type="button" aria-pressed={!dark} onclick={() => (dark = false)}>{W.light}</button>
			<button type="button" aria-pressed={dark} onclick={() => (dark = true)}>{W.dark}</button>
		</div>
	</div>

	<div class="cols">
		<pre class="dg-box dg-mono json" tabindex="0" role="region" aria-label={W.file}>{json}</pre>
		<div>
			<div class="preview" style="background:{semantic['semantic.surface'].val};color:{semantic['semantic.text'].val}">
				<p style="margin:0 0 .6rem;font-weight:600">{W.card}</p>
				<span class="btn" style="background:{component['component.button.bg'].val};color:{component['component.button.fg'].val}">{W.action}</span>
			</div>
			<table class="tbl">
				<caption class="dg-out" style="text-align:left;margin:var(--space-3) 0 var(--space-2)">{W.chain}</caption>
				<tbody>
					{#each Object.entries(component) as [k, v] (k)}
						<tr><td class="dg-mono">{k}</td><td class="dg-mono">→ {'{'}{v.ref}{'}'}</td><td class="dg-mono">{v.val}</td></tr>
					{/each}
					{#each Object.entries(semantic) as [k, v] (k)}
						<tr><td class="dg-mono">{k}</td><td class="dg-mono">→ {'{'}{v.ref}{'}'}</td><td class="dg-mono">{v.val}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</figure>

<style>
	.ctl {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	.json {
		margin: 0;
		overflow: auto;
		font-size: 0.78rem;
		white-space: pre;
		max-height: 24rem;
	}
	.preview {
		padding: var(--space-4);
		border: var(--line) solid var(--border-hairline);
	}
	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.78rem;
	}
	.tbl td {
		padding: 4px var(--space-2);
		border-bottom: var(--line) solid var(--border-hairline);
	}
</style>
