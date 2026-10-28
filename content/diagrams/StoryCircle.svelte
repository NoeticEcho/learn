<!--
	«Круг истории» (part 12, lesson 4). Dan Harmon's eight-step circle, with its upper half («привычное»)
	and lower half («неизвестное»), the steps of Vogler's journey that fall into each sector, and a
	question to ask of one's own visitor. Second view: three shapes a story can take (a line to a
	peak, a circle, a bag), to set the lesson's critique beside the formula. Wording is ours.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			steps: [
				{ n: 'Ты', says: 'Герой в своей зоне комфорта.', vogler: 'Обычный мир', ask: 'Кто этот человек и как выглядит его обычный день?' },
				{ n: 'Нужда', says: 'Ему чего-то хочется или не хватает.', vogler: 'Зов, отказ', ask: 'Чего он хочет, чего ему не хватает?' },
				{ n: 'Уход', says: 'Он входит в незнакомую ситуацию.', vogler: 'Наставник, порог', ask: 'С чего он начинает и с кем встречается?' },
				{ n: 'Поиск', says: 'Он приспосабливается, учится, ищет.', vogler: 'Испытания, союзники', ask: 'Что ему приходится освоить?' },
				{ n: 'Находка', says: 'Он получает то, чего хотел.', vogler: 'Главное испытание, награда', ask: 'Что он получил?' },
				{ n: 'Цена', says: 'Находка обходится дорого.', vogler: 'Воскрешение (частично)', ask: 'От чего пришлось отказаться, что потерять, во что вложиться?' },
				{ n: 'Возвращение', says: 'Он возвращается туда, откуда начал.', vogler: 'Дорога назад', ask: 'Куда он возвращается?' },
				{ n: 'Перемена', says: 'Он вернулся другим.', vogler: 'Возвращение с эликсиром', ask: 'Чем он теперь отличается?' }
			],
			caption: 'Круг истории и другие формы',
			group: 'Вид схемы',
			circle: 'Круг Хармона',
			shapes: 'Три формы',
			ring: 'Восемь шагов круга',
			known: 'привычное',
			unknown: 'неизвестное',
			stepLabel: (k: number, n: string) => `Шаг ${k}: ${n}`,
			vo: 'У Воглера этому примерно соответствует: ',
			ask: 'Вопрос про вашего посетителя: ',
			back: 'Назад',
			next: 'Дальше',
			circleNote: '{W.circleNote}',
			lineAlt: 'Линия, поднимающаяся к вершине и спадающая',
			circleAlt: 'Замкнутый круг',
			bagAlt: 'Мешок с несколькими предметами',
			line: 'Линия к вершине.',
			lineText: ' Пирамида Фрейтага, три акта: конфликт растёт и разрешается.',
			circ: 'Круг.',
			circText: ' Хармон, путь героя: уходим и возвращаемся другими.',
			bag: 'Мешок.',
			bagText: ' Так Урсула Ле Гуин называла рассказ, который собирает людей и вещи в целое, без главного поединка.',
			shapesNote: '{W.shapesNote}'
		},
		en: {
			steps: [
				{ n: 'You', says: 'The hero in their comfort zone.', vogler: 'Ordinary world', ask: 'Who is this person, and what does an ordinary day look like for them?' },
				{ n: 'Need', says: 'They want something, or something is missing.', vogler: 'Call, refusal', ask: 'What do they want? What are they missing?' },
				{ n: 'Go', says: 'They enter an unfamiliar situation.', vogler: 'Mentor, threshold', ask: 'Where do they start, and whom do they meet?' },
				{ n: 'Search', says: 'They adapt, learn, look around.', vogler: 'Tests, allies', ask: 'What do they have to learn?' },
				{ n: 'Find', says: 'They get what they wanted.', vogler: 'The ordeal, reward', ask: 'What did they get?' },
				{ n: 'Take', says: 'Getting it costs them dearly.', vogler: 'Resurrection (in part)', ask: 'What did they have to give up, lose, or invest?' },
				{ n: 'Return', says: 'They go back to where they began.', vogler: 'The road back', ask: 'Where do they go back to?' },
				{ n: 'Change', says: 'They are back, and changed.', vogler: 'Return with the elixir', ask: 'How are they different now?' }
			],
			caption: 'The story circle and other shapes',
			group: 'View of the diagram',
			circle: 'Harmon’s circle',
			shapes: 'Three shapes',
			ring: 'The eight steps of the circle',
			known: 'the familiar',
			unknown: 'the unknown',
			stepLabel: (k: number, n: string) => `Step ${k}: ${n}`,
			vo: 'In Vogler’s journey this roughly matches: ',
			ask: 'A question about your visitor: ',
			back: 'Back',
			next: 'Next',
			circleNote: 'Above the line is the familiar, below it the unknown. Steps 3 and 7 are the crossings: going down, and coming back up.',
			lineAlt: 'A line rising to a peak and falling',
			circleAlt: 'A closed circle',
			bagAlt: 'A bag with several objects in it',
			line: 'A line to a peak.',
			lineText: ' Freytag’s pyramid, the three acts: conflict rises and is resolved.',
			circ: 'A circle.',
			circText: ' Harmon, the hero’s journey: we leave and come back changed.',
			bag: 'A bag.',
			bagText: ' Ursula K. Le Guin’s name for a story that gathers people and things into a whole, with no central duel.',
			shapesNote: 'This is not a contest between shapes. Any of the three often suits a project’s story: look at what your material really has.'
		}
	});
	const steps = W.steps;
	let i = $state(0);

	type Shape = 'circle' | 'shapes';
	let view = $state<Shape>('circle');

	const R = 100;
	const cx = 130;
	const cy = 120;
	const pos = (k: number) => {
		const a = (k / 8) * 2 * Math.PI - Math.PI / 2;
		return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
	};
	const s = $derived(steps[i]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		<button type="button" aria-pressed={view === 'circle'} onclick={() => (view = 'circle')}>{W.circle}</button>
		<button type="button" aria-pressed={view === 'shapes'} onclick={() => (view = 'shapes')}>{W.shapes}</button>
	</div>

	{#if view === 'circle'}
		<div class="wrap">
			<svg viewBox="0 0 260 240" role="group" aria-label={W.ring}>
				<circle {cx} {cy} r={R} class="ring" fill="none" />
				<line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} class="line" />
				<text x={cx} y={cy - 8} text-anchor="middle" font-size="11">{W.known}</text>
				<text x={cx} y={cy + 18} text-anchor="middle" font-size="11">{W.unknown}</text>
				{#each steps as st, k (st.n)}
					{@const p = pos(k)}
					<g
						role="button"
						tabindex="0"
						aria-label={W.stepLabel(k + 1, st.n)}
						aria-pressed={k === i}
						onclick={() => (i = k)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && ((i = k), e.preventDefault())}
					>
						<circle cx={p.x} cy={p.y} r="15" class="node" class:on={k === i} />
						<text x={p.x} y={p.y + 4} text-anchor="middle" font-size="12">{k + 1}</text>
					</g>
				{/each}
			</svg>
			<div aria-live="polite">
				<p class="dg-out"><strong>{i + 1}. {s.n}.</strong> {s.says}</p>
				<p class="dg-out">{W.vo}{s.vogler}.</p>
				<p class="dg-out">{W.ask}{s.ask}</p>
				<div class="dg-ctl">
					<button type="button" onclick={() => (i = (i + 7) % 8)}>{W.back}</button>
					<button type="button" onclick={() => (i = (i + 1) % 8)}>{W.next}</button>
				</div>
			</div>
		</div>
		<p class="dg-out">{W.circleNote}</p>
	{:else}
		<div class="shapes">
			<div class="dg-box">
				<svg viewBox="0 0 120 70" role="img" aria-label={W.lineAlt}>
					<polyline points="5,60 45,35 70,8 95,40 115,60" fill="none" class="curve" />
				</svg>
				<p><strong>{W.line}</strong>{W.lineText}</p>
			</div>
			<div class="dg-box">
				<svg viewBox="0 0 120 70" role="img" aria-label={W.circleAlt}>
					<circle cx="60" cy="35" r="26" fill="none" class="curve" />
				</svg>
				<p><strong>{W.circ}</strong>{W.circText}</p>
			</div>
			<div class="dg-box">
				<svg viewBox="0 0 120 70" role="img" aria-label={W.bagAlt}>
					<path d="M35,25 Q60,5 85,25 L95,60 L25,60 Z" fill="none" class="curve" />
					<circle cx="50" cy="45" r="5" class="item" />
					<circle cx="68" cy="50" r="5" class="item" />
					<circle cx="60" cy="38" r="4" class="item" />
				</svg>
				<p><strong>{W.bag}</strong>{W.bagText}</p>
			</div>
		</div>
		<p class="dg-out">{W.shapesNote}</p>
	{/if}
</figure>

<style>
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 17rem) minmax(0, 1fr);
		gap: var(--space-4);
		align-items: start;
	}
	@media (max-width: 40rem) {
		.wrap {
			grid-template-columns: 1fr;
		}
	}
	svg {
		width: 100%;
		height: auto;
	}
	.ring,
	.line {
		stroke: var(--border-rule);
	}
	.node {
		fill: var(--surface-canvas);
		stroke: var(--border-rule);
		stroke-width: 2;
		cursor: pointer;
	}
	.node.on {
		stroke: var(--accent-measure);
		fill: var(--surface-body);
		stroke-width: 3;
	}
	g {
		outline: none;
	}
	g:focus-visible .node {
		stroke: var(--accent-measure);
		stroke-width: 4;
	}
	.shapes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-3);
	}
	.shapes p {
		margin: var(--space-2) 0 0;
	}
	.curve {
		stroke: var(--accent-measure);
		stroke-width: 3;
	}
	.item {
		fill: var(--accent-measure);
	}
</style>
