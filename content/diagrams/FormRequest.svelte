<!--
	«Что уйдёт при отправке формы» (part 2, lesson 6). A small real form next to the HTTP request
	the browser would build from it: the method (GET puts the data into the address, POST into the
	body), the field names, and the percent-encoding. The browser's own validation talks too: the
	messages shown are the ones it produces for that field. Nothing is sent: the form is never
	submitted and no address is requested.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per
	// edition, picked by the page's locale.
	const W = pick({
		ru: {
			name: 'Анна',
			path: 'zayavka',
			host: 'zarechye.example',
			caption: 'От формы к запросу',
			methodLabel: 'Метод отправки',
			required: 'поля обязательные',
			typeEmail: 'у контакта type="email"',
			fName: 'Имя',
			fMail: 'Почта',
			fConsent: 'Согласие',
			consent: 'Согласен на обработку данных',
			send: 'Отправить (не уйдёт)',
			requestTitle: 'Запрос, который построит браузер',
			validation: 'Что говорит проверка в браузере',
			allGood: 'Все поля в порядке: браузер отправил бы форму.',
			get: 'GET кладёт данные прямо в адрес: они остаются в истории, в логах сервера и в ссылке, которой можно поделиться. Так хорошо работает поиск, но заявку с телефоном отправлять так нельзя.',
			post: 'POST кладёт данные в тело запроса, в адресе их нет. Именно так отправляют заявки и всё, что меняет что-то на сервере. Но и тело открыто, если соединение без защиты: поэтому форму отдают только по HTTPS.',
			encoded: 'Обратите внимание на запись «%40» вместо «@» и «+» вместо пробела: данные формы кодируются, чтобы пройти по адресу без потерь.'
		},
		en: {
			name: 'Anna',
			path: 'inquiry',
			host: 'riverbend.example',
			caption: 'From a form to a request',
			methodLabel: 'Sending method',
			required: 'fields are required',
			typeEmail: 'the contact has type="email"',
			fName: 'Name',
			fMail: 'Email',
			fConsent: 'Consent',
			consent: 'I agree to my details being used to reply',
			send: 'Send (it won’t go)',
			requestTitle: 'The request the browser will build',
			validation: 'What the browser’s validation says',
			allGood: 'All fields are fine: the browser would send the form.',
			get: 'GET puts the data straight into the address. It stays in the history, in the server’s logs and in any link someone shares. That suits a search box, but never an inquiry with a phone number in it.',
			post: 'POST puts the data in the body of the request, not in the address. That’s how inquiries and anything that changes something on a server are sent. The body is still readable on an unprotected connection, which is why forms are served only over HTTPS.',
			encoded: 'Notice “%40” in place of “@” and “+” in place of a space: form data is encoded so that it can travel in an address without loss.'
		}
	});

	let method = $state<'POST' | 'GET'>('POST');
	let name = $state(W.name);
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
			? `GET /${W.path}?${params} HTTP/1.1\nHost: ${W.host}`
			: `POST /${W.path} HTTP/1.1\nHost: ${W.host}\nContent-Type: application/x-www-form-urlencoded\nContent-Length: ${new TextEncoder().encode(params).length}\n\n${params}`
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.methodLabel}>
		<button type="button" aria-pressed={method === 'POST'} onclick={() => (method = 'POST')}>method="post"</button>
		<button type="button" aria-pressed={method === 'GET'} onclick={() => (method = 'GET')}>method="get"</button>
		<label><input type="checkbox" bind:checked={required} /> {W.required}</label>
		<label><input type="checkbox" checked={kind === 'email'} onchange={(e) => (kind = e.currentTarget.checked ? 'email' : 'text')} /> {W.typeEmail}</label>
	</div>
	<div class="cols">
		<form bind:this={form} novalidate onsubmit={(e) => e.preventDefault()}>
			<label for="fr-name">{W.fName}</label>
			<input id="fr-name" name="name" type="text" data-label={W.fName} {required} bind:value={name} autocomplete="off" />
			<label for="fr-contact">{W.fMail}</label>
			<input id="fr-contact" name="contact" type={kind} data-label={W.fMail} {required} bind:value={contact} autocomplete="off" />
			<label class="chk"><input type="checkbox" name="consent" data-label={W.fConsent} {required} bind:checked={consent} /> {W.consent}</label>
			<button type="submit">{W.send}</button>
		</form>
		<div>
			<div class="dh">{W.requestTitle}</div>
			<pre class="dg-box dg-mono">{request}</pre>
		</div>
	</div>
	<div class="dh">{W.validation}</div>
	{#if messages.length}
		<ul class="msgs" aria-live="polite">
			{#each messages as m (m)}<li>{m}</li>{/each}
		</ul>
	{:else}
		<p class="dg-out" aria-live="polite">{W.allGood}</p>
	{/if}
	<p class="dg-out">
		{method === 'GET' ? W.get : W.post}
		{W.encoded}
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
	}
	.msgs {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-5);
		color: var(--text-primary);
	}
</style>
