<!--
	«Дуга истории» (part 12, lesson 2). Three views of one landing page's story: Freytag's pyramid
	with the three acts laid over it (five tension values the reader can move), Duarte's zigzag
	between «как есть» and «как могло бы быть», and the choice between starting from the beginning
	and starting in the middle. The page is an invented one; nothing is copied from a source.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	type View = 'freytag' | 'duarte' | 'order';
	let view = $state<View>('freytag');

	const W = pick({
		ru: {
			stages: [
				{ name: 'Экспозиция', page: 'Первый экран: кто вы и для кого', tension: 2 },
				{ name: 'Подъём', page: 'Проблема посетителя растёт', tension: 5 },
				{ name: 'Кульминация', page: 'Момент, когда видно решение и кнопка', tension: 9 },
				{ name: 'Спад', page: 'Как это работает, доказательства', tension: 5 },
				{ name: 'Развязка', page: 'Итог и приглашение к действию', tension: 1 }
			],
			zig: [
				{ side: 'is', text: 'Сейчас: вы три месяца не можете понять, где ваша граница.' },
				{ side: 'could', text: 'Могло бы быть: на плане видна каждая точка, и спорить не о чем.' },
				{ side: 'is', text: 'Сейчас: сосед держится за старый план.' },
				{ side: 'could', text: 'Могло бы быть: заключение эксперта ставит точку.' },
				{ side: 'is', text: 'Сейчас: вы не знаете, с чего начать.' },
				{ side: 'could', text: 'Новое «после»: вы записались на разговор и знаете следующий шаг.' }
			],
			beginning: ['Мы занимаемся земельными вопросами с 2010 года.', 'К нам приходят люди с разными задачами.', 'Однажды пришёл Иван: сосед поставил забор на его землю.', 'Мы сделали замер и подготовили заключение.'],
			middle: ['Сосед поставил забор в метре от границы, и Иван пришёл к нам с планом в руках.', '(Мы занимаемся такими случаями с 2010 года.)', 'Мы сделали замер и подготовили заключение.', 'Через месяц забор стоял на своём месте.'],
			caption: 'Дуга истории на одной странице',
			group: 'Вид схемы',
			tabs: { freytag: 'Пирамида и акты', duarte: 'Зигзаг Дуарте', order: 'С начала или с середины' },
			chart: (l: number[]) => `Кривая напряжения: экспозиция ${l[0]}, подъём ${l[1]}, кульминация ${l[2]}, спад ${l[3]}, развязка ${l[4]} из 10`,
			acts: ['акт 1', 'акт 2', 'акт 3'],
			tension: 'Напряжение',
			onPage: 'На странице: ',
			freytagNote: 'Три акта лежат поверх пирамиды: завязка (четверть), развитие (половина), развязка (четверть). Подвигайте точки: у истории без подъёма кульминации нет.',
			duarteNote: 'Нэнси Дуарте советует чередовать «как есть» и «как могло бы быть», а закончить лучшим из двух. Читатель сам видит разрыв и хочет его закрыть.',
			startGroup: 'С чего начинать',
			fromStart: 'С начала',
			fromMiddle: 'С середины (in medias res)',
			middleNote: 'Читатель сразу попадает в сцену с бедой, а справка о компании идёт скобкой, когда он уже заинтересован.',
			startNote: 'Порядок привычный, но первые две строки это справка, а человек с бедой появляется только на третьей.'
		},
		en: {
			stages: [
				{ name: 'Exposition', page: 'The first screen: who you are and who it’s for', tension: 2 },
				{ name: 'Rising action', page: 'The visitor’s problem grows', tension: 5 },
				{ name: 'Climax', page: 'The moment the solution and the button come into view', tension: 9 },
				{ name: 'Falling action', page: 'How it works, the proof', tension: 5 },
				{ name: 'Resolution', page: 'The outcome and the invitation to act', tension: 1 }
			],
			zig: [
				{ side: 'is', text: 'What is: for three months you can’t tell where your boundary runs.' },
				{ side: 'could', text: 'What could be: the plan shows every marker, and there’s nothing left to argue about.' },
				{ side: 'is', text: 'What is: the neighbor clings to an old plan.' },
				{ side: 'could', text: 'What could be: an expert’s report settles it.' },
				{ side: 'is', text: 'What is: you don’t know where to start.' },
				{ side: 'could', text: 'The new “after”: you’ve booked a call and you know the next step.' }
			],
			beginning: ['We have handled land questions since 2010.', 'People come to us with all kinds of problems.', 'One day Sam came in: a neighbor had built a fence on his land.', 'We surveyed the line and prepared a report.'],
			middle: ['A neighbor built a fence a yard over the line, and Sam walked in with his plan in his hand.', '(We have handled cases like this since 2010.)', 'We surveyed the line and prepared a report.', 'A month later the fence stood where it belonged.'],
			caption: 'The arc of a story on one page',
			group: 'View of the diagram',
			tabs: { freytag: 'Pyramid and acts', duarte: 'Duarte’s zigzag', order: 'From the start or the middle' },
			chart: (l: number[]) => `Tension curve: exposition ${l[0]}, rising action ${l[1]}, climax ${l[2]}, falling action ${l[3]}, resolution ${l[4]} out of 10`,
			acts: ['act 1', 'act 2', 'act 3'],
			tension: 'Tension',
			onPage: 'On the page: ',
			freytagNote: 'The three acts lie over the pyramid: setup (a quarter), confrontation (a half), resolution (a quarter). Move the dots: a story with no rise has no climax.',
			duarteNote: 'Nancy Duarte advises alternating “what is” with “what could be”, and ending on the better of the two. Readers see the gap for themselves and want to close it.',
			startGroup: 'Where to start',
			fromStart: 'From the start',
			fromMiddle: 'From the middle (in medias res)',
			middleNote: 'The reader lands straight in the scene of the trouble, and the company background comes in brackets, once they’re interested.',
			startNote: 'The order is the familiar one, but the first two lines are background, and the person in trouble only appears on the third.'
		}
	});
	const stages = W.stages;
	let levels = $state(stages.map((s) => s.tension));

	const WIDTH = 560;
	const H = 200;
	const px = (i: number) => 40 + (i * (WIDTH - 80)) / (stages.length - 1);
	const py = (v: number) => H - 30 - (v / 10) * (H - 70);
	const path = $derived(levels.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' '));
	// Acts: roughly a quarter, a half and a quarter of the way along.
	const act1 = 40 + (WIDTH - 80) * 0.25;
	const act2 = 40 + (WIDTH - 80) * 0.75;

	// Duarte: an alternation between the two states, ending on the better one.
	const zig = W.zig;

	let medias = $state(false);
	const shown = $derived(medias ? W.middle : W.beginning);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		<button type="button" aria-pressed={view === 'freytag'} onclick={() => (view = 'freytag')}>{W.tabs.freytag}</button>
		<button type="button" aria-pressed={view === 'duarte'} onclick={() => (view = 'duarte')}>{W.tabs.duarte}</button>
		<button type="button" aria-pressed={view === 'order'} onclick={() => (view = 'order')}>{W.tabs.order}</button>
	</div>

	{#if view === 'freytag'}
		<svg viewBox="0 0 {WIDTH} {H}" role="img" aria-label={W.chart(levels)}>
			<line x1={act1} y1="10" x2={act1} y2={H - 28} class="act" />
			<line x1={act2} y1="10" x2={act2} y2={H - 28} class="act" />
			<text x={(40 + act1) / 2} y="20" text-anchor="middle" font-size="12">{W.acts[0]}</text>
			<text x={(act1 + act2) / 2} y="20" text-anchor="middle" font-size="12">{W.acts[1]}</text>
			<text x={(act2 + WIDTH - 40) / 2} y="20" text-anchor="middle" font-size="12">{W.acts[2]}</text>
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
					<input type="range" min="0" max="10" step="1" bind:value={levels[i]} aria-label="{W.tension}: {s.name}" />
				</label>
			{/each}
		</div>
		<ul class="dg-out">
			{#each stages as s (s.name)}<li><strong>{s.name}.</strong> {W.onPage}{s.page}.</li>{/each}
		</ul>
		<p class="dg-out">{W.freytagNote}</p>
	{:else if view === 'duarte'}
		<ol class="zig">
			{#each zig as z, i (i)}
				<li class={z.side}>{z.text}</li>
			{/each}
		</ol>
		<p class="dg-out">{W.duarteNote}</p>
	{:else}
		<div class="dg-ctl" role="group" aria-label={W.startGroup}>
			<button type="button" aria-pressed={!medias} onclick={() => (medias = false)}>{W.fromStart}</button>
			<button type="button" aria-pressed={medias} onclick={() => (medias = true)}>{W.fromMiddle}</button>
		</div>
		<ol class="dg-box order">
			{#each shown as line (line)}<li>{line}</li>{/each}
		</ol>
		<p class="dg-out">{medias ? W.middleNote : W.startNote}</p>
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
