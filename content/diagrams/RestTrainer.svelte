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

	let first = $state('Первое предложение');
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
		{ id: 'list', method: 'GET', path: '/items', status: '200 OK', json: `[{ "id": 1, "title": "${first}" }, …]`, ok: true, note: 'Чтение списка: GET, адрес называет ресурс.', spec: '/items:\n  get:\n    responses:\n      \'200\': { description: Массив предложений }' },
		{ id: 'one', method: 'GET', path: '/items/1', status: '200 OK', json: `{ "id": 1, "title": "${first}" }`, ok: true, note: 'Один ресурс по номеру в адресе.', spec: '/items/{id}:\n  get:\n    parameters: [{ name: id, in: path }]' },
		{ id: 'missing', method: 'GET', path: '/items/999', status: '404 Not Found', json: '{ "code": "not_found", "message": "Такого предложения нет" }', ok: true, note: 'Нет такого ресурса: честный 404 и ошибка в общем формате.', spec: "      '404': { $ref: '#/components/responses/NotFound' }" },
		{ id: 'create', method: 'POST', path: '/requests', body: '{ "name": "Анна", "phone": "+7 000 000-00-00" }', status: '201 Created', json: '{ "id": 17 }   Location: /requests/17', ok: true, note: 'Создание: POST, ответ 201 и адрес нового ресурса.', spec: '/requests:\n  post:\n    requestBody: { required: true }\n    responses:\n      \'201\': { description: Заявка создана }' },
		{ id: 'bad', method: 'POST', path: '/requests', body: '{ "name": "" }', status: '400 Bad Request', json: '{ "code": "invalid", "message": "Укажите телефон" }', ok: true, note: 'Данные неверны: 400 и понятное сообщение, а не 500.', spec: "      '400': { $ref: '#/components/responses/BadRequest' }" },
		{ id: 'delete', method: 'DELETE', path: '/items/1', status: '401 Unauthorized', json: '{ "code": "auth_required", "message": "Нужно войти" }', ok: true, note: 'Удалять может не каждый: без входа ответ 401 (о входе в уроке про аутентификацию).', spec: "    delete:\n      security: [{ bearer: [] }]" },
		{ id: 'badget', method: 'GET', path: '/deleteItem?id=1', status: '200 OK (и пункт пропал)', json: '{ "deleted": true }', ok: false, note: 'Ошибка: глагол в адресе, а главное, GET изменил данные. Любой робот и любое расширение, зашедшие по такой ссылке, удалят пункт.', spec: '(так описывать нельзя: GET не должен менять данные)' },
		{ id: 'badpost', method: 'POST', path: '/getItems', status: '200 OK', json: `[{ "id": 1, "title": "${first}" }, …]`, ok: false, note: 'Ошибка: читать надо методом GET, а не POST, и без глагола в адресе. POST не кэшируется, и браузер переспросит при обновлении.', spec: '(верно: GET /items)' }
	]);
	let pick = $state('list');
	const cur = $derived(cases.find((c) => c.id === pick)!);
</script>

<figure class="dg">
	<figcaption>Запрос и ответ API</figcaption>
	<div class="dg-ctl" role="group" aria-label="Запросы">
		{#each cases as c (c.id)}
			<button type="button" class="dg-mono" aria-pressed={pick === c.id} onclick={() => (pick = c.id)}><span class:badmark={!c.ok}>{c.method} {c.path}</span></button>
		{/each}
	</div>
	<div class="two">
		<section aria-label="Запрос">
			<h4>Запрос</h4>
			<pre class="dg-box dg-mono">{cur.method} {cur.path} HTTP/1.1
Host: example.ru{cur.body ? '\nContent-Type: application/json\n\n' + cur.body : ''}</pre>
		</section>
		<section aria-label="Ответ" aria-live="polite">
			<h4>Ответ</h4>
			<pre class="dg-box dg-mono" class:bad={!cur.ok}>{cur.status}
{cur.json}</pre>
		</section>
	</div>
	<p class="dg-out" aria-live="polite"><strong>{cur.ok ? 'По правилам.' : 'Нарушение правил.'}</strong> {cur.note}</p>
	<section aria-label="Фрагмент OpenAPI">
		<h4>Как это записано в файле OpenAPI</h4>
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
	h4 {
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
