<!--
	«Дуга истории» (part 12, lesson 2). Three views of one landing page's story: Freytag's pyramid
	with the three acts laid over it (five tension values the reader can move), Duarte's zigzag
	between «как есть» and «как могло бы быть», and the choice between starting from the beginning
	and starting in the middle. The page is an invented one; nothing is copied from a source.
-->
<script lang="ts">
	import './shared.css';

	type View = 'freytag' | 'duarte' | 'order';
	let view = $state<View>('freytag');

	const stages = [
		{ name: 'Экспозиция', page: 'Первый экран: кто вы и для кого', tension: 2 },
		{ name: 'Подъём', page: 'Проблема посетителя растёт', tension: 5 },
		{ name: 'Кульминация', page: 'Момент, когда видно решение и кнопка', tension: 9 },
		{ name: 'Спад', page: 'Как это работает, доказательства', tension: 5 },
		{ name: 'Развязка', page: 'Итог и приглашение к действию', tension: 1 }
	];
	let levels = $state(stages.map((s) => s.tension));

	const W = 560;
	const H = 200;
	const px = (i: number) => 40 + (i * (W - 80)) / (stages.length - 1);
	const py = (v: number) => H - 30 - (v / 10) * (H - 70);
	const path = $derived(levels.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' '));
	// Acts: roughly a quarter, a half and a quarter of the way along.
	const act1 = 40 + (W - 80) * 0.25;
	const act2 = 40 + (W - 80) * 0.75;

	// Duarte: an alternation between the two states, ending on the better one.
	const zig = [
		{ side: 'is', text: 'Сейчас: вы три месяца не можете понять, где ваша граница.' },
		{ side: 'could', text: 'Могло бы быть: на плане видна каждая точка, и спорить не о чем.' },
		{ side: 'is', text: 'Сейчас: сосед держится за старый план.' },
		{ side: 'could', text: 'Могло бы быть: заключение эксперта ставит точку.' },
		{ side: 'is', text: 'Сейчас: вы не знаете, с чего начать.' },
		{ side: 'could', text: 'Новое «после»: вы записались на разговор и знаете следующий шаг.' }
	];

	let medias = $state(false);
	const beginning = ['Мы занимаемся земельными вопросами с 2010 года.', 'К нам приходят люди с разными задачами.', 'Однажды пришёл Иван: сосед поставил забор на его землю.', 'Мы сделали замер и подготовили заключение.'];
	const middle = ['Сосед поставил забор в метре от границы, и Иван пришёл к нам с планом в руках.', '(Мы занимаемся такими случаями с 2010 года.)', 'Мы сделали замер и подготовили заключение.', 'Через месяц забор стоял на своём месте.'];
	const shown = $derived(medias ? middle : beginning);
</script>

<figure class="dg">
	<figcaption>Дуга истории на одной странице</figcaption>
	<div class="dg-ctl" role="group" aria-label="Вид схемы">
		<button type="button" aria-pressed={view === 'freytag'} onclick={() => (view = 'freytag')}>Пирамида и акты</button>
		<button type="button" aria-pressed={view === 'duarte'} onclick={() => (view = 'duarte')}>Зигзаг Дуарте</button>
		<button type="button" aria-pressed={view === 'order'} onclick={() => (view = 'order')}>С начала или с середины</button>
	</div>

	{#if view === 'freytag'}
		<svg viewBox="0 0 {W} {H}" role="img" aria-label="Кривая напряжения: экспозиция {levels[0]}, подъём {levels[1]}, кульминация {levels[2]}, спад {levels[3]}, развязка {levels[4]} из 10">
			<line x1={act1} y1="10" x2={act1} y2={H - 28} class="act" />
			<line x1={act2} y1="10" x2={act2} y2={H - 28} class="act" />
			<text x={(40 + act1) / 2} y="20" text-anchor="middle" font-size="12">акт 1</text>
			<text x={(act1 + act2) / 2} y="20" text-anchor="middle" font-size="12">акт 2</text>
			<text x={(act2 + W - 40) / 2} y="20" text-anchor="middle" font-size="12">акт 3</text>
			<path d={path} class="curve" fill="none" />
			{#each stages as s, i (s.name)}
				<circle cx={px(i)} cy={py(levels[i])} r="5" class="dot" />
				<text x={px(i)} y={H - 10} text-anchor="middle" font-size="12">{s.name}</text>
			{/each}
		</svg>
		<div class="sliders">
			{#each stages as s, i (s.name)}
				<label>
					{s.name}: <span class="dg-mono">{levels[i]}</span>
					<input type="range" min="0" max="10" step="1" bind:value={levels[i]} aria-label="Напряжение: {s.name}" />
				</label>
			{/each}
		</div>
		<ul class="dg-out">
			{#each stages as s (s.name)}<li><strong>{s.name}.</strong> На странице: {s.page}.</li>{/each}
		</ul>
		<p class="dg-out">Три акта лежат поверх пирамиды: завязка (четверть), развитие (половина), развязка (четверть). Подвигайте точки: у истории без подъёма кульминации нет.</p>
	{:else if view === 'duarte'}
		<ol class="zig">
			{#each zig as z, i (i)}
				<li class={z.side}>{z.text}</li>
			{/each}
		</ol>
		<p class="dg-out">Нэнси Дуарте советует чередовать «как есть» и «как могло бы быть», а закончить лучшим из двух. Читатель сам видит разрыв и хочет его закрыть.</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label="С чего начинать">
			<button type="button" aria-pressed={!medias} onclick={() => (medias = false)}>С начала</button>
			<button type="button" aria-pressed={medias} onclick={() => (medias = true)}>С середины (in medias res)</button>
		</div>
		<ol class="dg-box order">
			{#each shown as line (line)}<li>{line}</li>{/each}
		</ol>
		<p class="dg-out">
			{#if medias}Читатель сразу попадает в сцену с бедой, а справка о компании идёт скобкой, когда он уже заинтересован.
			{:else}Порядок привычный, но первые две строки это справка, а человек с бедой появляется только на третьей.{/if}
		</p>
	{/if}
</figure>

<style>
	svg {
		width: 100%;
		max-width: 36rem;
		height: auto;
	}
	.act {
		stroke: var(--border-rule);
		stroke-dasharray: 4 4;
	}
	.curve {
		stroke: var(--accent-measure);
		stroke-width: 3;
	}
	.dot {
		fill: var(--accent-measure);
	}
	.sliders {
		display: grid;
		gap: var(--space-1);
		margin: var(--space-3) 0;
	}
	.zig {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.zig li {
		padding: var(--space-2) var(--space-3);
		border-left: 3px solid var(--border-rule);
		max-width: 34rem;
	}
	.zig li.could {
		margin-left: var(--space-5);
		border-left-color: var(--accent-measure);
	}
	.order li {
		margin-bottom: var(--space-2);
	}
</style>
