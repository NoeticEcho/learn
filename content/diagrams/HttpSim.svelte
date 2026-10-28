<!--
	«Запрос и ответ» (part 1, lesson 6). The person picks a method and a path and the pretend
	server of a small site answers, with the raw request and the raw response side by side, so
	that a 404, a 301 with its Location, a 405 with its Allow and a 500 are each seen once.
	No network: the site is a table in this file.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	type Res = { status: number; text: string; headers: [string, string][]; body: string };
	const W = pick({
		ru: {
			host: 'www.example.ru',
			lang: 'ru',
			p: { services: '/uslugi/', servicesBare: '/uslugi', old: '/staryj-razdel', missing: '/net-takoj', admin: '/admin/', form: '/zayavka' },
			bodies: {
				broken: 'Что-то пошло не так на сервере',
				received: 'Заявка принята, мы свяжемся с вами',
				postOnly: 'Сюда можно только отправлять данные',
				methodNo: 'Метод не поддерживается',
				home: 'Главная страница',
				services: 'Услуги',
				admin: 'Сюда вход закрыт',
				missing: 'Такой страницы нет'
			},
			meaning: {
				200: 'Всё хорошо, вот страница.',
				301: 'Страница переехала навсегда. Новый адрес в заголовке Location, и браузер сам пойдёт по нему.',
				403: 'Сервер понял запрос, но вам туда нельзя.',
				404: 'Такой страницы на сервере нет.',
				405: 'Так обращаться к этому адресу нельзя. В заголовке Allow сказано, как можно.',
				500: 'Сервер сломался. Вы тут ни при чём.'
			} as Record<number, string>,
			classes: { ok: 'Успех', move: 'Переадресация', client: 'Ошибка клиента (запрос)', server: 'Ошибка сервера' } as Record<string, string>,
			caption: 'Попросите страницу у сайта',
			methodGroup: 'Метод запроса',
			pathGroup: 'Путь',
			broke: 'Сервер сломался',
			request: 'Запрос',
			browserRequest: 'Запрос браузера',
			response: 'Ответ',
			serverResponse: 'Ответ сервера'
		},
		en: {
			host: 'www.example.com',
			lang: 'en',
			p: { services: '/services/', servicesBare: '/services', old: '/old-section', missing: '/no-such-page', admin: '/admin/', form: '/enquiry' },
			bodies: {
				broken: 'Something went wrong on the server',
				received: 'Request received, we will be in touch',
				postOnly: 'Data can only be sent here',
				methodNo: 'Method not supported',
				home: 'Home page',
				services: 'Services',
				admin: 'Access here is closed',
				missing: 'There is no such page'
			},
			meaning: {
				200: 'All is well, here is the page.',
				301: 'The page has moved for good. The new address is in the Location header, and the browser will follow it by itself.',
				403: 'The server understood the request, but you may not go there.',
				404: 'There is no such page on the server.',
				405: 'You can’t address this URL that way. The Allow header says how you can.',
				500: 'The server broke. It is nothing you did.'
			} as Record<number, string>,
			classes: { ok: 'Success', move: 'Redirection', client: 'Client error (the request)', server: 'Server error' } as Record<string, string>,
			caption: 'Ask a site for a page',
			methodGroup: 'Request method',
			pathGroup: 'Path',
			broke: 'The server is broken',
			request: 'Request',
			browserRequest: 'The browser’s request',
			response: 'Response',
			serverResponse: 'The server’s response'
		}
	});
	const html = (s: string) => `<!doctype html>… ${s} …`;
	const site = (method: string, path: string, broken: boolean): Res => {
		const { p, bodies } = W;
		if (broken) return { status: 500, text: 'Internal Server Error', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html(bodies.broken) };
		const ok = (body: string): Res => ({ status: 200, text: 'OK', headers: [['Content-Type', 'text/html; charset=utf-8'], ['Content-Length', String(body.length * 2)], ['Cache-Control', 'max-age=3600']], body });
		const moved = (to: string): Res => ({ status: 301, text: 'Moved Permanently', headers: [['Location', to], ['Content-Length', '0']], body: '' });
		if (path === p.form) {
			if (method === 'POST') return { status: 200, text: 'OK', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html(bodies.received) };
			return { status: 405, text: 'Method Not Allowed', headers: [['Allow', 'POST']], body: html(bodies.postOnly) };
		}
		if (method !== 'GET') return { status: 405, text: 'Method Not Allowed', headers: [['Allow', 'GET, HEAD']], body: html(bodies.methodNo) };
		if (path === '/') return ok(html(bodies.home));
		if (path === p.services) return ok(html(bodies.services));
		if (path === p.servicesBare) return moved(p.services);
		if (path === p.old) return moved(p.services);
		if (path === p.admin) return { status: 403, text: 'Forbidden', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html(bodies.admin) };
		return { status: 404, text: 'Not Found', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html(bodies.missing) };
	};

	const paths = ['/', W.p.services, W.p.servicesBare, W.p.old, W.p.missing, W.p.admin, W.p.form];
	let method = $state('GET');
	let path = $state(W.p.servicesBare);
	let broken = $state(false);
	const res = $derived(site(method, path, broken));
	const group = $derived(res.status < 300 ? 'ok' : res.status < 400 ? 'move' : res.status < 500 ? 'client' : 'server');
	const meaning = W.meaning;
	const classes = W.classes;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.methodGroup}>
		{#each ['GET', 'POST', 'DELETE'] as m (m)}
			<button type="button" aria-pressed={method === m} onclick={() => (method = m)}>{m}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label={W.pathGroup}>
		{#each paths as p (p)}
			<button type="button" class="dg-mono" aria-pressed={path === p} onclick={() => (path = p)}>{p}</button>
		{/each}
	</div>
	<label><input type="checkbox" bind:checked={broken} /> {W.broke}</label>

	<div class="two">
		<section aria-label={W.request}>
			<div class="dh">{W.browserRequest}</div>
			<pre class="dg-box dg-mono">{method} {path} HTTP/1.1
Host: {W.host}
Accept: text/html
Accept-Language: {W.lang}
User-Agent: Mozilla/5.0 …</pre>
		</section>
		<section aria-label={W.response} aria-live="polite">
			<div class="dh">{W.serverResponse}</div>
			<pre class="dg-box dg-mono">HTTP/1.1 <span class="st {group}">{res.status} {res.text}</span>
{#each res.headers as [k, v] (k)}{k}: {v}
{/each}
{res.body ? '\n' + res.body : ''}</pre>
		</section>
	</div>
	<p class="dg-out" aria-live="polite">
		<strong>{classes[group]}.</strong>
		{meaning[res.status] ?? ''}
	</p>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		margin-top: var(--space-3);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		min-height: 9rem;
		font-size: 0.85rem;
	}
	.st {
		font-weight: bold;
	}
	.st.ok {
		color: var(--accent-state-text);
	}
	.st.move {
		color: var(--echo-400);
	}
	.st.client {
		color: var(--brass-300);
	}
	.st.server {
		color: var(--text-primary);
		text-decoration: underline;
	}
</style>
