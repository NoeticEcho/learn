<!--
	«Шкала риска» (part 16, lesson 2). Cards of the tasks of a site, among them the person's own main
	action from the brief. Each card carries four plain facts: does it touch visitors' personal data,
	does it touch money, is it public at once, can a person see by looking that it is wrong. The
	person decides how much to trust the AI with it (without a check, with a check, a human), and the
	page answers with what the four facts suggest and why. The rule is written out below the cards:
	data and money weigh most, invisibility of a mistake next, publicity least. A teaching rule, not
	a standard. Cards are keyed by index, since one of them comes from the person's brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Card = { title: string; data: boolean; money: boolean; pub: boolean; seen: boolean };
	let action = $state('Главное действие проекта');
	let kind = $state('form');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			action = p.mainAction?.label ?? action;
			kind = p.mainAction?.kind ?? kind;
		} catch {
			/* the example stays */
		}
	});

	const cards = $derived<Card[]>([
		{ title: 'Подобрать палитру и пару шрифтов для первого эскиза', data: false, money: false, pub: false, seen: true },
		{ title: 'Вёрстка главной страницы по готовому макету', data: false, money: false, pub: true, seen: true },
		{ title: 'Черновики текстов разделов (потом вы их проверите)', data: false, money: false, pub: false, seen: true },
		{ title: 'Тексты с фактами о вас: опыт, цифры, подтверждения', data: false, money: false, pub: true, seen: false },
		{ title: `Форма для действия «${action}»: приём данных посетителя`, data: kind !== 'call' && kind !== 'read', money: kind === 'buy', pub: true, seen: false },
		{ title: 'Оплата или предоплата на сайте', data: true, money: true, pub: true, seen: false },
		{ title: 'Политика обработки данных и согласие', data: true, money: false, pub: true, seen: false },
		{ title: 'Вход для владельца и панель с заявками', data: true, money: false, pub: true, seen: false }
	]);

	const score = (c: Card) => (c.data ? 3 : 0) + (c.money ? 3 : 0) + (c.seen ? 0 : 2) + (c.pub ? 1 : 0);
	const suggest = (c: Card): 'free' | 'check' | 'human' => (score(c) >= 6 || (c.data && !c.seen) ? 'human' : score(c) >= 1 ? 'check' : 'free');
	const names = { free: 'ИИ без проверки', check: 'ИИ с проверкой', human: 'человек' } as const;
	const why = (c: Card) => {
		const r: string[] = [];
		if (c.data) r.push('затрагивает персональные данные посетителей');
		if (c.money) r.push('затрагивает деньги');
		if (!c.seen) r.push('ошибку не видно глазами');
		if (c.pub) r.push('сразу публичное');
		return r.length ? r.join(', ') : 'ничего не публикуется, ошибка видна сразу и обходится дёшево';
	};

	let choice = $state<Record<number, 'free' | 'check' | 'human'>>({});
	const decided = $derived(Object.keys(choice).length);
	const agree = $derived(cards.filter((c, i) => choice[i] && choice[i] === suggest(c)).length);
	const unsafe = $derived(cards.filter((c, i) => choice[i] === 'free' && (c.data || c.money)).length);
</script>

<figure class="dg">
	<figcaption>Что можно отдать ИИ без проверки, а что нельзя</figcaption>
	<p class="dg-out">Для каждой задачи выберите, как вы доверите её ИИ. Страница скажет, что подсказывает правило, и почему.</p>
	<ul class="cards">
		{#each cards as c, i (i)}
			<li>
				<p class="t"><strong>{c.title}</strong></p>
				<p class="facts">Данные посетителей: {c.data ? 'да' : 'нет'}. Деньги: {c.money ? 'да' : 'нет'}. Ошибку видно глазами: {c.seen ? 'да' : 'нет'}. Публично сразу: {c.pub ? 'да' : 'нет'}.</p>
				<div class="dg-ctl" role="group" aria-label={`Уровень для задачи: ${c.title}`}>
					{#each ['free', 'check', 'human'] as l (l)}
						<button type="button" aria-pressed={choice[i] === l} onclick={() => (choice[i] = l as 'free' | 'check' | 'human')}>{names[l as 'free']}</button>
					{/each}
				</div>
				{#if choice[i]}
					<p class="ans" class:ok={choice[i] === suggest(c)} aria-live="polite">
						{choice[i] === suggest(c) ? 'Совпадает с правилом.' : `Правило подсказывает: ${names[suggest(c)]}.`} Причина: {why(c)}.
					</p>
				{/if}
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		Решено задач: <strong>{decided} из {cards.length}</strong>, совпало с правилом: <strong>{agree}</strong>.
		{#if unsafe}<strong>Внимание:</strong> {unsafe} {unsafe === 1 ? 'задача, затрагивающая' : 'задачи, затрагивающие'} данные или деньги, вы отдали ИИ без проверки.{/if}
	</p>
	<p class="dg-out">Правило из четырёх вопросов. Персональные данные и деньги весят больше всего: ошибка здесь стоит чужого доверия или чужих денег. Дальше идёт «ошибку не видно глазами» (утечку не заметишь, пока она не случилась), и меньше всего весит «сразу публично».</p>
</figure>

<style>
	.cards {
		list-style: none;
		padding: 0 !important;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: var(--space-3);
	}
	.cards li {
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	p {
		margin: 0 0 var(--space-2);
	}
	.facts {
		color: var(--text-secondary);
		font-size: 0.9em;
	}
	.ans {
		border-left: 4px solid var(--text-primary);
		padding-left: var(--space-2);
	}
	.ans.ok {
		border-left-color: var(--accent-measure);
	}
</style>
