<!--
	«Макет и код рядом» (part 4, lesson 14). A small card, drawn the way a designer's tool shows it.
	Click a part: the inspector lists what a designer set (auto layout, padding, gap, a variable)
	and the CSS that says the same thing. A second table compares the vocabulary of a design
	tool with the vocabulary of CSS, which is what makes handoff possible.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The CSS next to each part is the same in both.
	const W = pick({
		ru: {
			fallback: { title: 'Ваш проект', action: 'Главное действие' },
			figma: {
				card: ['Auto layout: вертикально', 'Отступы: space/4 (16)', 'Промежуток: space/2 (8)', 'Ширина: заполнить контейнер', 'Скругление: radius/md', 'Заливка: surface/raised'],
				title: ['Текстовый стиль: heading/md', 'Цвет: text/primary', 'Ширина: по содержимому (hug)'],
				button: ['Компонент: Button, вариант primary', 'Auto layout: горизонтально, по центру', 'Отступы: 0 / space/4, высота 44', 'Заливка: action/default', 'Текст: label/md, on-action']
			} as Record<string, string[]>,
			vocab: [
				['Frame (кадр)', 'элемент блока: div, section'],
				['Auto layout', 'display: flex (направление, gap, padding, выравнивание)'],
				['Hug / Fill / Fixed', 'ширина по содержимому / flex: 1 или 100 % / число'],
				['Component и variant', 'компонент: класс и модификатор (btn, btn--secondary)'],
				['Variables (переменные), modes', 'CSS-переменные; режимы это темы ([data-theme])'],
				['Constraints', 'позиционирование и поведение при изменении ширины'],
				['Dev Mode', 'режим, где разработчику видны размеры, токены и код']
			],
			caption: 'Нажмите на деталь макета и посмотрите, что видит разработчик',
			mock: 'Макет карточки',
			layer: 'Слой:',
			inDesign: 'В макете',
			inCode: 'В коде',
			vocabCaption: 'Словарь: инструмент дизайна и CSS',
			head: ['В макете', 'В коде']
		},
		en: {
			fallback: { title: 'Your project', action: 'Main action' },
			figma: {
				card: ['Auto layout: vertical', 'Padding: space/4 (16)', 'Gap: space/2 (8)', 'Width: fill container', 'Corner radius: radius/md', 'Fill: surface/raised'],
				title: ['Text style: heading/md', 'Color: text/primary', 'Width: hug contents'],
				button: ['Component: Button, variant primary', 'Auto layout: horizontal, centered', 'Padding: 0 / space/4, height 44', 'Fill: action/default', 'Text: label/md, on-action']
			} as Record<string, string[]>,
			vocab: [
				['Frame', 'a block element: div, section'],
				['Auto layout', 'display: flex (direction, gap, padding, alignment)'],
				['Hug / Fill / Fixed', 'width by content / flex: 1 or 100% / a number'],
				['Component and variant', 'a component: a class and a modifier (btn, btn--secondary)'],
				['Variables, modes', 'CSS variables; modes are themes ([data-theme])'],
				['Constraints', 'positioning and behavior when the width changes'],
				['Dev Mode', 'a mode where a developer sees sizes, tokens and code']
			],
			caption: 'Click a part of the design and see what a developer sees',
			mock: 'The design of a card',
			layer: 'Layer:',
			inDesign: 'In the design',
			inCode: 'In the code',
			vocabCaption: 'A glossary: the design tool and CSS',
			head: ['In the design', 'In the code']
		}
	});

	let brief = $state({ ...W.fallback });
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			brief = { title: p.title, action: p.mainAction.label };
		} catch {
			/* the example words stay */
		}
	});

	type Part = { id: string; layer: string; figma: string[]; css: string };
	const parts: Part[] = [
		{ id: 'card', layer: 'Card', figma: W.figma.card, css: '.card {\n  display: flex;\n  flex-direction: column;\n  gap: var(--space-2);\n  padding: var(--space-4);\n  border-radius: var(--radius-md);\n  background: var(--surface-raised);\n}' },
		{ id: 'title', layer: 'Card/Title', figma: W.figma.title, css: '.card__title {\n  font: var(--font-heading-md);\n  color: var(--text-primary);\n}' },
		{ id: 'button', layer: 'Card/Action', figma: W.figma.button, css: '.btn {\n  display: inline-flex;\n  align-items: center;\n  min-height: 44px;\n  padding: 0 var(--space-4);\n  background: var(--action);\n  color: var(--on-action);\n}' }
	];
	let sel = $state('card');
	const cur = $derived(parts.find((p) => p.id === sel)!);

	const vocab = W.vocab;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="cols">
		<div class="canvas" role="group" aria-label={W.mock}>
			<div class="card" class:on={sel === 'card'}>
				<button type="button" class="lbl" onclick={() => (sel = 'card')} aria-pressed={sel === 'card'}>Card</button>
				<button type="button" class="part title" class:on={sel === 'title'} onclick={() => (sel = 'title')} aria-pressed={sel === 'title'}>{brief.title}</button>
				<button type="button" class="part btn" class:on={sel === 'button'} onclick={() => (sel = 'button')} aria-pressed={sel === 'button'}>{brief.action}</button>
			</div>
		</div>
		<div class="insp">
			<p class="layer">{W.layer} <code class="dg-mono">{cur.layer}</code></p>
			<div class="dh">{W.inDesign}</div>
			<ul>
				{#each cur.figma as f, k (k)}<li>{f}</li>{/each}
			</ul>
			<div class="dh">{W.inCode}</div>
			<pre class="dg-box dg-mono">{cur.css}</pre>
		</div>
	</div>

	<table class="tbl">
		<caption class="dg-out" style="text-align:left;margin:var(--space-4) 0 var(--space-2)">{W.vocabCaption}</caption>
		<thead><tr><th>{W.head[0]}</th><th>{W.head[1]}</th></tr></thead>
		<tbody>
			{#each vocab as [a, b] (a)}
				<tr><td>{a}</td><td>{b}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	.canvas {
		padding: var(--space-4);
		background: #e9e6df;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		background: #fff;
		color: #1c1b19;
		border-radius: 8px;
		position: relative;
		box-sizing: border-box;
		width: 100%;
		font-family: system-ui, sans-serif;
	}
	.card.on {
		outline: 2px solid #1d6fe0;
	}
	.part,
	.lbl {
		all: unset;
		cursor: pointer;
		box-sizing: border-box;
	}
	.part:focus-visible,
	.lbl:focus-visible {
		outline: 3px solid #ffdd00;
		outline-offset: 2px;
	}
	.lbl {
		position: absolute;
		top: -1.4rem;
		left: 0;
		font-size: 0.75rem;
		color: #1d6fe0;
		text-decoration: underline;
	}
	.title {
		font-size: 1.2rem;
		font-weight: 600;
	}
	.btn {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 16px;
		background: #0b5cad;
		color: #fff;
		border-radius: 6px;
		font-weight: 600;
	}
	.part.on {
		outline: 2px dashed #1d6fe0;
		outline-offset: 2px;
	}
	.insp .dh {
		margin: var(--space-3) 0 var(--space-1);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.layer {
		margin: 0;
	}
	.insp ul {
		margin: 0;
		padding-left: var(--space-5);
	}
	.insp pre {
		margin: 0;
		white-space: pre;
		overflow: auto;
		font-size: 0.78rem;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-body-sm);
	}
	.tbl th,
	.tbl td {
		text-align: left;
		padding: var(--space-2);
		border-bottom: var(--line) solid var(--border-hairline);
	}
</style>
