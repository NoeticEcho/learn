<!--
	«Запрос и ответ» (part 1, lesson 6). The person picks a method and a path and the pretend
	server of a small site answers, with the raw request and the raw response side by side, so
	that a 404, a 301 with its Location, a 405 with its Allow and a 500 are each seen once.
	No network: the site is a table in this file.
-->
<script lang="ts">
	import './shared.css';

	type Res = { status: number; text: string; headers: [string, string][]; body: string };
	const html = (s: string) => `<!doctype html>… ${s} …`;
	const site = (method: string, path: string, broken: boolean): Res => {
		if (broken) return { status: 500, text: 'Internal Server Error', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html('Что-то пошло не так на сервере') };
		const ok = (body: string): Res => ({ status: 200, text: 'OK', headers: [['Content-Type', 'text/html; charset=utf-8'], ['Content-Length', String(body.length * 2)], ['Cache-Control', 'max-age=3600']], body });
		const moved = (to: string): Res => ({ status: 301, text: 'Moved Permanently', headers: [['Location', to], ['Content-Length', '0']], body: '' });
		if (path === '/zayavka') {
			if (method === 'POST') return { status: 200, text: 'OK', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html('Заявка принята, мы свяжемся с вами') };
			return { status: 405, text: 'Method Not Allowed', headers: [['Allow', 'POST']], body: html('Сюда можно только отправлять данные') };
		}
		if (method !== 'GET') return { status: 405, text: 'Method Not Allowed', headers: [['Allow', 'GET, HEAD']], body: html('Метод не поддерживается') };
		if (path === '/') return ok(html('Главная страница'));
		if (path === '/uslugi/') return ok(html('Услуги'));
		if (path === '/uslugi') return moved('/uslugi/');
		if (path === '/staryj-razdel') return moved('/uslugi/');
		if (path === '/admin/') return { status: 403, text: 'Forbidden', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html('Сюда вход закрыт') };
		return { status: 404, text: 'Not Found', headers: [['Content-Type', 'text/html; charset=utf-8']], body: html('Такой страницы нет') };
	};

	const paths = ['/', '/uslugi/', '/uslugi', '/staryj-razdel', '/net-takoj', '/admin/', '/zayavka'];
	let method = $state('GET');
	let path = $state('/uslugi');
	let broken = $state(false);
	const res = $derived(site(method, path, broken));
	const group = $derived(res.status < 300 ? 'ok' : res.status < 400 ? 'move' : res.status < 500 ? 'client' : 'server');
	const meaning: Record<number, string> = {
		200: 'Всё хорошо, вот страница.',
		301: 'Страница переехала навсегда. Новый адрес в заголовке Location, и браузер сам пойдёт по нему.',
		403: 'Сервер понял запрос, но вам туда нельзя.',
		404: 'Такой страницы на сервере нет.',
		405: 'Так обращаться к этому адресу нельзя. В заголовке Allow сказано, как можно.',
		500: 'Сервер сломался. Вы тут ни при чём.'
	};
	const classes = { ok: 'Успех', move: 'Переадресация', client: 'Ошибка клиента (запрос)', server: 'Ошибка сервера' } as const;
</script>

<figure class="dg">
	<figcaption>Попросите страницу у сайта</figcaption>
	<div class="dg-ctl" role="group" aria-label="Метод запроса">
		{#each ['GET', 'POST', 'DELETE'] as m (m)}
			<button type="button" aria-pressed={method === m} onclick={() => (method = m)}>{m}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label="Путь">
		{#each paths as p (p)}
			<button type="button" class="dg-mono" aria-pressed={path === p} onclick={() => (path = p)}>{p}</button>
		{/each}
	</div>
	<label><input type="checkbox" bind:checked={broken} /> Сервер сломался</label>

	<div class="two">
		<section aria-label="Запрос">
			<div class="dh">Запрос браузера</div>
			<pre class="dg-box dg-mono">{method} {path} HTTP/1.1
Host: www.example.ru
Accept: text/html
Accept-Language: ru
User-Agent: Mozilla/5.0 …</pre>
		</section>
		<section aria-label="Ответ" aria-live="polite">
			<div class="dh">Ответ сервера</div>
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
