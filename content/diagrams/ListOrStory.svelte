<!--
	«Список или рассказ» (part 12, lesson 1). The same six facts about an invented café, given as a
	bulleted list or as a short scene. The reader picks a version, reads it, hides it and answers
	three questions from memory. It is a self-experiment, not a study: the counter only shows what
	this reader remembered, and the lesson says so.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Mode = 'list' | 'story';
	let mode = $state<Mode>('list');
	let phase = $state<'read' | 'ask' | 'done'>('read');
	let picked = $state<Record<string, number | null>>({ year: null, hour: null, beans: null });
	let tally = $state<Record<Mode, number | null>>({ list: null, story: null });

	const W = pick({
		ru: {
			questions: [
				{ id: 'year', ask: 'В каком году открылась кофейня?', options: ['2017', '2019', '2021'], right: 1 },
				{ id: 'hour', ask: 'С какого часа утром пекут хлеб?', options: ['с 4', 'с 6', 'с 8'], right: 1 },
				{ id: 'beans', ask: 'Где обжаривают зерно?', options: ['в соседнем городе', 'в подвале того же дома', 'на складе за рекой'], right: 1 }
			],
			list: [
				'Кофейня «Пристань» открылась в 2019 году.',
				'Хлеб пекут с 6 утра.',
				'Зерно обжаривают в подвале того же дома.',
				'Окна выходят на реку.',
				'В меню четырнадцать видов кофе.',
				'Есть веранда на двадцать мест.'
			],
			story:
				'В марте 2019 года Анна в первый раз включила печь в подвале дома у реки. Хлеб ещё не поднялся, а у двери уже стояли соседи: они почувствовали запах с улицы. С тех пор печь включают в 6 утра, а зерно обжаривают там же, внизу, чтобы запах поднимался вместе с хлебом. Из окон видна река, на веранде двадцать мест, и из четырнадцати видов кофе завсегдатаи всё равно берут один и тот же.',
			caption: 'Одни и те же факты: списком и рассказом',
			group: 'Версия текста',
			listBtn: 'Список',
			storyBtn: 'Рассказ',
			readOnce: 'Прочитайте один раз, не торопясь. Потом нажмите кнопку: текст скроется, и вам зададут три вопроса.',
			hide: 'Спрятать и проверить себя',
			show: 'Показать результат',
			version: (m: Mode) => (m === 'list' ? 'список' : 'рассказ'),
			scored: (v: string) => `Версия «${v}»: вы вспомнили `,
			outOf: (n: number) => `${n} из 3`,
			again:
				'Попробуйте другую версию: нажмите её кнопку вверху. Результат одного человека ничего не доказывает, ведь второй раз вы уже знаете ответы. Лучше дать одну версию другу, а другую другому, и сравнить.',
			listRow: 'Список: ',
			storyRow: 'Рассказ: ',
			untried: 'не пробовали'
		},
		en: {
			questions: [
				{ id: 'year', ask: 'In what year did the café open?', options: ['2017', '2019', '2021'], right: 1 },
				{ id: 'hour', ask: 'From what time in the morning is the bread baked?', options: ['from 4 a.m.', 'from 6 a.m.', 'from 8 a.m.'], right: 1 },
				{ id: 'beans', ask: 'Where are the beans roasted?', options: ['in a nearby town', 'in the basement of the same building', 'in a warehouse across the river'], right: 1 }
			],
			list: [
				'The Quay café opened in 2019.',
				'The bread is baked from 6 a.m.',
				'The beans are roasted in the basement of the same building.',
				'The windows face the river.',
				'The menu has fourteen kinds of coffee.',
				'There is a terrace with twenty seats.'
			],
			story:
				'In March 2019 Anna lit the oven for the first time, in the basement of a house by the river. The bread hadn’t risen yet, and neighbors were already standing at the door: they’d smelled it from the street. Since then the oven has gone on at 6 a.m., and the beans are roasted down there too, so the smell rises with the bread. The windows look onto the river, the terrace seats twenty, and out of fourteen kinds of coffee the regulars still order the same one.',
			caption: 'The same facts: as a list and as a story',
			group: 'Version of the text',
			listBtn: 'List',
			storyBtn: 'Story',
			readOnce: 'Read it once, without hurrying. Then press the button: the text disappears and you’ll be asked three questions.',
			hide: 'Hide it and test myself',
			show: 'Show the result',
			version: (m: Mode) => (m === 'list' ? 'list' : 'story'),
			scored: (v: string) => `The “${v}” version: you remembered `,
			outOf: (n: number) => `${n} out of 3`,
			again:
				'Try the other version: press its button above. One person’s result proves nothing, because the second time you already know the answers. It’s better to give one version to a friend and the other to someone else, and compare.',
			listRow: 'List: ',
			storyRow: 'Story: ',
			untried: 'not tried'
		}
	});
	const questions = W.questions;

	const score = $derived(questions.filter((q) => picked[q.id] === q.right).length);

	function start(m: Mode) {
		mode = m;
		phase = 'read';
		picked = { year: null, hour: null, beans: null };
	}
	function finish() {
		tally[mode] = score;
		phase = 'done';
	}
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>

	<div class="dg-ctl" role="group" aria-label={W.group}>
		<button type="button" aria-pressed={mode === 'list'} onclick={() => start('list')}>{W.listBtn}</button>
		<button type="button" aria-pressed={mode === 'story'} onclick={() => start('story')}>{W.storyBtn}</button>
	</div>

	{#if phase === 'read'}
		<div class="dg-box text">
			{#if mode === 'list'}
				<ul>
					{#each W.list as item (item)}
						<li>{item}</li>
					{/each}
				</ul>
			{:else}
				<p>{W.story}</p>
			{/if}
		</div>
		<p class="dg-out">{W.readOnce}</p>
		<div class="dg-ctl"><button type="button" onclick={() => (phase = 'ask')}>{W.hide}</button></div>
	{:else if phase === 'ask'}
		{#each questions as q (q.id)}
			<fieldset class="q">
				<legend>{q.ask}</legend>
				{#each q.options as o, i (o)}
					<label><input type="radio" name={q.id} checked={picked[q.id] === i} onchange={() => (picked[q.id] = i)} /> {o}</label>
				{/each}
			</fieldset>
		{/each}
		<div class="dg-ctl"><button type="button" onclick={finish} disabled={Object.values(picked).some((v) => v === null)}>{W.show}</button></div>
	{:else}
		<p class="dg-out" aria-live="polite">
			{W.scored(W.version(mode))}<strong>{W.outOf(score)}</strong>.
		</p>
		<p class="dg-out">{W.again}</p>
		<ul class="dg-out">
			<li>{W.listRow}{tally.list === null ? W.untried : W.outOf(tally.list)}</li>
			<li>{W.storyRow}{tally.story === null ? W.untried : W.outOf(tally.story)}</li>
		</ul>
	{/if}
</figure>

<style>
	.text {
		max-width: var(--measure);
	}
	.text p {
		margin: 0;
	}
	.q {
		margin: 0 0 var(--space-3);
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.q legend {
		padding: 0 var(--space-2);
		color: var(--text-primary);
	}
	.q label {
		margin-right: var(--space-4);
	}
</style>
