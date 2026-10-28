<!--
	«Двенадцать шагов пути героя» (part 12, lesson 3). Vogler's twelve stages in a ring, with the
	hero cast as the visitor and the project as the guide, using the person's own brief for the
	names. Each step says what it is in a story and where it lives on a site. The wording is ours.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			steps: [
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
			],
			example: { title: 'Ваш проект', forWhom: 'Тот, для кого он' },
			caption: 'Путь героя: 12 шагов и три акта',
			ring: 'Двенадцать шагов по кругу',
			stepLabel: (k: number, n: string) => `Шаг ${k}: ${n}`,
			heroIs: 'герой: ваш посетитель',
			youAre: 'вы: наставник',
			act: (n: number) => `(акт ${n})`,
			inStory: 'В истории: ',
			onSite: 'На сайте: ',
			back: 'Назад',
			next: 'Дальше',
			hero: 'Герой этой истории: ',
			mentor: 'Наставник: '
		},
		en: {
			steps: [
				{ act: 1, name: 'Ordinary world', story: 'The hero lives as they always have, and we see what they lack.', site: 'The first screen: the visitor’s recognizable situation.' },
				{ act: 1, name: 'Call to adventure', story: 'Something happens, and the old life no longer fits.', site: 'A headline about the event: “a neighbor moved the fence”, “the contract ran out”.' },
				{ act: 1, name: 'Refusal of the call', story: 'The hero hesitates: too expensive, too scary, it may pass.', site: 'Objections: an honest answer to “what if it doesn’t work?”.' },
				{ act: 1, name: 'Meeting the mentor', story: 'Someone arrives with experience and a plan.', site: 'This is where you come in: briefly, and with knowledge.' },
				{ act: 1, name: 'Crossing the threshold', story: 'The hero decides and takes the first step.', site: 'The main action: a button, a call, a request.' },
				{ act: 2, name: 'Tests, allies, enemies', story: 'The first difficulties, the first help.', site: 'How the work goes: the steps and who takes part.' },
				{ act: 2, name: 'Approach to the cave', story: 'Preparing for the hardest part.', site: 'What the client has to bring: documents and deadlines.' },
				{ act: 2, name: 'The ordeal', story: 'The hardest part: the deciding moment.', site: 'The heart of a case study: what exactly was difficult.' },
				{ act: 2, name: 'Reward', story: 'The hero gets what they came for.', site: 'The result, named specifically.' },
				{ act: 3, name: 'The road back', story: 'The way home, and the consequences of the victory.', site: 'What comes after the result.' },
				{ act: 3, name: 'Resurrection', story: 'A last test: the hero proves they have changed.', site: 'How lasting the result is: guarantees without promises, the rules.' },
				{ act: 3, name: 'Return with the elixir', story: 'The hero comes home changed and brings something of use.', site: 'The client’s new life; an invitation to follow the same path.' }
			],
			example: { title: 'Your project', forWhom: 'The people it is for' },
			caption: 'The hero’s journey: 12 steps and three acts',
			ring: 'Twelve steps in a ring',
			stepLabel: (k: number, n: string) => `Step ${k}: ${n}`,
			heroIs: 'hero: your visitor',
			youAre: 'you: the mentor',
			act: (n: number) => `(act ${n})`,
			inStory: 'In the story: ',
			onSite: 'On the site: ',
			back: 'Back',
			next: 'Next',
			hero: 'The hero of this story: ',
			mentor: 'The mentor: '
		}
	});
	const steps = W.steps;

	let i = $state(0);
	let brief = $state({ ...W.example });

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
	<figcaption>{W.caption}</figcaption>
	<div class="wrap">
		<svg viewBox="0 0 300 280" role="group" aria-label={W.ring}>
			<circle {cx} {cy} r={R} class="ring" fill="none" />
			{#each steps as st, k (st.name)}
				{@const p = pos(k)}
				<g
					role="button"
					tabindex="0"
					aria-label={W.stepLabel(k + 1, st.name)}
					aria-pressed={k === i}
					onclick={() => (i = k)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && ((i = k), e.preventDefault())}
				>
					<circle cx={p.x} cy={p.y} r="15" class="node act{st.act}" class:on={k === i} />
					<text x={p.x} y={p.y + 4} text-anchor="middle" font-size="12">{k + 1}</text>
				</g>
			{/each}
			<text x={cx} y={cy - 4} text-anchor="middle" font-size="12">{W.heroIs}</text>
			<text x={cx} y={cy + 14} text-anchor="middle" font-size="12">{W.youAre}</text>
		</svg>
		<div class="detail" aria-live="polite">
			<p class="dg-out"><strong>{i + 1}. {s.name}</strong> {W.act(s.act)}</p>
			<p class="dg-out">{W.inStory}{s.story}</p>
			<p class="dg-out">{W.onSite}{s.site}</p>
			<div class="dg-ctl">
				<button type="button" onclick={() => (i = (i + steps.length - 1) % steps.length)}>{W.back}</button>
				<button type="button" onclick={() => (i = (i + 1) % steps.length)}>{W.next}</button>
			</div>
		</div>
	</div>
	<p class="dg-out">{W.hero}<strong>{brief.forWhom}</strong>. {W.mentor}<strong>{brief.title}</strong>.</p>
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
