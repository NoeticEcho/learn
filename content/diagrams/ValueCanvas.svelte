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
	import { pick } from '#lib/i18n/index.ts';

	type Pain = { text: string; weight: number };
	const W = pick({
		ru: {
			when: 'у меня в пути спустило колесо, а вечером нужно ехать на работу',
			want: 'быстро узнать, сколько стоит ремонт и успею ли я забрать велосипед сегодня',
			so: 'не потерять рабочий день и не переплатить',
			solutionWords: /кнопк|сайт|приложен|функци|страниц|форм[аеуы]\b|личн\S* кабинет|раздел/iu,
			weWords: /мы |наш[аеиу]? /iu,
			lintSolution: 'В желании спрятано решение (кнопка, сайт, форма). Опишите, чего человек хочет добиться, а не как это должно выглядеть.',
			lintWhen: 'Ситуация слишком короткая. Опишите момент: где человек, что случилось, что вокруг.',
			lintSo: '«Чтобы…» пусто: напишите, какого результата человек хочет в итоге.',
			lintWe: 'В истории появились «мы» или «наш»: она должна быть про клиента, а не про вас.',
			pains: [
				{ text: 'Не знаю, во сколько обойдётся', weight: 3 },
				{ text: 'Боюсь, что сломают ещё больше', weight: 3 },
				{ text: 'Нет времени ждать неделю', weight: 2 },
				{ text: 'Непонятно, что говорят мастера', weight: 1 }
			] as Pain[],
			relievers: ['Цена называется до начала работы', 'Гарантия на работу 30 дней, записана в чеке', 'Ремонт за один день', 'Объясняем простыми словами, без терминов'],
			capJob: 'История о работе клиента',
			capCanvas: 'Канвас ценности',
			show: 'Что показать',
			tabJob: 'Job story',
			tabCanvas: 'Канвас',
			wh: 'Когда',
			wa: 'я хочу',
			sw: 'чтобы',
			story: (a: string, b: string, c: string) => `Когда ${a}, я хочу ${b}, чтобы ${c}.`,
			good: 'История о клиенте и его работе, решение не подсказано. Хорошо.',
			note: 'Образец вымышленный (велосипедная мастерская). Замените слова своими: ситуация, цель, результат.',
			painsHead: 'Боли клиента',
			weight: 'важность',
			relieve: 'Чем снимается',
			none: 'ничем (не решаем)',
			relHead: 'Обезболивающие вашего предложения',
			open: 'Важная боль без ответа:',
			openTail: 'Либо добавьте ответ в предложение, либо честно скажите на сайте, что этого вы не делаете.',
			minor: 'Без ответа остались только мелкие боли. Это нормально, если вы это знаете и можете сказать вслух.',
			all: 'Все боли закрыты. Проверьте, не придуманы ли обезболивающие: каждое должно быть правдой.'
		},
		en: {
			when: 'my tire went flat on the way and I need to ride to work this evening',
			want: 'find out quickly what the repair costs and whether I can pick the bike up today',
			so: 'not lose a working day and not overpay',
			solutionWords: /\b(?:button|website|site|app|application|feature|page|form|dashboard|portal|section|account)\b/iu,
			weWords: /\b(?:we|our|ours|us)\b/iu,
			lintSolution: 'A solution is hidden in the wish (a button, a site, a form). Describe what the person wants to achieve, not how it should look.',
			lintWhen: 'The situation is too short. Describe the moment: where the person is, what happened, what is around.',
			lintSo: '“So that…” is empty: write what result the person wants in the end.',
			lintWe: 'The story has “we” or “our” in it: it should be about the customer, not about you.',
			pains: [
				{ text: 'I don’t know what it will cost', weight: 3 },
				{ text: 'I’m afraid they’ll break it even more', weight: 3 },
				{ text: 'I haven’t got time to wait a week', weight: 2 },
				{ text: 'I can’t follow what the mechanics say', weight: 1 }
			] as Pain[],
			relievers: ['The price is named before work starts', 'A 30-day guarantee on the work, printed on the receipt', 'Repair in one day', 'We explain in plain words, without jargon'],
			capJob: 'A customer’s job story',
			capCanvas: 'The value canvas',
			show: 'What to show',
			tabJob: 'Job story',
			tabCanvas: 'Canvas',
			wh: 'When',
			wa: 'I want to',
			sw: 'so that',
			story: (a: string, b: string, c: string) => `When ${a}, I want to ${b}, so that ${c}.`,
			good: 'A story about the customer and their job, with no solution suggested. Good.',
			note: 'The sample is invented (a bicycle workshop). Replace the words with your own: situation, goal, result.',
			painsHead: 'Customer pains',
			weight: 'importance',
			relieve: 'Relieved by',
			none: 'nothing (we don’t solve it)',
			relHead: 'Pain relievers of your offer',
			open: 'An important pain with no answer:',
			openTail: 'Either add an answer to the offer, or say honestly on the site that you don’t do this.',
			minor: 'Only minor pains are left without an answer. That is fine if you know it and can say it aloud.',
			all: 'Every pain is covered. Check that the relievers aren’t invented: each must be true.'
		}
	});

	let tab = $state<'job' | 'canvas'>('job');

	// job story
	let when = $state(W.when);
	let want = $state(W.want);
	let so = $state(W.so);
	const lint = $derived.by(() => {
		const out: string[] = [];
		if (W.solutionWords.test(want)) out.push(W.lintSolution);
		if (when.trim().split(/\s+/).filter(Boolean).length < 4) out.push(W.lintWhen);
		if (so.trim().split(/\s+/).filter(Boolean).length < 3) out.push(W.lintSo);
		if (W.weWords.test(`${when} ${want} ${so}`)) out.push(W.lintWe);
		return out;
	});

	// canvas
	const pains = W.pains;
	const relievers = W.relievers;
	let link = $state<(number | null)[]>([0, 1, 2, null]);
	const open = $derived(pains.map((p, i) => ({ ...p, i })).filter((p) => link[p.i] === null));
	const worst = $derived(open.filter((p) => p.weight >= 2));
