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

	type Kind = 'f' | 'a' | 'b';
	const kinds: Record<Kind, string> = { f: 'Свойство', a: 'Преимущество', b: 'Выгода' };
	const items: { text: string; right: Kind; why: string }[] = [
		{ text: 'Камера из бутилкаучука, стенка 1 мм', right: 'f', why: 'Это описание самой вещи: из чего она и какой толщины. Читателю ещё ничего не сказано о том, что ему это даёт.' },
		{ text: 'Воздух в камере держится неделями', right: 'a', why: 'Это то, что свойство позволяет делать лучше обычного. Но это ещё «что умеет вещь», а не «что получит человек».' },
		{ text: 'Не нужно подкачивать колесо перед каждой поездкой', right: 'b', why: 'Это уже жизнь человека: ему меньше возни. На такую фразу читатель откликается: «и что мне с этого» отвечено.' },
		{ text: 'Мастерская открыта до 20:00', right: 'f', why: 'Факт об устройстве работы. Пока не сказано, что он значит для клиента.' },
		{ text: 'Привезти велосипед можно после работы', right: 'a', why: 'Это то, что часы работы позволяют. До выгоды остаётся один шаг: что человек получает от этого.' },
		{ text: 'Не придётся брать отгул ради ремонта', right: 'b', why: 'Выгода: описана ситуация человека, а не мастерской.' }
	];
	let tab = $state<'fab' | '4u'>('fab');
	let answer = $state<(Kind | null)[]>(items.map(() => null));
	const right = $derived(items.filter((x, i) => answer[i] === x.right).length);

	type Row = { text: string; u: [number, number, number, number]; note: string };
	let rows = $state<Row[]>([
		{ text: 'Лучший ремонт велосипедов в городе, только сегодня!', u: [3, 2, 0, 1], note: 'Образец «как не надо»: срочность и уникальность выдуманы, конкретики нет.' },
		{ text: 'Замена камеры за 20 минут, 400 ₽: запись до 17:00 в будни', u: [1, 0, 3, 3], note: 'Конкретно и полезно. Срочность настоящая: запись правда принимают до 17:00.' },
		{ text: 'Ремонт велосипедов', u: [0, 0, 0, 1], note: 'Называет предмет и больше ничего. Безопасно, но слабо.' },
		{ text: '', u: [0, 0, 0, 0], note: 'Ваш заголовок: впишите и оцените честно.' }
	]);
	const names = ['Срочно', 'Уникально', 'Конкретно', 'Полезно'];
	const sum = (r: Row) => r.u.reduce((a, b) => a + b, 0);
	const warn = (r: Row) => r.u[0] >= 2 || r.u[1] >= 2;
</script>

<figure class="dg">
	<figcaption>{tab === 'fab' ? 'Свойство, преимущество, выгода' : 'Заголовок по 4U'}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Что показать">
		<button type="button" role="tab" aria-selected={tab === 'fab'} onclick={() => (tab = 'fab')}>FAB</button>
		<button type="button" role="tab" aria-selected={tab === '4u'} onclick={() => (tab = '4u')}>4U</button>
	</div>

	{#if tab === 'fab'}
		<p class="dg-out">Про каждую фразу скажите, что это. Подсказка: спросите «и что мне с этого?»; если ответ ещё нужен, это не выгода.</p>
		<ol class="list">
			{#each items as it, i (i)}
				<li>
					<p class="t">«{it.text}»</p>
					<div class="dg-ctl" role="group" aria-label="Что это за фраза: {it.text}">
						{#each Object.keys(kinds) as k (k)}
							<button type="button" aria-pressed={answer[i] === k} onclick={() => (answer[i] = k as Kind)}>{kinds[k as Kind]}</button>
						{/each}
					</div>
					{#if answer[i]}
						<p class="fb" class:ok={answer[i] === it.right} role="status">{answer[i] === it.right ? 'Верно.' : `Нет, это ${kinds[it.right].toLowerCase()}.`} {it.why}</p>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">Верно: <strong>{right}</strong> из {items.length}.</p>
	{:else}
		<p class="dg-out">Оцените каждый заголовок по четырём критериям от 0 до 3. Последняя строка ваша.</p>
		<ul class="list">
			{#each rows as r, i (i)}
				<li>
					{#if i === rows.length - 1}
						<label class="own">Ваш заголовок <input type="text" bind:value={r.text} placeholder="Впишите заголовок" /></label>
					{:else}
						<p class="t">«{r.text}»</p>
					{/if}
					<div class="sliders">
						{#each names as n, j (n)}
							<label>{n}: <strong>{r.u[j]}</strong> <input type="range" min="0" max="3" step="1" bind:value={r.u[j]} aria-label="{n}, от 0 до 3" /></label>
						{/each}
					</div>
					<p class="dg-out" aria-live="polite">Сумма: <strong>{sum(r)}</strong> из 12. {r.note}</p>
					{#if warn(r)}<p class="warn">Срочность и уникальность выше 1: проверьте, что это правда и что вы можете это доказать. Выдуманный срок и «единственный в городе» обманывают читателя.</p>{/if}
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
