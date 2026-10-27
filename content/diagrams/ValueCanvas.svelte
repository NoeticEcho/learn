<!--
	«Работа и канвас ценности» (part 11, lesson 4), two tabs.
	1. A job story («когда…, я хочу…, чтобы…») built from three fields, with a lint that notices
	   the two usual slips: a solution smuggled into the wish, and a situation that is not one.
	2. The Value Proposition Canvas of a made-up bicycle workshop: the customer's pains on the left
	   (with how much each matters), the pain relievers on the right. The person connects each pain
	   to a reliever or to nothing; an important pain left unanswered is marked, because an honest
	   canvas says what the offer does not solve.
-->
<script lang="ts">
	import './shared.css';

	let tab = $state<'job' | 'canvas'>('job');

	// job story
	let when = $state('у меня в пути спустило колесо, а вечером нужно ехать на работу');
	let want = $state('быстро узнать, сколько стоит ремонт и успею ли я забрать велосипед сегодня');
	let so = $state('не потерять рабочий день и не переплатить');
	const solutionWords = /кнопк|сайт|приложен|функци|страниц|форм[аеуы]\b|личн\S* кабинет|раздел/iu;
	const lint = $derived.by(() => {
		const out: string[] = [];
		if (solutionWords.test(want)) out.push('В желании спрятано решение (кнопка, сайт, форма). Опишите, чего человек хочет добиться, а не как это должно выглядеть.');
		if (when.trim().split(/\s+/).filter(Boolean).length < 4) out.push('Ситуация слишком короткая. Опишите момент: где человек, что случилось, что вокруг.');
		if (so.trim().split(/\s+/).filter(Boolean).length < 3) out.push('«Чтобы…» пусто: напишите, какого результата человек хочет в итоге.');
		if (/мы |наш[аеиу]? /iu.test(`${when} ${want} ${so}`)) out.push('В истории появились «мы» или «наш»: она должна быть про клиента, а не про вас.');
		return out;
	});

	// canvas
	const pains = [
		{ text: 'Не знаю, во сколько обойдётся', weight: 3 },
		{ text: 'Боюсь, что сломают ещё больше', weight: 3 },
		{ text: 'Нет времени ждать неделю', weight: 2 },
		{ text: 'Непонятно, что говорят мастера', weight: 1 }
	];
	const relievers = ['Цена называется до начала работы', 'Гарантия на работу 30 дней, записана в чеке', 'Ремонт за один день', 'Объясняем простыми словами, без терминов'];
	let link = $state<(number | null)[]>([0, 1, 2, null]);
	const open = $derived(pains.map((p, i) => ({ ...p, i })).filter((p) => link[p.i] === null));
	const worst = $derived(open.filter((p) => p.weight >= 2));
</script>

<figure class="dg">
	<figcaption>{tab === 'job' ? 'История о работе клиента' : 'Канвас ценности'}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Что показать">
		<button type="button" role="tab" aria-selected={tab === 'job'} onclick={() => (tab = 'job')}>Job story</button>
		<button type="button" role="tab" aria-selected={tab === 'canvas'} onclick={() => (tab = 'canvas')}>Канвас</button>
	</div>

	{#if tab === 'job'}
		<div class="f">
			<label>Когда <input type="text" bind:value={when} /></label>
			<label>я хочу <input type="text" bind:value={want} /></label>
			<label>чтобы <input type="text" bind:value={so} /></label>
		</div>
		<p class="dg-box story">Когда {when}, я хочу {want}, чтобы {so}.</p>
		<ul class="lint" aria-live="polite">
			{#each lint as l (l)}<li>{l}</li>{/each}
			{#if lint.length === 0}<li class="good">История о клиенте и его работе, решение не подсказано. Хорошо.</li>{/if}
		</ul>
		<p class="dg-out">Образец вымышленный (велосипедная мастерская). Замените слова своими: ситуация, цель, результат.</p>
	{:else}
		<div class="cols">
			<div>
				<div class="dh">Боли клиента</div>
				<ol class="pains">
					{#each pains as p, i (i)}
						<li class:open={link[i] === null}>
							<span class="w" title="важность">{'●'.repeat(p.weight)}</span> {p.text}
							<label class="sel">
								Чем снимается
								<select bind:value={link[i]}>
									<option value={null}>ничем (не решаем)</option>
									{#each relievers as r, j (j)}<option value={j}>{r}</option>{/each}
								</select>
							</label>
						</li>
					{/each}
				</ol>
			</div>
			<div>
				<div class="dh">Обезболивающие вашего предложения</div>
				<ul class="rel">
					{#each relievers as r, j (j)}
						<li class:used={link.includes(j)}>{r}</li>
					{/each}
				</ul>
			</div>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if worst.length}
				Важная боль без ответа: <strong>{worst.map((p) => p.text.toLowerCase()).join('; ')}</strong>. Либо добавьте ответ в предложение, либо честно скажите на сайте, что этого вы не делаете.
			{:else if open.length}
				Без ответа остались только мелкие боли. Это нормально, если вы это знаете и можете сказать вслух.
			{:else}
				Все боли закрыты. Проверьте, не придуманы ли обезболивающие: каждое должно быть правдой.
			{/if}
		</p>
	{/if}
</figure>

<style>
	.f {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	.f label {
		display: grid;
		gap: var(--space-1);
	}
	.f input,
	.sel select {
		padding: var(--space-2) var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
	}
	.story {
		margin: 0 0 var(--space-3);
		color: var(--text-primary);
	}
	.lint {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.lint li {
		padding-left: var(--space-3);
		border-left: 3px solid #d9534f;
	}
	.lint li.good {
		border-left-color: var(--accent-state-text);
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-weight: var(--weight-medium);
		color: var(--text-primary);
	}
	.pains,
	.rel {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0;
	}
	.pains li,
	.rel li {
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.pains li.open {
		border-color: #d9534f;
	}
	.rel li.used {
		border-color: var(--accent-state-text);
	}
	.w {
		color: var(--text-secondary);
		letter-spacing: 0.1em;
	}
	.sel {
		display: grid;
		gap: var(--space-1);
		margin-top: var(--space-2);
		color: var(--text-secondary);
	}
</style>
