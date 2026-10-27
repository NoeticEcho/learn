<!--
	«Конструктор схемы» (part 6, lesson 8). The person ticks the blocks of a server side (hosting
	of files, a web server, an application, a database, sign-in, a webhook and so on) and the page
	says what is missing and what is superfluous for their own brief (the main action, its kind),
	with a rough monthly cost. The rules are few and written out, and the costs are orders of
	magnitude for the Russian market, not quotes: the point is the questions, not the prices.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Block = { id: string; name: string; cost: number; note: string };
	const blocks: Block[] = [
		{ id: 'static', name: 'Хостинг статических файлов', cost: 0, note: 'GitHub Pages, Яндекс Облако, любой хостинг' },
		{ id: 'server', name: 'Веб-сервер (nginx) на VPS', cost: 600, note: 'VPS у российского провайдера' },
		{ id: 'app', name: 'Приложение (Node.js, PHP…)', cost: 0, note: 'работает на том же VPS' },
		{ id: 'db', name: 'База данных', cost: 300, note: 'PostgreSQL на том же VPS или управляемая' },
		{ id: 'auth', name: 'Вход', cost: 0, note: 'свой или через Яндекс ID' },
		{ id: 'form', name: 'Сервис приёма форм', cost: 500, note: 'вместо своего приложения' },
		{ id: 'hook', name: 'Вебхук / уведомление', cost: 0, note: 'Telegram, почта' },
		{ id: 'mail', name: 'Почтовая рассылка и письма', cost: 300, note: 'сервис транзакционных писем' },
		{ id: 'cdn', name: 'CDN', cost: 200, note: 'раздача файлов поближе к людям' }
	];
	let on = $state<Record<string, boolean>>({ static: true, server: false, app: false, db: false, auth: false, form: false, hook: false, mail: false, cdn: false });
	let kind = $state('form');
	let action = $state('Главное действие');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			kind = p.mainAction?.kind ?? kind;
			action = p.mainAction?.label ?? action;
		} catch {
			/* the example stays */
		}
	});
	const needsReceiver = $derived(['form', 'book', 'buy', 'signup'].includes(kind));
	const receiver = $derived(on.app || on.form);

	const hints = $derived.by(() => {
		const out: { level: 'miss' | 'extra' | 'ok'; text: string }[] = [];
		if (needsReceiver && !receiver) out.push({ level: 'miss', text: `Главное действие «${action}» требует принять данные от посетителя: нужно приложение или сервис форм.` });
		if (needsReceiver && receiver && !on.hook && !on.mail) out.push({ level: 'miss', text: 'Заявка принята, но владелец о ней не узнает: добавьте уведомление (вебхук) или письмо.' });
		if (on.app && !on.server) out.push({ level: 'miss', text: 'Приложению нужен веб-сервер (обычно nginx) перед ним: он принимает HTTPS и отдаёт файлы.' });
		if (on.db && !on.app) out.push({ level: 'extra', text: 'База данных без приложения: кто в неё будет писать? Либо добавьте приложение, либо база лишняя.' });
		if (on.auth && !on.app) out.push({ level: 'extra', text: 'Вход невозможен без приложения, которое проверяет посетителя.' });
		if (on.app && on.form) out.push({ level: 'extra', text: 'И приложение, и сервис форм принимают заявки: достаточно одного из двух.' });
		if (on.auth && kind !== 'signup' && kind !== 'buy') out.push({ level: 'extra', text: `Для действия «${action}» вход обычно не нужен: посетителю не нужен аккаунт, чтобы оставить заявку.` });
		if (on.cdn && !on.static && !on.server) out.push({ level: 'extra', text: 'CDN раздаёт файлы, но их пока негде хранить: добавьте хостинг.' });
		if (on.db || on.form || on.mail) out.push({ level: 'ok', text: 'В схеме есть персональные данные посетителей. Проверьте, где они лежат: для граждан РФ первичное хранение на территории России (152-ФЗ).' });
		if (!out.some((h) => h.level !== 'ok')) out.unshift({ level: 'ok', text: 'Явных пробелов нет. Теперь подумайте, что будет, если один из блоков откажет.' });
		return out;
	});
	const total = $derived(blocks.filter((b) => on[b.id]).reduce((s, b) => s + b.cost, 0));
</script>

<figure class="dg">
	<figcaption>Соберите серверную часть под ваше главное действие</figcaption>
	<p class="goal">Главное действие проекта: <strong>{action}</strong></p>
	<fieldset class="blocks">
		<legend>Блоки</legend>
		{#each blocks as b (b.id)}
			<label><input type="checkbox" bind:checked={on[b.id]} /> {b.name} <span class="note">({b.note})</span></label>
		{/each}
	</fieldset>
	<ul class="hints" aria-live="polite">
		{#each hints as h, i (i)}
			<li class={h.level}><span class="tag">{h.level === 'miss' ? 'Не хватает' : h.level === 'extra' ? 'Лишнее' : 'Учтите'}</span> {h.text}</li>
		{/each}
	</ul>
	<p class="dg-out"><strong>Ориентировочно: {total.toLocaleString('ru-RU')} ₽ в месяц.</strong> Порядок величин для российского рынка, не прайс: цены меняются, а у многих сервисов есть бесплатные ограничения.</p>
</figure>

<style>
	.goal {
		margin: 0 0 var(--space-3);
	}
	.blocks {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin: 0 0 var(--space-3);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	legend {
		padding: 0 var(--space-2);
		color: var(--text-secondary);
	}
	.note {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.hints {
		margin: 0 0 var(--space-3);
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.hints li {
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	.hints li.miss {
		border-color: var(--brass-300);
	}
	.hints li.extra {
		border-style: dashed;
		border-color: var(--border-rule);
	}
	.tag {
		font-weight: var(--weight-medium);
		color: var(--text-primary);
		margin-right: var(--space-2);
	}
</style>
