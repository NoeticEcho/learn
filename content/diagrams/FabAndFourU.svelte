<!--
	«Мастерская FAB и 4U» (part 11, lesson 3), two tabs.
	1. FAB: six statements about a made-up bicycle workshop. The person says for each whether it is
	   a feature (what the thing is), an advantage (what it allows) or a benefit (what the person
	   gets), and is told why: the usual slip is to give a feature as a benefit.
	2. 4U: headlines scored 0–3 on being urgent, unique, ultra-specific and useful, summed to 12.
	   A high score for urgency or uniqueness raises a warning: those two are the ones people fake.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Kind = 'f' | 'a' | 'b';
	type Row = { text: string; u: [number, number, number, number]; note: string };
	type Item = { text: string; right: Kind; why: string };
	const W = pick({
		ru: {
			kinds: { f: 'Свойство', a: 'Преимущество', b: 'Выгода' } as Record<Kind, string>,
			items: [
		{ text: 'Камера из бутилкаучука, стенка 1 мм', right: 'f', why: 'Это описание самой вещи: из чего она и какой толщины. Читателю ещё ничего не сказано о том, что ему это даёт.' },
		{ text: 'Воздух в камере держится неделями', right: 'a', why: 'Это то, что свойство позволяет делать лучше обычного. Но это ещё «что умеет вещь», а не «что получит человек».' },
		{ text: 'Не нужно подкачивать колесо перед каждой поездкой', right: 'b', why: 'Это уже жизнь человека: ему меньше возни. На такую фразу читатель откликается: «и что мне с этого» отвечено.' },
		{ text: 'Мастерская открыта до 20:00', right: 'f', why: 'Факт об устройстве работы. Пока не сказано, что он значит для клиента.' },
		{ text: 'Привезти велосипед можно после работы', right: 'a', why: 'Это то, что часы работы позволяют. До выгоды остаётся один шаг: что человек получает от этого.' },
		{ text: 'Не придётся брать отгул ради ремонта', right: 'b', why: 'Выгода: описана ситуация человека, а не мастерской.' }
	] as Item[],
			rows: [
		{ text: 'Лучший ремонт велосипедов в городе, только сегодня!', u: [3, 2, 0, 1], note: 'Образец «как не надо»: срочность и уникальность выдуманы, конкретики нет.' },
		{ text: 'Замена камеры за 20 минут, 400 ₽: запись до 17:00 в будни', u: [1, 0, 3, 3], note: 'Конкретно и полезно. Срочность настоящая: запись правда принимают до 17:00.' },
		{ text: 'Ремонт велосипедов', u: [0, 0, 0, 1], note: 'Называет предмет и больше ничего. Безопасно, но слабо.' },
		{ text: '', u: [0, 0, 0, 0], note: 'Ваш заголовок: впишите и оцените честно.' }
	] as Row[],
			names: ['Срочно', 'Уникально', 'Конкретно', 'Полезно'],
			capFab: 'Свойство, преимущество, выгода',
			cap4u: 'Заголовок по 4U',
			show: 'Что показать',
			introFab: 'Про каждую фразу скажите, что это. Подсказка: спросите «и что мне с этого?»; если ответ ещё нужен, это не выгода.',
			quote: (t: string) => `«${t}»`,
			kindOf: (t: string) => `Что это за фраза: ${t}`,
			right: 'Верно.',
			no: (k: string) => `Нет, это ${k}.`,
			correct: 'Верно:',
			of: 'из',
			intro4u: 'Оцените каждый заголовок по четырём критериям от 0 до 3. Последняя строка ваша.',
			own: 'Ваш заголовок',
			placeholder: 'Впишите заголовок',
			range: (n: string) => `${n}, от 0 до 3`,
			sum: 'Сумма:',
			outOf: 'из 12.',
			warn: 'Срочность и уникальность выше 1: проверьте, что это правда и что вы можете это доказать. Выдуманный срок и «единственный в городе» обманывают читателя.'
		},
		en: {
			kinds: { f: 'Feature', a: 'Advantage', b: 'Benefit' } as Record<Kind, string>,
			items: [
				{ text: 'Inner tube of butyl rubber, 1 mm wall', right: 'f', why: 'This describes the thing itself: what it is made of and how thick. The reader has not yet been told what it gives them.' },
				{ text: 'The air stays in for weeks', right: 'a', why: 'This is what the feature lets it do better than usual. But it is still “what the thing can do”, not “what the person gets”.' },
				{ text: 'You don’t have to pump the tire before every ride', right: 'b', why: 'Now it is the person’s life: less fuss for them. A reader responds to a line like this: “what’s in it for me” is answered.' },
				{ text: 'The workshop is open until 8 p.m.', right: 'f', why: 'A fact about how the work is organized. It doesn’t yet say what it means for the customer.' },
				{ text: 'You can bring your bike in after work', right: 'a', why: 'This is what the opening hours allow. One step is left before the benefit: what the person gets from it.' },
				{ text: 'You won’t need to take a day off for a repair', right: 'b', why: 'A benefit: it describes the person’s situation, not the workshop’s.' }
			] as Item[],
			rows: [
				{ text: 'The best bike repair in town, today only!', u: [3, 2, 0, 1], note: 'A “how not to” sample: the urgency and uniqueness are made up, and there is nothing specific.' },
				{ text: 'Inner tube replaced in 20 minutes, $12: book by 5 p.m. on weekdays', u: [1, 0, 3, 3], note: 'Specific and useful. The urgency is real: bookings really are taken until 5 p.m.' },
				{ text: 'Bicycle repair', u: [0, 0, 0, 1], note: 'It names the subject and nothing more. Safe, but weak.' },
				{ text: '', u: [0, 0, 0, 0], note: 'Your headline: type it in and score it honestly.' }
			] as Row[],
			names: ['Urgent', 'Unique', 'Ultra-specific', 'Useful'],
			capFab: 'Feature, advantage, benefit',
			cap4u: 'A headline by the 4 U’s',
			show: 'What to show',
			introFab: 'Say what each phrase is. A hint: ask “what’s in it for me?”; if the answer is still needed, it is not a benefit.',
			quote: (t: string) => `“${t}”`,
			kindOf: (t: string) => `What kind of phrase this is: ${t}`,
			right: 'Right.',
			no: (k: string) => `No, this is a ${k}.`,
			correct: 'Right:',
			of: 'of',
			intro4u: 'Score each headline on four criteria from 0 to 3. The last row is yours.',
			own: 'Your headline',
			placeholder: 'Type a headline',
			range: (n: string) => `${n}, from 0 to 3`,
			sum: 'Total:',
			outOf: 'out of 12.',
			warn: 'Urgency or uniqueness above 1: check that it is true and that you can prove it. A made-up deadline or “the only one in town” deceives the reader.'
		}
	});
	const kinds = W.kinds;
	const items = W.items;
	let tab = $state<'fab' | '4u'>('fab');
	let answer = $state<(Kind | null)[]>(items.map(() => null));
	const right = $derived(items.filter((x, i) => answer[i] === x.right).length);

	let rows = $state<Row[]>(W.rows.map((r) => ({ ...r, u: [...r.u] as Row['u'] })));
	const names = W.names;
	const sum = (r: Row) => r.u.reduce((a, b) => a + b, 0);
	const warn = (r: Row) => r.u[0] >= 2 || r.u[1] >= 2;
