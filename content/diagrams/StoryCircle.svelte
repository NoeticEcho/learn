<!--
	«Круг истории» (part 12, lesson 4). Dan Harmon's eight-step circle, with its upper half («привычное»)
	and lower half («неизвестное»), the steps of Vogler's journey that fall into each sector, and a
	question to ask of one's own visitor. Second view: three shapes a story can take (a line to a
	peak, a circle, a bag), to set the lesson's critique beside the formula. Wording is ours.
-->
<script lang="ts">
	import './shared.css';

	const steps = [
		{ n: 'Ты', says: 'Герой в своей зоне комфорта.', vogler: 'Обычный мир', ask: 'Кто этот человек и как выглядит его обычный день?' },
		{ n: 'Нужда', says: 'Ему чего-то хочется или не хватает.', vogler: 'Зов, отказ', ask: 'Чего он хочет, чего ему не хватает?' },
		{ n: 'Уход', says: 'Он входит в незнакомую ситуацию.', vogler: 'Наставник, порог', ask: 'С чего он начинает и с кем встречается?' },
		{ n: 'Поиск', says: 'Он приспосабливается, учится, ищет.', vogler: 'Испытания, союзники', ask: 'Что ему приходится освоить?' },
		{ n: 'Находка', says: 'Он получает то, чего хотел.', vogler: 'Главное испытание, награда', ask: 'Что он получил?' },
		{ n: 'Цена', says: 'Находка обходится дорого.', vogler: 'Воскрешение (частично)', ask: 'От чего пришлось отказаться, что потерять, во что вложиться?' },
		{ n: 'Возвращение', says: 'Он возвращается туда, откуда начал.', vogler: 'Дорога назад', ask: 'Куда он возвращается?' },
		{ n: 'Перемена', says: 'Он вернулся другим.', vogler: 'Возвращение с эликсиром', ask: 'Чем он теперь отличается?' }
	];
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
	<figcaption>Круг истории и другие формы</figcaption>
	<div class="dg-ctl" role="group" aria-label="Вид схемы">
		<button type="button" aria-pressed={view === 'circle'} onclick={() => (view = 'circle')}>Круг Хармона</button>
		<button type="button" aria-pressed={view === 'shapes'} onclick={() => (view = 'shapes')}>Три формы</button>
	</div>

	{#if view === 'circle'}
		<div class="wrap">
			<svg viewBox="0 0 260 240" role="group" aria-label="Восемь шагов круга">
				<circle {cx} {cy} r={R} class="ring" fill="none" />
				<line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} class="line" />
				<text x={cx} y={cy - 8} text-anchor="middle" font-size="11">привычное</text>
				<text x={cx} y={cy + 18} text-anchor="middle" font-size="11">неизвестное</text>
				{#each steps as st, k (st.n)}
					{@const p = pos(k)}
					<g
						role="button"
						tabindex="0"
						aria-label="Шаг {k + 1}: {st.n}"
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
				<p class="dg-out">У Воглера этому примерно соответствует: {s.vogler}.</p>
				<p class="dg-out">Вопрос про вашего посетителя: {s.ask}</p>
				<div class="dg-ctl">
					<button type="button" onclick={() => (i = (i + 7) % 8)}>Назад</button>
					<button type="button" onclick={() => (i = (i + 1) % 8)}>Дальше</button>
				</div>
			</div>
		</div>
		<p class="dg-out">Круг выше линии это знакомое, ниже линии неизвестное. Шаги 3 и 7 это пересечения: уход вниз и возвращение вверх.</p>
	{:else}
		<div class="shapes">
			<div class="dg-box">
				<svg viewBox="0 0 120 70" role="img" aria-label="Линия, поднимающаяся к вершине и спадающая">
					<polyline points="5,60 45,35 70,8 95,40 115,60" fill="none" class="curve" />
				</svg>
				<p><strong>Линия к вершине.</strong> Пирамида Фрейтага, три акта: конфликт растёт и разрешается.</p>
			</div>
			<div class="dg-box">
				<svg viewBox="0 0 120 70" role="img" aria-label="Замкнутый круг">
					<circle cx="60" cy="35" r="26" fill="none" class="curve" />
				</svg>
				<p><strong>Круг.</strong> Хармон, путь героя: уходим и возвращаемся другими.</p>
			</div>
			<div class="dg-box">
				<svg viewBox="0 0 120 70" role="img" aria-label="Мешок с несколькими предметами">
					<path d="M35,25 Q60,5 85,25 L95,60 L25,60 Z" fill="none" class="curve" />
					<circle cx="50" cy="45" r="5" class="item" />
					<circle cx="68" cy="50" r="5" class="item" />
					<circle cx="60" cy="38" r="4" class="item" />
				</svg>
				<p><strong>Мешок.</strong> Так Урсула Ле Гуин называла рассказ, который собирает людей и вещи в целое, без главного поединка.</p>
			</div>
		</div>
		<p class="dg-out">Это не соревнование форм. Для истории проекта часто подойдёт любая из трёх: смотрите, что в вашем материале есть на самом деле.</p>
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
