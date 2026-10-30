<!--
	«Тренажёр запросов» (part 6, lesson 5). Eight requests to the API of a small site, each with the
	answer it would get, a verdict and the piece of the OpenAPI file that describes it. Two of the
	requests break the rules on purpose (a GET that deletes, a verb in the path), and the trainer
	says why. No request is made: the answers are written down. The list is the person's own, when
	the brief has items: the first item's title appears in the answers.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			first: 'Первое предложение',
			host: 'example.ru',
			name: 'Анна',
			phone: '+7 000 000-00-00',
			notFoundMsg: 'Такого предложения нет',
			needPhone: 'Укажите телефон',
			needLogin: 'Нужно войти',
			list: 'Чтение списка: GET, адрес называет ресурс.',
			listSpec: '/items:\n  get:\n    responses:\n      \'200\': { description: Массив предложений }',
			one: 'Один ресурс по номеру в адресе.',
			missing: 'Нет такого ресурса: честный 404 и ошибка в общем формате.',
			create: 'Создание: POST, ответ 201 и адрес нового ресурса.',
			createSpec: '/requests:\n  post:\n    requestBody: { required: true }\n    responses:\n      \'201\': { description: Заявка создана }',
			bad: 'Данные неверны: 400 и понятное сообщение, а не 500.',
			del: 'Удалять может не каждый: без входа ответ 401 (о входе в уроке про аутентификацию).',
			badget: 'Ошибка: глагол в адресе, а главное, GET изменил данные. Любой робот и любое расширение, зашедшие по такой ссылке, удалят пункт.',
			badgetStatus: '200 OK (и пункт пропал)',
			badgetSpec: '(так описывать нельзя: GET не должен менять данные)',
			badpost: 'Ошибка: читать надо методом GET, а не POST, и без глагола в адресе. POST не кэшируется, и браузер переспросит при обновлении.',
			badpostSpec: '(верно: GET /items)',
			caption: 'Запрос и ответ API',
			requests: 'Запросы',
			request: 'Запрос',
			response: 'Ответ',
			okVerdict: 'По правилам.',
			badVerdict: 'Нарушение правил.',
			specLabel: 'Фрагмент OpenAPI',
			specHead: 'Как это записано в файле OpenAPI'
		},
		en: {
			first: 'First offering',
			host: 'api.riverbend.example',
			name: 'Anna',
			phone: '+44 0000 000000',
			notFoundMsg: 'There is no such offering',
			needPhone: 'Please give a phone number',
			needLogin: 'Sign in first',
			list: 'Reading a list: GET, and the address names the resource.',
			listSpec: '/items:\n  get:\n    responses:\n      \'200\': { description: An array of offerings }',
			one: 'One resource, by the number in the address.',
			missing: 'No such resource: an honest 404 and an error in the shared format.',
			create: 'Creating: POST, a 201 answer and the address of the new resource.',
			createSpec: '/requests:\n  post:\n    requestBody: { required: true }\n    responses:\n      \'201\': { description: Inquiry created }',
			bad: 'The data is wrong: 400 and a clear message, not a 500.',
			del: 'Not everybody may delete: without signing in the answer is 401 (sign-in is in the lesson on authentication).',
			badget: 'Wrong: there is a verb in the address and, worse, GET changed data. Any robot or browser extension that follows such a link will delete the item.',
			badgetStatus: '200 OK (and the item is gone)',
			badgetSpec: '(this must not be described: GET must not change data)',
			badpost: 'Wrong: reading takes GET, not POST, and no verb in the address. POST is not cached, and the browser asks again on a refresh.',
			badpostSpec: '(correct: GET /items)',
			caption: 'An API request and its response',
			requests: 'Requests',
			request: 'Request',
			response: 'Response',
			okVerdict: 'By the rules.',
			badVerdict: 'A rule is broken.',
			specLabel: 'OpenAPI fragment',
			specHead: 'How it is written in the OpenAPI file'
		}
	});

	let first = $state(W.first);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.[0]?.title) first = p.items[0].title;
		} catch {
			/* the example stays */
		}
	});

	type Case = { id: string; method: string; path: string; body?: string; status: string; json: string; ok: boolean; note: string; spec: string };
	const cases = $derived<Case[]>([
		{ id: 'list', method: 'GET', path: '/items', status: '200 OK', json: `[{ "id": 1, "title": "${first}" }, …]`, ok: true, note: W.list, spec: W.listSpec },
		{ id: 'one', method: 'GET', path: '/items/1', status: '200 OK', json: `{ "id": 1, "title": "${first}" }`, ok: true, note: W.one, spec: '/items/{id}:\n  get:\n    parameters: [{ name: id, in: path }]' },
		{ id: 'missing', method: 'GET', path: '/items/999', status: '404 Not Found', json: `{ "code": "not_found", "message": "${W.notFoundMsg}" }`, ok: true, note: W.missing, spec: "      '404': { $ref: '#/components/responses/NotFound' }" },
		{ id: 'create', method: 'POST', path: '/requests', body: `{ "name": "${W.name}", "phone": "${W.phone}" }`, status: '201 Created', json: '{ "id": 17 }   Location: /requests/17', ok: true, note: W.create, spec: W.createSpec },
		{ id: 'bad', method: 'POST', path: '/requests', body: '{ "name": "" }', status: '400 Bad Request', json: `{ "code": "invalid", "message": "${W.needPhone}" }`, ok: true, note: W.bad, spec: "      '400': { $ref: '#/components/responses/BadRequest' }" },
		{ id: 'delete', method: 'DELETE', path: '/items/1', status: '401 Unauthorized', json: `{ "code": "auth_required", "message": "${W.needLogin}" }`, ok: true, note: W.del, spec: "    delete:\n      security: [{ bearer: [] }]" },
		{ id: 'badget', method: 'GET', path: '/deleteItem?id=1', status: W.badgetStatus, json: '{ "deleted": true }', ok: false, note: W.badget, spec: W.badgetSpec },
		{ id: 'badpost', method: 'POST', path: '/getItems', status: '200 OK', json: `[{ "id": 1, "title": "${first}" }, …]`, ok: false, note: W.badpost, spec: W.badpostSpec }
	]);
	let pick_ = $state('list');
	const cur = $derived(cases.find((c) => c.id === pick_)!);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.requests}>
		{#each cases as c (c.id)}
			<button type="button" class="dg-mono" aria-pressed={pick_ === c.id} onclick={() => (pick_ = c.id)}><span class:badmark={!c.ok}>{c.method} {c.path}</span></button>
		{/each}
	</div>
	<div class="two">
		<section aria-label={W.request}>
			<div class="dh">{W.request}</div>
			<pre class="dg-box dg-mono">{cur.method} {cur.path} HTTP/1.1
Host: {W.host}{cur.body ? '\nContent-Type: application/json\n\n' + cur.body : ''}</pre>
		</section>
		<section aria-label={W.response} aria-live="polite">
			<div class="dh">{W.response}</div>
			<pre class="dg-box dg-mono" class:bad={!cur.ok}>{cur.status}
{cur.json}</pre>
		</section>
	</div>
	<p class="dg-out" aria-live="polite"><strong>{cur.ok ? W.okVerdict : W.badVerdict}</strong> {cur.note}</p>
	<section aria-label={W.specLabel}>
		<div class="dh">{W.specHead}</div>
		<pre class="dg-box dg-mono">{cur.spec}</pre>
	</section>
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
		font-size: 0.82rem;
	}
	pre.bad {
		color: var(--brass-300);
	}
	.badmark {
		text-decoration: underline wavy var(--brass-300);
	}
</style>
