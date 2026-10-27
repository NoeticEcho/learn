<!--
	«Двенадцать шагов пути героя» (part 12, lesson 3). Vogler's twelve stages in a ring, with the
	hero cast as the visitor and the project as the guide, using the person's own brief for the
	names. Each step says what it is in a story and where it lives on a site. The wording is ours.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	const steps = [
		{ act: 1, name: 'Обычный мир', story: 'Герой живёт, как жил, и мы видим, чего ему не хватает.', site: 'Первый экран: узнаваемая ситуация посетителя.' },
		{ act: 1, name: 'Зов', story: 'Что-то случается, и прежняя жизнь больше не годится.', site: 'Заголовок о событии: «сосед сдвинул забор», «закончился договор».' },
		{ act: 1, name: 'Отказ', story: 'Герой сомневается: дорого, страшно, само пройдёт.', site: 'Возражения: честный ответ на «а вдруг не получится».' },
		{ act: 1, name: 'Наставник', story: 'Появляется тот, у кого есть опыт и план.', site: 'Здесь входите вы: коротко, со знанием дела.' },
		{ act: 1, name: 'Порог', story: 'Герой решается и делает первый шаг.', site: 'Главное действие: кнопка, звонок, заявка.' },
		{ act: 2, name: 'Испытания и союзники', story: 'Первые трудности, первая помощь.', site: 'Как проходит работа: шаги и кто участвует.' },
		{ act: 2, name: 'Подход к пещере', story: 'Подготовка к самому трудному.', site: 'Что нужно от клиента, какие документы и сроки.' },
		{ act: 2, name: 'Главное испытание', story: 'Самое трудное: решающий момент.', site: 'Сердце кейса: что именно было сложно.' },
		{ act: 2, name: 'Награда', story: 'Герой получает то, ради чего шёл.', site: 'Результат, названный конкретно.' },
		{ act: 3, name: 'Дорога назад', story: 'Возвращение, последствия победы.', site: 'Что дальше после результата.' },
		{ act: 3, name: 'Воскрешение', story: 'Последняя проверка: герой доказывает, что изменился.', site: 'Устойчивость результата: гарантии без обещаний, правила.' },
		{ act: 3, name: 'Возвращение с эликсиром', story: 'Герой приходит домой другим и приносит пользу.', site: 'Новая жизнь клиента; призыв повторить его путь.' }
	];

	let i = $state(0);
	let brief = $state({ title: 'Ваш проект', forWhom: 'Тот, для кого он' });

	onMount(async () => {
		try {
			const learner = await import('#lib/learner.ts');
			const p = await learner.persona();
			brief = { title: p.title, forWhom: p.forWhom };
		} catch {
			/* the example words stay */
		}
	});

	const R = 110;
	const cx = 150;
	const cy = 140;
	const pos = (k: number) => {
		const a = (k / steps.length) * 2 * Math.PI - Math.PI / 2;
		return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
	};
	const s = $derived(steps[i]);
</script>

<figure class="dg">
	<figcaption>Путь героя: 12 шагов и три акта</figcaption>
	<div class="wrap">
		<svg viewBox="0 0 300 280" role="group" aria-label="Двенадцать шагов по кругу">
			<circle {cx} {cy} r={R} class="ring" fill="none" />
			{#each steps as st, k (st.name)}
				{@const p = pos(k)}
				<g
					role="button"
					tabindex="0"
					aria-label="Шаг {k + 1}: {st.name}"
					aria-pressed={k === i}
					onclick={() => (i = k)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && ((i = k), e.preventDefault())}
				>
					<circle cx={p.x} cy={p.y} r="15" class="node act{st.act}" class:on={k === i} />
					<text x={p.x} y={p.y + 4} text-anchor="middle" font-size="12">{k + 1}</text>
				</g>
			{/each}
			<text x={cx} y={cy - 4} text-anchor="middle" font-size="12">герой: ваш посетитель</text>
			<text x={cx} y={cy + 14} text-anchor="middle" font-size="12">вы: наставник</text>
		</svg>
		<div class="detail" aria-live="polite">
			<p class="dg-out"><strong>{i + 1}. {s.name}</strong> (акт {s.act})</p>
			<p class="dg-out">В истории: {s.story}</p>
			<p class="dg-out">На сайте: {s.site}</p>
			<div class="dg-ctl">
				<button type="button" onclick={() => (i = (i + steps.length - 1) % steps.length)}>Назад</button>
				<button type="button" onclick={() => (i = (i + 1) % steps.length)}>Дальше</button>
			</div>
		</div>
	</div>
	<p class="dg-out">Герой этой истории: <strong>{brief.forWhom}</strong>. Наставник: <strong>{brief.title}</strong>.</p>
</figure>

<style>
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
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
	.ring {
		stroke: var(--border-rule);
	}
	.node {
		fill: var(--surface-canvas);
		stroke: var(--border-rule);
		stroke-width: 2;
		cursor: pointer;
	}
	.node.act2 {
		stroke-dasharray: 3 2;
	}
	.node.act3 {
		stroke-width: 3;
	}
	.node.on {
		stroke: var(--accent-measure);
		fill: var(--surface-body);
	}
	g:focus-visible .node {
		stroke: var(--accent-measure);
		stroke-width: 4;
	}
	g {
		outline: none;
	}
</style>
