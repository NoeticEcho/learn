<!--
	«Лаборатория иерархии» (part 4, lesson 3). A small page of the person's own project and four
	controls: the heading's size, how much the main action stands out, the gap between sections
	(snapped to a base step) and the grid's columns. A «squint» switch blurs the page, which is the
	oldest test of hierarchy there is. A rough weight model ranks what the eye meets first; it is a
	teaching model, not a measurement.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			fallback: { title: 'Ваш проект', action: 'Главное действие', sections: ['Первый раздел', 'Второй раздел', 'Третий раздел'] },
			caption: 'Куда сначала смотрит глаз',
			heading: 'Заголовок',
			gap: 'Расстояние между секциями',
			cols: 'Колонок в сетке',
			emphasis: 'Выделение главного действия',
			plainAction: 'Действие как все ссылки',
			byColor: 'Цветом',
			byBoth: 'Цветом и размером',
			squint: 'Прищуриться (размыть)',
			layout: 'Макет страницы вашего проекта',
			lead: 'Короткое описание: что это и для кого.',
			more: 'Подробнее',
			also: 'Ещё',
			cardText: 'Несколько строк обычного текста раздела.',
			first: 'Первым глаз заметит:',
			names: { h1: 'Заголовок', action: 'Главное действие', h2: 'Заголовки разделов', body: 'Обычный текст' },
			note: 'Модель упрощённая: вес растёт с размером и насыщенностью. Для проверки на живой странице есть способ надёжнее: прищурьтесь и посмотрите, что осталось заметным.',
			lost: 'Сейчас главное действие потерялось среди ссылок: страница его не просит.'
		},
		en: {
			fallback: { title: 'Your project', action: 'Main action', sections: ['First section', 'Second section', 'Third section'] },
			caption: 'Where the eye looks first',
			heading: 'Heading',
			gap: 'Space between sections',
			cols: 'Columns in the grid',
			emphasis: 'How the main action stands out',
			plainAction: 'Like any link',
			byColor: 'By color',
			byBoth: 'By color and size',
			squint: 'Squint (blur)',
			layout: 'A layout of your project’s page',
			lead: 'A short description: what this is and who it is for.',
			more: 'Read more',
			also: 'More',
			cardText: 'A few lines of ordinary text for the section.',
			first: 'The eye will notice this first:',
			names: { h1: 'Heading', action: 'Main action', h2: 'Section headings', body: 'Ordinary text' },
			note: 'The model is simplified: weight grows with size and saturation. On a real page there is a more reliable check: squint, and see what is still noticeable.',
			lost: 'Right now the main action is lost among the links: the page isn’t asking for it.'
		}
	});
	let brief = $state({ ...W.fallback });
	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			brief = { title: p.title, action: p.mainAction.label, sections: p.sections.slice(0, 3) };
		} catch {
			/* the example words stay */
		}
	});

	let h1 = $state(2.4);
	let emphasis = $state<'none' | 'color' | 'both'>('none');
	let steps = $state(3);
	let cols = $state(3);
	let squint = $state(false);

	const base = 8;
	const gap = $derived(steps * base);

	const weights = $derived.by(() => {
		const btn = emphasis === 'none' ? 11 : emphasis === 'color' ? 22 : 34;
		const items = [
			{ id: 'h1', name: W.names.h1, w: h1 * 16 },
			{ id: 'action', name: W.names.action, w: btn },
			{ id: 'h2', name: W.names.h2, w: 20 },
			{ id: 'body', name: W.names.body, w: 12 }
		];
		return items.sort((a, b) => b.w - a.w);
	});
	const top = $derived(weights[0]);
	const max = $derived(weights[0].w);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="ctl">
		<label>
			{W.heading}: {h1.toFixed(1)} rem
			<input type="range" min="1.2" max="3.4" step="0.1" bind:value={h1} />
		</label>
		<label>
			{W.gap}: {gap} px ({steps} × {base})
			<input type="range" min="1" max="10" step="1" bind:value={steps} />
		</label>
		<label>
			{W.cols}: {cols}
			<input type="range" min="1" max="4" step="1" bind:value={cols} />
		</label>
		<div role="group" aria-label={W.emphasis} class="dg-ctl" style="margin:0">
			<button type="button" aria-pressed={emphasis === 'none'} onclick={() => (emphasis = 'none')}>{W.plainAction}</button>
			<button type="button" aria-pressed={emphasis === 'color'} onclick={() => (emphasis = 'color')}>{W.byColor}</button>
			<button type="button" aria-pressed={emphasis === 'both'} onclick={() => (emphasis = 'both')}>{W.byBoth}</button>
		</div>
		<label>
			<input type="checkbox" bind:checked={squint} />
			{W.squint}
		</label>
	</div>

	<div class="page" class:squint role="group" aria-label={W.layout}>
		<p class="brand">{brief.title}</p>
		<h3 style="font-size:{h1}rem">{brief.title}</h3>
		<p class="lead">
			{W.lead}
			<a href="#top" tabindex="-1" class="plain">{W.more}</a>
			<a href="#top" tabindex="-1" class="plain">{W.also}</a>
		</p>
		<p>
			<a href="#top" tabindex="-1" class="act" class:color={emphasis !== 'none'} class:big={emphasis === 'both'}>{brief.action}</a>
		</p>
		<div class="grid" style="gap:{gap}px;margin-top:{gap}px;grid-template-columns:repeat({cols},1fr)">
			{#each brief.sections as s, k (k)}
				<div class="card">
					<div class="dh">{s}</div>
					<p>{W.cardText}</p>
				</div>
			{/each}
		</div>
	</div>

	<div class="dg-out" aria-live="polite">
		<p>{W.first} <strong>{top.name}</strong>.</p>
		<ol class="rank">
			{#each weights as w (w.name)}
				<li><span class="lab">{w.name}</span><span class="bar" style="width:{Math.round((w.w / max) * 100)}%"></span></li>
			{/each}
		</ol>
		<p class="dg-hint">
			{W.note}
			{#if emphasis === 'none' && top.id !== 'action'}{W.lost}{/if}
		</p>
	</div>
</figure>

<style>
	.ctl {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.page {
		padding: var(--space-4);
		background: #faf9f7;
		color: #1c1b19;
		font-family: system-ui, sans-serif;
		border: var(--line) solid var(--border-hairline);
		transition: filter var(--dur-micro) var(--ease-stop);
	}
	.page.squint {
		filter: blur(3px);
	}
	.brand {
		margin: 0 0 var(--space-3);
		font-size: 0.8rem;
		color: #6a665f;
	}
	h3 {
		margin: 0 0 var(--space-2);
		line-height: 1.1;
		font-weight: 600;
		color: #1c1b19;
	}
	.lead {
		margin: 0 0 var(--space-3);
		font-size: 0.9rem;
		color: #4a4742;
	}
	.plain {
		margin-left: var(--space-2);
		color: #0b5cad;
		text-decoration: underline;
		font-size: 0.85rem;
	}
	.act {
		display: inline-block;
		font-size: 0.85rem;
		color: #0b5cad;
		text-decoration: underline;
	}
	.act.color {
		background: #0b5cad;
		color: #fff;
		text-decoration: none;
		padding: 0.45rem 0.8rem;
		border-radius: 6px;
		font-weight: 600;
	}
	.act.big {
		font-size: 1.15rem;
		padding: 0.7rem 1.3rem;
	}
	.grid {
		display: grid;
	}
	.card {
		padding: var(--space-3);
		border-top: 2px solid #d9d5ce;
	}
	.dh {
		margin: 0 0 var(--space-1);
		font-size: 1rem;
		color: #1c1b19;
	}
	.card p {
		margin: 0;
		font-size: 0.8rem;
		color: #4a4742;
	}
	.rank {
		list-style: none;
		margin: var(--space-2) 0 !important;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.rank li {
		display: grid;
		grid-template-columns: 11rem 1fr;
		align-items: center;
		gap: var(--space-2);
	}
	.bar {
		display: block;
		height: 0.6rem;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.dg-out p {
		margin: 0 0 var(--space-2);
	}
	.dg-hint {
		color: var(--text-secondary);
	}
</style>
