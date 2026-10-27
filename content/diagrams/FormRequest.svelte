<!--
	«Что уйдёт при отправке формы» (part 2, lesson 6). A small real form next to the HTTP request
	the browser would build from it: the method (GET puts the data into the address, POST into the
	body), the field names, and the percent-encoding. The browser's own validation talks too: the
	messages shown are the ones it produces for that field. Nothing is sent: the form is never
	submitted and no address is requested.
-->
<script lang="ts">
	import './shared.css';

	let method = $state<'POST' | 'GET'>('POST');
	let name = $state('Анна');
	let contact = $state('anna@example.org');
	let kind = $state<'email' | 'text'>('email');
	let consent = $state(false);
	let required = $state(true);

	let form: HTMLFormElement;
	let messages = $state<string[]>([]);
	const check = () => {
		if (!form) return;
		messages = Array.from(form.elements)
			.filter((e): e is HTMLInputElement => e instanceof HTMLInputElement && !e.validity.valid)
			.map((e) => `${e.dataset.label}: ${e.validationMessage}`);
	};
	$effect(() => {
		// re-run when anything the validity depends on changes
		[name, contact, kind, consent, required];
		queueMicrotask(check);
	});

	const params = $derived.by(() => {
		const p = new URLSearchParams();
		p.set('name', name);
		p.set('contact', contact);
		if (consent) p.set('consent', 'on');
		return p.toString();
	});
	const request = $derived(
		method === 'GET'
			? `GET /zayavka?${params} HTTP/1.1\nHost: zarechye.example`
			: `POST /zayavka HTTP/1.1\nHost: zarechye.example\nContent-Type: application/x-www-form-urlencoded\nContent-Length: ${new TextEncoder().encode(params).length}\n\n${params}`
	);
</script>

<figure class="dg">
	<figcaption>От формы к запросу</figcaption>
	<div class="dg-ctl" role="group" aria-label="Метод отправки">
		<button type="button" aria-pressed={method === 'POST'} onclick={() => (method = 'POST')}>method="post"</button>
		<button type="button" aria-pressed={method === 'GET'} onclick={() => (method = 'GET')}>method="get"</button>
		<label><input type="checkbox" bind:checked={required} /> поля обязательные</label>
		<label><input type="checkbox" checked={kind === 'email'} onchange={(e) => (kind = e.currentTarget.checked ? 'email' : 'text')} /> у контакта type="email"</label>
	</div>
	<div class="cols">
		<form bind:this={form} novalidate onsubmit={(e) => e.preventDefault()}>
			<label for="fr-name">Имя</label>
			<input id="fr-name" name="name" type="text" data-label="Имя" {required} bind:value={name} autocomplete="off" />
			<label for="fr-contact">Почта</label>
			<input id="fr-contact" name="contact" type={kind} data-label="Почта" {required} bind:value={contact} autocomplete="off" />
			<label class="chk"><input type="checkbox" name="consent" data-label="Согласие" {required} bind:checked={consent} /> Согласен на обработку данных</label>
			<button type="submit">Отправить (не уйдёт)</button>
		</form>
		<div>
			<h4>Запрос, который построит браузер</h4>
			<pre class="dg-box dg-mono">{request}</pre>
		</div>
	</div>
	<h4>Что говорит проверка в браузере</h4>
	{#if messages.length}
		<ul class="msgs" aria-live="polite">
			{#each messages as m (m)}<li>{m}</li>{/each}
		</ul>
	{:else}
		<p class="dg-out" aria-live="polite">Все поля в порядке: браузер отправил бы форму.</p>
	{/if}
	<p class="dg-out">
		{#if method === 'GET'}
			GET кладёт данные прямо в адрес: они остаются в истории, в логах сервера и в ссылке, которой можно поделиться. Так хорошо работает поиск, но заявку с телефоном отправлять так нельзя.
		{:else}
			POST кладёт данные в тело запроса, в адресе их нет. Именно так отправляют заявки и всё, что меняет что-то на сервере. Но и тело открыто, если соединение без защиты: поэтому форму отдают только по HTTPS.
		{/if}
		Обратите внимание на запись «%40» вместо «@» и «+» вместо пробела: данные формы кодируются, чтобы пройти по адресу без потерь.
	</p>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-5);
		align-items: start;
	}
	form {
		display: grid;
		gap: var(--space-2);
	}
	form input[type='text'],
	form input[type='email'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		min-width: 0;
	}
	.chk {
		display: flex;
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
	}
	.msgs {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-5);
		color: var(--text-primary);
	}
</style>
