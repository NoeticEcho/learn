<!--
	«Одни числа, три подачи» (part 12, lesson 10). Five invented numbers (hours to a first answer,
	by year) shown three ways: as they are, with a headline that states the conclusion and one
	accent, and step by step. A text alternative sits beside the chart in every view.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			caption: 'Одни и те же числа, три подачи',
			group: 'Подача',
			raw: 'Как есть',
			conclusion: 'Вывод и акцент',
			steps: 'Шаг за шагом',
			rawTitle: 'Среднее время до первого ответа, часов',
			rawNote: 'Всё на месте, но читатель сам должен понять, что здесь главное. Заголовок называет оси, а не мысль.',
			headline: 'Первый ответ клиенту приходит в 12 раз быстрее, чем четыре года назад',
			unit: ' ч',
			conclusionNote: 'Заголовок говорит вывод. Цветом выделены две полосы, которые сравниваются: 48 часов и 4 часа. Остальное серое. Подписи прямо у полос, ничего искать не надо.',
			stepsTitle: 'Как сокращался срок ответа',
			nextYear: 'Следующий год',
			again: 'Сначала',
			stepsNote: 'Каждый шаг добавляет одну полосу и подсвечивает её: так показывают, как менялась картина. При «уменьшении движения» такой показ заменяют сразу готовым графиком.',
			altLabel: 'Текстовая альтернатива:',
			alt: ' среднее время до первого ответа сократилось с 48 часов в 2021 году до 4 часов в 2025 году, то есть в 12 раз. Числа в этой схеме придуманы.'
		},
		en: {
			caption: 'The same numbers, three ways to present them',
			group: 'Presentation',
			raw: 'As they are',
			conclusion: 'Conclusion and accent',
			steps: 'Step by step',
			rawTitle: 'Average time to a first reply, hours',
			rawNote: 'Everything is there, but readers have to work out for themselves what matters. The title names the axes, not the point.',
			headline: 'Clients now get a first reply 12 times faster than four years ago',
			unit: ' h',
			conclusionNote: 'The title states the conclusion. Two bars are colored, the two being compared: 48 hours and 4 hours. The rest is gray. The labels sit right at the bars, so nothing has to be looked up.',
			stepsTitle: 'How the reply time shrank',
			nextYear: 'Next year',
			again: 'Start over',
			stepsNote: 'Each step adds one bar and highlights it: that is how you show how the picture changed. With “reduce motion” on, this is replaced by the finished chart at once.',
			altLabel: 'Text alternative:',
			alt: ' the average time to a first reply fell from 48 hours in 2021 to 4 hours in 2025, which is 12 times shorter. The numbers in this diagram are invented.'
		}
	});

	const data = [
		{ year: '2021', hours: 48 },
		{ year: '2022', hours: 30 },
		{ year: '2023', hours: 12 },
		{ year: '2024', hours: 6 },
		{ year: '2025', hours: 4 }
	];
	const max = Math.max(...data.map((d) => d.hours));

	type View = 'raw' | 'conclusion' | 'steps';
	let view = $state<View>('raw');
	let step = $state(1);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		<button type="button" aria-pressed={view === 'raw'} onclick={() => (view = 'raw')}>{W.raw}</button>
		<button type="button" aria-pressed={view === 'conclusion'} onclick={() => (view = 'conclusion')}>{W.conclusion}</button>
		<button type="button" aria-pressed={view === 'steps'} onclick={() => ((view = 'steps'), (step = 1))}>{W.steps}</button>
	</div>

	{#if view === 'raw'}
		<div class="dh">{W.rawTitle}</div>
		<ul class="bars">
			{#each data as d (d.year)}
				<li><span class="lab">{d.year}</span><span class="bar" style="width: {(d.hours / max) * 100}%"></span><span class="val">{d.hours}</span></li>
			{/each}
		</ul>
		<p class="dg-out">{W.rawNote}</p>
	{:else if view === 'conclusion'}
		<div class="dh">{W.headline}</div>
		<ul class="bars">
			{#each data as d, i (d.year)}
				<li>
					<span class="lab">{d.year}</span>
					<span class="bar" class:accent={i === 0 || i === data.length - 1} style="width: {(d.hours / max) * 100}%"></span>
					<span class="val">{d.hours}{W.unit}</span>
				</li>
			{/each}
		</ul>
		<p class="dg-out">{W.conclusionNote}</p>
	{:else}
		<div class="dh">{W.stepsTitle}</div>
		<ul class="bars">
			{#each data.slice(0, step) as d, i (d.year)}
				<li>
					<span class="lab">{d.year}</span>
					<span class="bar" class:accent={i === step - 1} style="width: {(d.hours / max) * 100}%"></span>
					<span class="val">{d.hours}{W.unit}</span>
				</li>
			{/each}
		</ul>
		<div class="dg-ctl">
			<button type="button" onclick={() => (step = Math.min(data.length, step + 1))} disabled={step >= data.length}>{W.nextYear}</button>
			<button type="button" onclick={() => (step = 1)} disabled={step === 1}>{W.again}</button>
		</div>
		<p class="dg-out" aria-live="polite">{W.stepsNote}</p>
	{/if}

	<p class="dg-out alt"><strong>{W.altLabel}</strong>{W.alt}</p>
</figure>

<style>
	.dh {
		margin: 0 0 var(--space-3);
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		max-width: var(--measure);
	}
	.bars {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.bars li {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr) 3.5rem;
		gap: var(--space-2);
		align-items: center;
	}
	.bar {
		display: block;
		height: 1.1rem;
		min-width: 0.3rem;
		background: var(--border-rule);
	}
	.bar.accent {
		background: var(--accent-measure);
	}
	.val {
		text-align: right;
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
