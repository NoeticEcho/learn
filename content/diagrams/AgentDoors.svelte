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

	let action = $state('Главное действие');
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

	type Level = 'off' | 'on' | 'confirm' | 'auto';
	let read = $state<Level>('on');
	let ask = $state<Level>('on');
	let book = $state<Level>('confirm');
	let pay = $state<Level>('off');
	let poisoned = $state(false);
	let leaksContacts = $state(false);

	const rows = [
		{ id: 'read', name: 'Прочитать предложения и цены', kind: 'read' },
		{ id: 'ask', name: 'Задать вопрос', kind: 'read' },
		{ id: 'book', name: 'Записаться', kind: 'write' },
		{ id: 'pay', name: 'Оплатить', kind: 'money' }
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
			? [{ v: 'off', label: 'закрыто' }, { v: 'on', label: 'только чтение' }]
			: [{ v: 'off', label: 'закрыто' }, { v: 'confirm', label: 'с подтверждением человека' }, { v: 'auto', label: 'без подтверждения' }];

	const log = $derived.by(() => {
		const out: { call: string; result: string; warn?: boolean }[] = [];
		out.push({ call: 'Человек → агент', result: `«Запиши меня: ${action}. Если возможно, оплати».` });
		if (read === 'on') out.push({ call: 'tool: list_offers {}', result: 'вернул названия и цены предложений (только чтение)' });
		else out.push({ call: 'tool: list_offers', result: 'недоступен: агент читает страницу глазами и может ошибиться в цене', warn: true });
		if (ask === 'on') out.push({ call: 'tool: ask { question: "Какие документы взять?" }', result: leaksContacts ? 'вернул ответ вместе с телефоном и почтой владельца' : 'вернул ответ из ваших текстов' });
		if (book === 'auto') out.push({ call: 'tool: book { slot: "завтра 10:00" }', result: 'запись создана сразу, без вопроса человеку: если агент выбрал не то время, узнают потом', warn: true });
		else if (book === 'confirm') out.push({ call: 'tool: book { slot: "завтра 10:00" }', result: 'создан черновик; человеку показано «Записать на завтра, 10:00?» и ждёт ответа' });
		else out.push({ call: 'tool: book', result: 'недоступен: агент вернул человеку ссылку на форму' });
		if (pay === 'auto') out.push({ call: 'tool: pay { amount: … }', result: 'платёж проведён без подтверждения', warn: true });
		else if (pay === 'confirm') out.push({ call: 'tool: pay { amount: … }', result: 'человеку показана сумма и получатель; платёж после его «да»' });
		else out.push({ call: 'tool: pay', result: 'недоступен: оплата только человеком на странице сайта' });
		return out;
	});

	const injection = $derived.by(() => {
		if (!poisoned) return null;
		const writes = book === 'auto' || pay === 'auto';
		if (ask === 'off' && read === 'off') return { bad: false, text: 'Описание инструмента с подменой есть, но все инструменты закрыты: агент его не прочёл.' };
		if (leaksContacts && hasContacts && writes) return { bad: true, text: 'Агент прочёл в описании скрытую «инструкцию», взял контакты из ответа и выполнил действие без подтверждения: данные и деньги ушли, пока человек ничего не видел.' };
		if (leaksContacts && hasContacts) return { bad: true, text: 'Скрытая инструкция сработала частично: агент вынес контакты в ответ человеку или в запрос к третьему сервису. Подтверждение остановило действие, но контакты уже не секрет.' };
		if (writes) return { bad: true, text: 'Скрытая инструкция заставила агента записать или оплатить без подтверждения. Нужно, чтобы запись и оплата всегда ждали человека.' };
		return { bad: false, text: 'Подмена есть, но отдавать нечего (контакты не выдаются) и действия идут только через подтверждение человека: вред ограничен. Описания инструментов всё равно нужно держать под контролем.' };
	});
</script>

<figure class="dg">
	<figcaption>Что сайт отдаёт агенту и на каких условиях</figcaption>
	<p class="dg-out"><strong>Это учебная модель.</strong> Ни агента, ни протокола здесь нет: вызовы расписаны вручную по образцу MCP (имя инструмента, аргументы, результат), чтобы было видно, что даёт каждый выбор.</p>
	<table>
		<thead><tr><th scope="col">Действие</th><th scope="col">Уровень</th></tr></thead>
		<tbody>
			{#each rows as r (r.id)}
				<tr>
					<th scope="row">{r.name}</th>
					<td>
						<div class="dg-ctl" role="group" aria-label={`Уровень: ${r.name}`}>
							{#each options(r.kind) as o (o.v)}<button type="button" aria-pressed={get(r.id) === o.v} onclick={() => set(r.id, o.v)}>{o.label}</button>{/each}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={leaksContacts} /> Ответы инструмента могут содержать телефон и почту владельца</label>
		<label><input type="checkbox" bind:checked={poisoned} /> В описании инструмента спрятана чужая инструкция</label>
	</div>
	<div class="dh">Что произошло</div>
	<ol class="log" aria-live="polite">
		{#each log as l, i (i)}<li class:warn={l.warn}><span class="dg-mono">{l.call}</span> {l.result}</li>{/each}
	</ol>
	{#if injection}<p class="inj" class:bad={injection.bad} aria-live="polite"><strong>{injection.bad ? 'Подмена сработала.' : 'Подмена не нанесла вреда.'}</strong> {injection.text}</p>{/if}
	<p class="dg-out">Правила, которые видны на схеме: чтение открывать можно по умолчанию; запись и оплата только с подтверждением человека; контакты не отдавать; описания инструментов писать и проверять самому.</p>
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