</script>

<figure class="dg">
	<figcaption>{tab === 'fab' ? W.capFab : W.cap4u}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.show}>
		<button type="button" role="tab" aria-selected={tab === 'fab'} onclick={() => (tab = 'fab')}>FAB</button>
		<button type="button" role="tab" aria-selected={tab === '4u'} onclick={() => (tab = '4u')}>4U</button>
	</div>

	{#if tab === 'fab'}
		<p class="dg-out">{W.introFab}</p>
		<ol class="list">
			{#each items as it, i (i)}
				<li>
					<p class="t">{W.quote(it.text)}</p>
					<div class="dg-ctl" role="group" aria-label={W.kindOf(it.text)}>
						{#each Object.keys(kinds) as k (k)}
							<button type="button" aria-pressed={answer[i] === k} onclick={() => (answer[i] = k as Kind)}>{kinds[k as Kind]}</button>
						{/each}
					</div>
					{#if answer[i]}
						<p class="fb" class:ok={answer[i] === it.right} role="status">{answer[i] === it.right ? W.right : W.no(kinds[it.right].toLowerCase())} {it.why}</p>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">{W.correct} <strong>{right}</strong> {W.of} {items.length}.</p>
	{:else}
		<p class="dg-out">{W.intro4u}</p>
		<ul class="list">
			{#each rows as r, i (i)}
				<li>
					{#if i === rows.length - 1}
						<label class="own">{W.own} <input type="text" bind:value={r.text} placeholder={W.placeholder} /></label>
					{:else}
						<p class="t">{W.quote(r.text)}</p>
					{/if}
					<div class="sliders">
						{#each names as n, j (n)}
							<label>{n}: <strong>{r.u[j]}</strong> <input type="range" min="0" max="3" step="1" bind:value={r.u[j]} aria-label={W.range(n)} /></label>
						{/each}
					</div>
					<p class="dg-out" aria-live="polite">{W.sum} <strong>{sum(r)}</strong> {W.outOf} {r.note}</p>
					{#if warn(r)}<p class="warn">{W.warn}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</figure>

<style>
	.list {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-4);
		margin: 0 0 var(--space-3);
	}
	.t {
		margin: 0 0 var(--space-2);
		color: var(--text-primary);
	}
	.fb {
		margin: 0;
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
		color: var(--text-secondary);
	}
	.fb.ok {
		border-left-color: var(--accent-state-text);
	}
	.sliders {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-2);
	}
	.own {
		display: grid;
		gap: var(--space-1);
	}
	.own input {
		padding: var(--space-2) var(--space-3);
		font: inherit;
		color: var(--text-body);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-rule);
	}
	.warn {
		margin: 0;
		padding-left: var(--space-3);
		border-left: 3px solid #d9534f;
	}
</style>
