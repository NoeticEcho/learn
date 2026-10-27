<!--
	«Одни числа, три подачи» (part 12, lesson 10). Five invented numbers (hours to a first answer,
	by year) shown three ways: as they are, with a headline that states the conclusion and one
	accent, and step by step. A text alternative sits beside the chart in every view.
-->
<script lang="ts">
	import './shared.css';

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
	<figcaption>Одни и те же числа, три подачи</figcaption>
	<div class="dg-ctl" role="group" aria-label="Подача">
		<button type="button" aria-pressed={view === 'raw'} onclick={() => (view = 'raw')}>Как есть</button>
		<button type="button" aria-pressed={view === 'conclusion'} onclick={() => (view = 'conclusion')}>Вывод и акцент</button>
		<button type="button" aria-pressed={view === 'steps'} onclick={() => ((view = 'steps'), (step = 1))}>Шаг за шагом</button>
	</div>

	{#if view === 'raw'}
		<div class="dh">Среднее время до первого ответа, часов</div>
		<ul class="bars">
			{#each data as d (d.year)}
				<li><span class="lab">{d.year}</span><span class="bar" style="width: {(d.hours / max) * 100}%"></span><span class="val">{d.hours}</span></li>
			{/each}
		</ul>
		<p class="dg-out">Всё на месте, но читатель сам должен понять, что здесь главное. Заголовок называет оси, а не мысль.</p>
	{:else if view === 'conclusion'}
		<div class="dh">Первый ответ клиенту приходит в 12 раз быстрее, чем четыре года назад</div>
		<ul class="bars">
			{#each data as d, i (d.year)}
				<li>
					<span class="lab">{d.year}</span>
					<span class="bar" class:accent={i === 0 || i === data.length - 1} style="width: {(d.hours / max) * 100}%"></span>
					<span class="val">{d.hours} ч</span>
				</li>
			{/each}
		</ul>
		<p class="dg-out">Заголовок говорит вывод. Цветом выделены две полосы, которые сравниваются: 48 часов и 4 часа. Остальное серое. Подписи прямо у полос, ничего искать не надо.</p>
	{:else}
		<div class="dh">Как сокращался срок ответа</div>
		<ul class="bars">
			{#each data.slice(0, step) as d, i (d.year)}
				<li>
					<span class="lab">{d.year}</span>
					<span class="bar" class:accent={i === step - 1} style="width: {(d.hours / max) * 100}%"></span>
					<span class="val">{d.hours} ч</span>
				</li>
			{/each}
		</ul>
		<div class="dg-ctl">
			<button type="button" onclick={() => (step = Math.min(data.length, step + 1))} disabled={step >= data.length}>Следующий год</button>
			<button type="button" onclick={() => (step = 1)} disabled={step === 1}>Сначала</button>
		</div>
		<p class="dg-out" aria-live="polite">Каждый шаг добавляет одну полосу и подсвечивает её: так показывают, как менялась картина. При «уменьшении движения» такой показ заменяют сразу готовым графиком.</p>
	{/if}

	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> среднее время до первого ответа сократилось с 48 часов в 2021 году до 4 часов в 2025 году, то есть в 12 раз. Числа в этой схеме придуманы.</p>
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
