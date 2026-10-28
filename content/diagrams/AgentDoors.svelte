<!--
	«Двери для агента» (part 16, lesson 6). Three parties: a person, their AI agent, and the site.
	The site's owner (the learner) decides which of four actions the site hands to an agent (read
	the offers, ask a question, book, pay) and at what level (off; for writing and paying: only
	with a person's confirmation, or without). The person tells the agent, in words, to book the
	site's own main action; the page plays the agent's calls out as tool calls and shows what each
	choice costs. A switch plants an instruction in a tool's description, the way a poisoned tool
	does, and a second switch lets a tool return the owner's contacts; together with the levels they
	show when the planted instruction can do harm. A TEACHING MODEL: no agent, no protocol runs
	here; the calls are written out by hand in the spirit of MCP (a name, arguments, a result).
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Level = 'off' | 'on' | 'confirm' | 'auto';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// A TEACHING MODEL in both: the calls are written out by hand in the spirit of MCP.
	const W = pick({
		ru: {
			fallback: 'Главное действие',
			rows: ['Прочитать предложения и цены', 'Задать вопрос', 'Записаться', 'Оплатить'],
			offClosed: 'закрыто',
			readOnly: 'только чтение',
			confirm: 'с подтверждением человека',
			auto: 'без подтверждения',
			human: (a: string) => `«Запиши меня: ${a}. Если возможно, оплати».`,
			humanAgent: 'Человек → агент',
			listOk: 'вернул названия и цены предложений (только чтение)',
			listOff: 'недоступен: агент читает страницу глазами и может ошибиться в цене',
			question: 'Какие документы взять?',
			askLeak: 'вернул ответ вместе с телефоном и почтой владельца',
			askOk: 'вернул ответ из ваших текстов',
			slot: 'завтра 10:00',
			bookAuto: 'запись создана сразу, без вопроса человеку: если агент выбрал не то время, узнают потом',
			bookConfirm: 'создан черновик; человеку показано «Записать на завтра, 10:00?» и ждёт ответа',
			bookOff: 'недоступен: агент вернул человеку ссылку на форму',
			payAuto: 'платёж проведён без подтверждения',
			payConfirm: 'человеку показана сумма и получатель; платёж после его «да»',
			payOff: 'недоступен: оплата только человеком на странице сайта',
			injAllClosed: 'Описание инструмента с подменой есть, но все инструменты закрыты: агент его не прочёл.',
			injBoth: 'Агент прочёл в описании скрытую «инструкцию», взял контакты из ответа и выполнил действие без подтверждения: данные и деньги ушли, пока человек ничего не видел.',
			injLeak: 'Скрытая инструкция сработала частично: агент вынес контакты в ответ человеку или в запрос к третьему сервису. Подтверждение остановило действие, но контакты уже не секрет.',
			injWrite: 'Скрытая инструкция заставила агента записать или оплатить без подтверждения. Нужно, чтобы запись и оплата всегда ждали человека.',
			injLimited: 'Подмена есть, но отдавать нечего (контакты не выдаются) и действия идут только через подтверждение человека: вред ограничен. Описания инструментов всё равно нужно держать под контролем.',
			caption: 'Что сайт отдаёт агенту и на каких условиях',
			model: 'Это учебная модель.',
			modelText: 'Ни агента, ни протокола здесь нет: вызовы расписаны вручную по образцу MCP (имя инструмента, аргументы, результат), чтобы было видно, что даёт каждый выбор.',
			action: 'Действие',
			level: 'Уровень',
			levelOf: (n: string) => `Уровень: ${n}`,
			leakBox: 'Ответы инструмента могут содержать телефон и почту владельца',
			poisonBox: 'В описании инструмента спрятана чужая инструкция',
			happened: 'Что произошло',
			worked: 'Подмена сработала.',
			harmless: 'Подмена не нанесла вреда.',
			rules: 'Правила, которые видны на схеме: чтение открывать можно по умолчанию; запись и оплата только с подтверждением человека; контакты не отдавать; описания инструментов писать и проверять самому.'
		},
		en: {
			fallback: 'Main action',
			rows: ['Read the offers and prices', 'Ask a question', 'Book', 'Pay'],
			offClosed: 'closed',
			readOnly: 'read only',
			confirm: 'with a person’s confirmation',
			auto: 'with no confirmation',
			human: (a: string) => `“Book me in: ${a}. If you can, pay.”`,
			humanAgent: 'Person → agent',
			listOk: 'returned the names and prices of the offers (read only)',
			listOff: 'unavailable: the agent reads the page by eye and may get a price wrong',
			question: 'Which documents should I bring?',
			askLeak: 'returned the answer together with the owner’s phone number and email',
			askOk: 'returned an answer from your texts',
			slot: 'tomorrow 10:00',
			bookAuto: 'a booking was made at once, with no question to the person: if the agent chose the wrong time, it’s found out later',
			bookConfirm: 'a draft was made; the person is shown “Book for tomorrow, 10:00?” and it waits for an answer',
			bookOff: 'unavailable: the agent gave the person a link to the form',
			payAuto: 'the payment went through with no confirmation',
			payConfirm: 'the person is shown the amount and the payee; the payment goes after their “yes”',
			payOff: 'unavailable: payment only by a person, on the site’s page',
			injAllClosed: 'A tool description with a planted instruction exists, but every tool is closed: the agent never read it.',
			injBoth: 'The agent read a hidden “instruction” in the description, took the contacts from the answer and carried out the action with no confirmation: data and money left while the person saw nothing.',
			injLeak: 'The hidden instruction worked in part: the agent carried the contacts out in an answer to the person or in a request to a third-party service. The confirmation stopped the action, but the contacts are no longer secret.',
			injWrite: 'The hidden instruction made the agent book or pay with no confirmation. Booking and payment must always wait for a person.',
			injLimited: 'The planted instruction is there, but there is nothing to hand over (contacts aren’t given out) and actions go only through a person’s confirmation: the harm is limited. Tool descriptions still have to be kept under control.',
			caption: 'What the site hands an agent, and on what terms',
			model: 'This is a teaching model.',
			modelText: 'There is no agent and no protocol here: the calls are written out by hand in the manner of MCP (a tool’s name, arguments, a result) so you can see what each choice gives.',
			action: 'Action',
			level: 'Level',
			levelOf: (n: string) => `Level: ${n}`,
			leakBox: 'A tool’s answers may contain the owner’s phone number and email',
			poisonBox: 'Someone else’s instruction is hidden in a tool’s description',
			happened: 'What happened',
			worked: 'The planted instruction worked.',
			harmless: 'The planted instruction did no harm.',
			rules: 'The rules you can see in the diagram: reading may be open by default; booking and payment only with a person’s confirmation; don’t hand out contacts; write and check tool descriptions yourself.'
		}
	});

	let action = $state(W.fallback);
	let hasContacts = $state(true);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			action = p.mainAction?.label ?? action;
			hasContacts = !!(p.phone || p.email);
		} catch {
			/* the example stays */
		}
	});

	let read = $state<Level>('on');
	let ask = $state<Level>('on');
	let book = $state<Level>('confirm');
	let pay = $state<Level>('off');
	let poisoned = $state(false);
	let leaksContacts = $state(false);

	const rows = [
		{ id: 'read', name: W.rows[0], kind: 'read' },
		{ id: 'ask', name: W.rows[1], kind: 'read' },
		{ id: 'book', name: W.rows[2], kind: 'write' },
		{ id: 'pay', name: W.rows[3], kind: 'money' }
	] as const;
	const get = (id: string) => ({ read, ask, book, pay })[id as 'read'];
	const set = (id: string, v: Level) => {
		if (id === 'read') read = v;
		else if (id === 'ask') ask = v;
		else if (id === 'book') book = v;
		else pay = v;
	};
	const options = (k: string): { v: Level; label: string }[] =>
		k === 'read'
			? [{ v: 'off', label: W.offClosed }, { v: 'on', label: W.readOnly }]
			: [{ v: 'off', label: W.offClosed }, { v: 'confirm', label: W.confirm }, { v: 'auto', label: W.auto }];

	const log = $derived.by(() => {
		const out: { call: string; result: string; warn?: boolean }[] = [];
		out.push({ call: W.humanAgent, result: W.human(action) });
		if (read === 'on') out.push({ call: 'tool: list_offers {}', result: W.listOk });
		else out.push({ call: 'tool: list_offers', result: W.listOff, warn: true });
		if (ask === 'on') out.push({ call: `tool: ask { question: "${W.question}" }`, result: leaksContacts ? W.askLeak : W.askOk });
		if (book === 'auto') out.push({ call: `tool: book { slot: "${W.slot}" }`, result: W.bookAuto, warn: true });
		else if (book === 'confirm') out.push({ call: `tool: book { slot: "${W.slot}" }`, result: W.bookConfirm });
		else out.push({ call: 'tool: book', result: W.bookOff });
		if (pay === 'auto') out.push({ call: 'tool: pay { amount: … }', result: W.payAuto, warn: true });
		else if (pay === 'confirm') out.push({ call: 'tool: pay { amount: … }', result: W.payConfirm });
		else out.push({ call: 'tool: pay', result: W.payOff });
		return out;
	});

	const injection = $derived.by(() => {
		if (!poisoned) return null;
		const writes = book === 'auto' || pay === 'auto';
		if (ask === 'off' && read === 'off') return { bad: false, text: W.injAllClosed };
		if (leaksContacts && hasContacts && writes) return { bad: true, text: W.injBoth };
		if (leaksContacts && hasContacts) return { bad: true, text: W.injLeak };
		if (writes) return { bad: true, text: W.injWrite };
		return { bad: false, text: W.injLimited };
	});
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out"><strong>{W.model}</strong> {W.modelText}</p>
	<table>
		<thead><tr><th scope="col">{W.action}</th><th scope="col">{W.level}</th></tr></thead>
		<tbody>
			{#each rows as r (r.id)}
				<tr>
					<th scope="row">{r.name}</th>
					<td>
						<div class="dg-ctl" role="group" aria-label={W.levelOf(r.name)}>
							{#each options(r.kind) as o (o.v)}<button type="button" aria-pressed={get(r.id) === o.v} onclick={() => set(r.id, o.v)}>{o.label}</button>{/each}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={leaksContacts} /> {W.leakBox}</label>
		<label><input type="checkbox" bind:checked={poisoned} /> {W.poisonBox}</label>
	</div>
	<div class="dh">{W.happened}</div>
	<ol class="log" aria-live="polite">
		{#each log as l, i (i)}<li class:warn={l.warn}><span class="dg-mono">{l.call}</span> {l.result}</li>{/each}
	</ol>
	{#if injection}<p class="inj" class:bad={injection.bad} aria-live="polite"><strong>{injection.bad ? W.worked : W.harmless}</strong> {injection.text}</p>{/if}
	<p class="dg-out">{W.rules}</p>
</figure>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-2);
		text-align: left;
		vertical-align: top;
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.log li {
		margin-bottom: var(--space-2);
	}
	.log li.warn {
		border-left: 4px solid var(--text-primary);
		padding-left: var(--space-2);
	}
	.inj {
		border-left: 4px solid var(--accent-measure);
		padding-left: var(--space-3);
	}
	.inj.bad {
		border-left-color: var(--text-primary);
	}
</style>