</script>

<figure class="dg">
	<figcaption>{tab === 'job' ? W.capJob : W.capCanvas}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.show}>
		<button type="button" role="tab" aria-selected={tab === 'job'} onclick={() => (tab = 'job')}>{W.tabJob}</button>
		<button type="button" role="tab" aria-selected={tab === 'canvas'} onclick={() => (tab = 'canvas')}>{W.tabCanvas}</button>
	</div>

	{#if tab === 'job'}
		<div class="f">
			<label>{W.wh} <input type="text" bind:value={when} /></label>
			<label>{W.wa} <input type="text" bind:value={want} /></label>
			<label>{W.sw} <input type="text" bind:value={so} /></label>
		</div>
		<p class="dg-box story">{W.story(when, want, so)}</p>
		<ul class="lint" aria-live="polite">
			{#each lint as l (l)}<li>{l}</li>{/each}
			{#if lint.length === 0}<li class="good">{W.good}</li>{/if}
		</ul>
		<p class="dg-out">{W.note}</p>
	{:else}
		<div class="cols">
			<div>
				<div class="dh">{W.painsHead}</div>
				<ol class="pains">
					{#each pains as p, i (i)}
						<li class:open={link[i] === null}>
							<span class="w" title={W.weight}>{'●'.repeat(p.weight)}</span> {p.text}
							<label class="sel">
								{W.relieve}
								<select bind:value={link[i]}>
									<option value={null}>{W.none}</option>
									{#each relievers as r, j (j)}<option value={j}>{r}</option>{/each}
								</select>
							</label>
						</li>
					{/each}
				</ol>
			</div>
			<div>
				<div class="dh">{W.relHead}</div>
				<ul class="rel">
					{#each relievers as r, j (j)}
						<li class:used={link.includes(j)}>{r}</li>
					{/each}
				</ul>
			</div>
		</div>
		<p class="dg-out" aria-live="polite">
			{#if worst.length}
				{W.open} <strong>{worst.map((p) => p.text.toLowerCase()).join('; ')}</strong>. {W.openTail}
			{:else if open.length}
				{W.minor}
			{:else}
				{W.all}
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
