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
	import { pick } from '#lib/i18n/index.ts';

	type Card = { title: string; data: boolean; money: boolean; pub: boolean; seen: boolean };
	type Level = 'free' | 'check' | 'human';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			fallback: 'Главное действие проекта',
			palette: 'Подобрать палитру и пару шрифтов для первого эскиза',
			layout: 'Вёрстка главной страницы по готовому макету',
			drafts: 'Черновики текстов разделов (потом вы их проверите)',
			facts: 'Тексты с фактами о вас: опыт, цифры, подтверждения',
			form: (a: string) => `Форма для действия «${a}»: приём данных посетителя`,
			payment: 'Оплата или предоплата на сайте',
			policy: 'Политика обработки данных и согласие',
			login: 'Вход для владельца и панель с заявками',
			names: { free: 'ИИ без проверки', check: 'ИИ с проверкой', human: 'человек' },
			dataWhy: 'затрагивает персональные данные посетителей',
			moneyWhy: 'затрагивает деньги',
			unseenWhy: 'ошибку не видно глазами',
			pubWhy: 'сразу публичное',
			noneWhy: 'ничего не публикуется, ошибка видна сразу и обходится дёшево',
			caption: 'Что можно отдать ИИ без проверки, а что нельзя',
			intro: 'Для каждой задачи выберите, как вы доверите её ИИ. Страница скажет, что подсказывает правило, и почему.',
			yes: 'да',
			no: 'нет',
			facts_: (c: Card, y: string, n: string) => `Данные посетителей: ${c.data ? y : n}. Деньги: ${c.money ? y : n}. Ошибку видно глазами: ${c.seen ? y : n}. Публично сразу: ${c.pub ? y : n}.`,
			levelFor: (t: string) => `Уровень для задачи: ${t}`,
			matches: 'Совпадает с правилом.',
			suggests: (n: string) => `Правило подсказывает: ${n}.`,
			reason: 'Причина:',
			decided: 'Решено задач:',
			of: 'из',
			agreed: 'совпало с правилом:',
			warning: 'Внимание:',
			one: 'задача, затрагивающая',
			many: 'задачи, затрагивающие',
			given: 'данные или деньги, вы отдали ИИ без проверки.',
			rule: 'Правило из четырёх вопросов. Персональные данные и деньги весят больше всего: ошибка здесь стоит чужого доверия или чужих денег. Дальше идёт «ошибку не видно глазами» (утечку не заметишь, пока она не случилась), и меньше всего весит «сразу публично».'
		},
		en: {
			fallback: 'The project’s main action',
			palette: 'Choose a palette and a pair of fonts for a first sketch',
			layout: 'The layout of the home page from a ready design',
			drafts: 'Drafts of the sections’ text (you will check them afterwards)',
			facts: 'Text with facts about you: experience, numbers, proof',
			form: (a: string) => `A form for the action “${a}”: receiving a visitor’s data`,
			payment: 'Payment or a deposit on the site',
			policy: 'The privacy policy and consent',
			login: 'Sign-in for the owner and a panel with requests',
			names: { free: 'AI without a check', check: 'AI with a check', human: 'a person' },
			dataWhy: 'touches visitors’ personal data',
			moneyWhy: 'touches money',
			unseenWhy: 'a mistake can’t be seen by eye',
			pubWhy: 'public at once',
			noneWhy: 'nothing is published, a mistake shows at once and costs little',
			caption: 'What can go to an AI with no check, and what can’t',
			intro: 'For each task, choose how you will trust an AI with it. The page says what the rule suggests, and why.',
			yes: 'yes',
			no: 'no',
			facts_: (c: Card, y: string, n: string) => `Visitors’ data: ${c.data ? y : n}. Money: ${c.money ? y : n}. A mistake is visible by eye: ${c.seen ? y : n}. Public at once: ${c.pub ? y : n}.`,
			levelFor: (t: string) => `Level for the task: ${t}`,
			matches: 'Matches the rule.',
			suggests: (n: string) => `The rule suggests: ${n}.`,
			reason: 'Reason:',
			decided: 'Tasks decided:',
			of: 'of',
			agreed: 'matching the rule:',
			warning: 'Warning:',
			one: 'task that touches',
			many: 'tasks that touch',
			given: 'data or money you gave to an AI with no check.',
			rule: 'The rule of four questions. Personal data and money weigh the most: a mistake there costs other people’s trust or other people’s money. Next is “a mistake can’t be seen by eye” (you won’t notice a leak until it has happened), and “public at once” weighs the least.'
		}
	});

	let action = $state(W.fallback);
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
		{ title: W.palette, data: false, money: false, pub: false, seen: true },
		{ title: W.layout, data: false, money: false, pub: true, seen: true },
		{ title: W.drafts, data: false, money: false, pub: false, seen: true },
		{ title: W.facts, data: false, money: false, pub: true, seen: false },
		{ title: W.form(action), data: kind !== 'call' && kind !== 'read', money: kind === 'buy', pub: true, seen: false },
		{ title: W.payment, data: true, money: true, pub: true, seen: false },
		{ title: W.policy, data: true, money: false, pub: true, seen: false },
		{ title: W.login, data: true, money: false, pub: true, seen: false }
	]);

	const score = (c: Card) => (c.data ? 3 : 0) + (c.money ? 3 : 0) + (c.seen ? 0 : 2) + (c.pub ? 1 : 0);
	const suggest = (c: Card): Level => (score(c) >= 6 || (c.data && !c.seen) ? 'human' : score(c) >= 1 ? 'check' : 'free');
	const names = W.names;
	const why = (c: Card) => {
		const r: string[] = [];
		if (c.data) r.push(W.dataWhy);
		if (c.money) r.push(W.moneyWhy);
		if (!c.seen) r.push(W.unseenWhy);
		if (c.pub) r.push(W.pubWhy);
		return r.length ? r.join(', ') : W.noneWhy;
	};

	let choice = $state<Record<number, Level>>({});
	const decided = $derived(Object.keys(choice).length);
	const agree = $derived(cards.filter((c, i) => choice[i] && choice[i] === suggest(c)).length);
	const unsafe = $derived(cards.filter((c, i) => choice[i] === 'free' && (c.data || c.money)).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>
	<ul class="cards">
		{#each cards as c, i (i)}
			<li>
				<p class="t"><strong>{c.title}</strong></p>
				<p class="facts">{W.facts_(c, W.yes, W.no)}</p>
				<div class="dg-ctl" role="group" aria-label={W.levelFor(c.title)}>
					{#each ['free', 'check', 'human'] as l (l)}
						<button type="button" aria-pressed={choice[i] === l} onclick={() => (choice[i] = l as Level)}>{names[l as Level]}</button>
					{/each}
				</div>
				{#if choice[i]}
					<p class="ans" class:ok={choice[i] === suggest(c)} aria-live="polite">
						{choice[i] === suggest(c) ? W.matches : W.suggests(names[suggest(c)])} {W.reason} {why(c)}.
					</p>
				{/if}
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		{W.decided} <strong>{decided} {W.of} {cards.length}</strong>, {W.agreed} <strong>{agree}</strong>.
		{#if unsafe}<strong>{W.warning}</strong> {unsafe} {unsafe === 1 ? W.one : W.many} {W.given}{/if}
	</p>
	<p class="dg-out">{W.rule}</p>
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
