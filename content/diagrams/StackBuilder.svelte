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

	import { pick } from '#lib/i18n/index.ts';

	type Block = { id: string; name: string; cost: number; note: string };
	type Hint = { level: 'miss' | 'extra' | 'ok'; text: string };
	const W = pick({
		ru: {
			blocks: [
				{ id: 'static', name: 'Хостинг статических файлов', cost: 0, note: 'GitHub Pages, Яндекс Облако, любой хостинг' },
				{ id: 'server', name: 'Веб-сервер (nginx) на VPS', cost: 600, note: 'VPS у российского провайдера' },
				{ id: 'app', name: 'Приложение (Node.js, PHP…)', cost: 0, note: 'работает на том же VPS' },
				{ id: 'db', name: 'База данных', cost: 300, note: 'PostgreSQL на том же VPS или управляемая' },
				{ id: 'auth', name: 'Вход', cost: 0, note: 'свой или через Яндекс ID' },
				{ id: 'form', name: 'Сервис приёма форм', cost: 500, note: 'вместо своего приложения' },
				{ id: 'hook', name: 'Вебхук / уведомление', cost: 0, note: 'Telegram, почта' },
				{ id: 'mail', name: 'Почтовая рассылка и письма', cost: 300, note: 'сервис транзакционных писем' },
				{ id: 'cdn', name: 'CDN', cost: 200, note: 'раздача файлов поближе к людям' }
			] as Block[],
			action: 'Главное действие',
			needReceiver: (a: string) => `Главное действие «${a}» требует принять данные от посетителя: нужно приложение или сервис форм.`,
			needNotify: 'Заявка принята, но владелец о ней не узнает: добавьте уведомление (вебхук) или письмо.',
			needServer: 'Приложению нужен веб-сервер (обычно nginx) перед ним: он принимает HTTPS и отдаёт файлы.',
			dbNoApp: 'База данных без приложения: кто в неё будет писать? Либо добавьте приложение, либо база лишняя.',
			authNoApp: 'Вход невозможен без приложения, которое проверяет посетителя.',
			both: 'И приложение, и сервис форм принимают заявки: достаточно одного из двух.',
			authExtra: (a: string) => `Для действия «${a}» вход обычно не нужен: посетителю не нужен аккаунт, чтобы оставить заявку.`,
			cdnNoHost: 'CDN раздаёт файлы, но их пока негде хранить: добавьте хостинг.',
			pd: 'В схеме есть персональные данные посетителей. Проверьте, где они лежат: для граждан РФ первичное хранение на территории России (152-ФЗ).',
			clear: 'Явных пробелов нет. Теперь подумайте, что будет, если один из блоков откажет.',
			caption: 'Соберите серверную часть под ваше главное действие',
			goal: 'Главное действие проекта:',
			legend: 'Блоки',
			miss: 'Не хватает',
			extra: 'Лишнее',
			ok: 'Учтите',
			total: (n: number) => `Ориентировочно: ${n.toLocaleString('ru-RU')} ₽ в месяц.`,
			totalNote: ' Порядок величин для российского рынка, не прайс: цены меняются, а у многих сервисов есть бесплатные ограничения.'
		},
		en: {
			blocks: [
				{ id: 'static', name: 'Static file hosting', cost: 0, note: 'GitHub Pages, Cloudflare Pages, Netlify, any host' },
				{ id: 'server', name: 'Web server (nginx) on a VPS', cost: 5, note: 'a VPS from Hetzner, DigitalOcean or similar' },
				{ id: 'app', name: 'An application (Node.js, PHP…)', cost: 0, note: 'runs on the same VPS' },
				{ id: 'db', name: 'Database', cost: 3, note: 'PostgreSQL on the same VPS, or managed' },
				{ id: 'auth', name: 'Sign-in', cost: 0, note: 'your own, or through Google or Apple' },
				{ id: 'form', name: 'Form-handling service', cost: 4, note: 'instead of your own application' },
				{ id: 'hook', name: 'Webhook / notification', cost: 0, note: 'Slack, email' },
				{ id: 'mail', name: 'Email sending and newsletters', cost: 3, note: 'a transactional email service' },
				{ id: 'cdn', name: 'CDN', cost: 2, note: 'serving files closer to people' }
			] as Block[],
			action: 'Main action',
			needReceiver: (a: string) => `The main action “${a}” means taking data from the visitor: you need an application or a form service.`,
			needNotify: 'The enquiry is received, but the owner will not know about it: add a notification (a webhook) or an email.',
			needServer: 'An application needs a web server (usually nginx) in front of it: it takes the HTTPS and serves the files.',
			dbNoApp: 'A database with no application: who will write to it? Either add an application, or the database is surplus.',
			authNoApp: 'Signing in is impossible without an application that checks the visitor.',
			both: 'Both an application and a form service take enquiries: one of the two is enough.',
			authExtra: (a: string) => `For the action “${a}” sign-in is usually not needed: a visitor needs no account to leave an enquiry.`,
			cdnNoHost: 'A CDN serves files, but there is nowhere to keep them yet: add hosting.',
			pd: 'The setup holds visitors’ personal data. Check where it sits: under the GDPR and UK GDPR, a processor outside the UK or the EEA brings the rules on international transfers into play.',
			clear: 'No obvious gaps. Now think about what happens if one of the blocks fails.',
			caption: 'Build the server side for your main action',
			goal: 'The project’s main action:',
			legend: 'Blocks',
			miss: 'Missing',
			extra: 'Surplus',
			ok: 'Mind this',
			total: (n: number) => `Roughly: £${n.toLocaleString('en-GB')} a month.`,
			totalNote: ' An order of magnitude, not a price list: prices change, and many services have free tiers.'
		}
	});
	const blocks = W.blocks;
	let on = $state<Record<string, boolean>>({ static: true, server: false, app: false, db: false, auth: false, form: false, hook: false, mail: false, cdn: false });
	let kind = $state('form');
	let action = $state(W.action);
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
		const out: Hint[] = [];
		if (needsReceiver && !receiver) out.push({ level: 'miss', text: W.needReceiver(action) });
		if (needsReceiver && receiver && !on.hook && !on.mail) out.push({ level: 'miss', text: W.needNotify });
		if (on.app && !on.server) out.push({ level: 'miss', text: W.needServer });
		if (on.db && !on.app) out.push({ level: 'extra', text: W.dbNoApp });
		if (on.auth && !on.app) out.push({ level: 'extra', text: W.authNoApp });
		if (on.app && on.form) out.push({ level: 'extra', text: W.both });
		if (on.auth && kind !== 'signup' && kind !== 'buy') out.push({ level: 'extra', text: W.authExtra(action) });
		if (on.cdn && !on.static && !on.server) out.push({ level: 'extra', text: W.cdnNoHost });
		if (on.db || on.form || on.mail) out.push({ level: 'ok', text: W.pd });
		if (!out.some((h) => h.level !== 'ok')) out.unshift({ level: 'ok', text: W.clear });
		return out;
	});
	const total = $derived(blocks.filter((b) => on[b.id]).reduce((s, b) => s + b.cost, 0));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="goal">{W.goal} <strong>{action}</strong></p>
	<fieldset class="blocks">
		<legend>{W.legend}</legend>
		{#each blocks as b (b.id)}
			<label><input type="checkbox" bind:checked={on[b.id]} /> {b.name} <span class="note">({b.note})</span></label>
		{/each}
	</fieldset>
	<ul class="hints" aria-live="polite">
		{#each hints as h, i (i)}
			<li class={h.level}><span class="tag">{h.level === 'miss' ? W.miss : h.level === 'extra' ? W.extra : W.ok}</span> {h.text}</li>
		{/each}
	</ul>
	<p class="dg-out"><strong>{W.total(total)}</strong>{W.totalNote}</p>
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
