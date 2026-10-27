<!--
	«Список или рассказ» (part 12, lesson 1). The same six facts about an invented café, given as a
	bulleted list or as a short scene. The reader picks a version, reads it, hides it and answers
	three questions from memory. It is a self-experiment, not a study: the counter only shows what
	this reader remembered, and the lesson says so.
-->
<script lang="ts">
	import './shared.css';

	type Mode = 'list' | 'story';
	let mode = $state<Mode>('list');
	let phase = $state<'read' | 'ask' | 'done'>('read');
	let picked = $state<Record<string, number | null>>({ year: null, hour: null, beans: null });
	let tally = $state<Record<Mode, number | null>>({ list: null, story: null });

	const questions = [
		{ id: 'year', ask: 'В каком году открылась кофейня?', options: ['2017', '2019', '2021'], right: 1 },
		{ id: 'hour', ask: 'С какого часа утром пекут хлеб?', options: ['с 4', 'с 6', 'с 8'], right: 1 },
		{ id: 'beans', ask: 'Где обжаривают зерно?', options: ['в соседнем городе', 'в подвале того же дома', 'на складе за рекой'], right: 1 }
	];

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
	<figcaption>Одни и те же факты: списком и рассказом</figcaption>

	<div class="dg-ctl" role="group" aria-label="Версия текста">
		<button type="button" aria-pressed={mode === 'list'} onclick={() => start('list')}>Список</button>
		<button type="button" aria-pressed={mode === 'story'} onclick={() => start('story')}>Рассказ</button>
	</div>

	{#if phase === 'read'}
		<div class="dg-box text">
			{#if mode === 'list'}
				<ul>
					<li>Кофейня «Пристань» открылась в 2019 году.</li>
					<li>Хлеб пекут с 6 утра.</li>
					<li>Зерно обжаривают в подвале того же дома.</li>
					<li>Окна выходят на реку.</li>
					<li>В меню четырнадцать видов кофе.</li>
					<li>Есть веранда на двадцать мест.</li>
				</ul>
			{:else}
				<p>
					В марте 2019 года Анна в первый раз включила печь в подвале дома у реки. Хлеб ещё не поднялся, а у двери уже стояли соседи:
					они почувствовали запах с улицы. С тех пор печь включают в 6 утра, а зерно обжаривают там же, внизу, чтобы запах
					поднимался вместе с хлебом. Из окон видна река, на веранде двадцать мест, и из четырнадцати видов кофе завсегдатаи
					всё равно берут один и тот же.
				</p>
			{/if}
		</div>
		<p class="dg-out">Прочитайте один раз, не торопясь. Потом нажмите кнопку: текст скроется, и вам зададут три вопроса.</p>
		<div class="dg-ctl"><button type="button" onclick={() => (phase = 'ask')}>Спрятать и проверить себя</button></div>
	{:else if phase === 'ask'}
		{#each questions as q (q.id)}
			<fieldset class="q">
				<legend>{q.ask}</legend>
				{#each q.options as o, i (o)}
					<label><input type="radio" name={q.id} checked={picked[q.id] === i} onchange={() => (picked[q.id] = i)} /> {o}</label>
				{/each}
			</fieldset>
		{/each}
		<div class="dg-ctl"><button type="button" onclick={finish} disabled={Object.values(picked).some((v) => v === null)}>Показать результат</button></div>
	{:else}
		<p class="dg-out" aria-live="polite">
			Версия «{mode === 'list' ? 'список' : 'рассказ'}»: вы вспомнили <strong>{score} из 3</strong>.
		</p>
		<p class="dg-out">
			Попробуйте другую версию: нажмите её кнопку вверху. Результат одного человека ничего не доказывает, ведь второй раз вы уже знаете ответы.
			Лучше дать одну версию другу, а другую другому, и сравнить.
		</p>
		<ul class="dg-out">
			<li>Список: {tally.list === null ? 'не пробовали' : `${tally.list} из 3`}</li>
			<li>Рассказ: {tally.story === null ? 'не пробовали' : `${tally.story} из 3`}</li>
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
