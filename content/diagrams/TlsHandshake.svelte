<!--
	«Рукопожатие TLS» (part 1, lesson 7). Two modes: plain HTTP, where a third party on the path
	reads everything, and HTTPS, where the TLS 1.3 handshake runs first and what the third party
	sees afterwards is noise. One switch gives the server a certificate for another name, and the
	browser stops at the check. The ciphertext is a made-up hex string: no real cryptography runs.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			phone: '+7 000 000-00-00',
			host: 'www.example.ru',
			other: 'www.other-site.ru',
			guest: 'Анна',
			path: '/zayavka',
			who: { bs: 'Браузер → сервер', sb: 'Сервер → браузер', check: 'Браузер проверяет', both: 'Обе стороны' },
			hello: 'ClientHello: «Хочу говорить с www.example.ru. Умею такие шифры. Вот моя половина общего секрета.»',
			helloSeen: 'видно: что браузер зашёл на www.example.ru, и список шифров. Содержимое страниц ещё не передано.',
			serverHello: 'ServerHello: «Выбираю этот шифр. Вот моя половина общего секрета.» Теперь у обеих сторон есть общий секрет, и дальше всё зашифровано.',
			serverHelloSeen: 'видно: что выбран шифр. Общий секрет подслушать нельзя: по двум половинкам его не восстановить.',
			certFake: 'Сертификат: «Я www.other-site.ru» (но вы шли на www.example.ru). Подпись, что секретный ключ у меня.',
			certOk: 'Сертификат: «Я www.example.ru». Подписан удостоверяющим центром. Плюс подпись, что секретный ключ у меня.',
			certSeen: 'не видно: сертификат уже идёт в зашифрованном виде.',
			checkFake: 'Имя в сертификате не совпадает с адресом. Браузер останавливается и показывает предупреждение: «Подключение не защищено».',
			checkOk: 'Проверка: подпись удостоверяющего центра верна, имя совпадает, срок не истёк, центру доверяют. Всё сходится.',
			unseen: 'не видно.',
			finished: 'Finished: «Мы оба видели одно и то же рукопожатие.» Начинается обмен данными.',
			encrypted: 'Зашифрованный запрос с вашими данными.',
			caption: 'Что видит тот, кто подслушивает',
			protocol: 'Протокол',
			fakeCert: 'Сертификат на чужое имя',
			eavesdropper: 'Подслушивающий:',
			next: 'Следующий шаг',
			restart: 'Сначала',
			plain: 'В HTTP нет рукопожатия: браузер сразу отправляет запрос. Он идёт открытым текстом через Wi-Fi, роутеры и серверы провайдера.',
			wire: 'Что на проводе у подслушивающего',
			stopped: 'Соединение остановлено: данные не отправлены.',
			nothing: 'Пока ничего: данные ещё не отправлены.',
			readable: 'Читается всё:',
			readableRest: 'и адрес, и имя, и телефон. Тот, кто сидит на пути, может ещё и изменить ответ, например вставить в страницу рекламу.'
		},
		en: {
			phone: '+44 0000 000000',
			host: 'www.example.com',
			other: 'www.other-site.com',
			guest: 'Anna',
			path: '/inquiry',
			who: { bs: 'Browser → server', sb: 'Server → browser', check: 'The browser checks', both: 'Both sides' },
			hello: 'ClientHello: “I want to talk to www.example.com. I know these ciphers. Here is my half of the shared secret.”',
			helloSeen: 'visible: that the browser went to www.example.com, and the list of ciphers. No page content has been sent yet.',
			serverHello: 'ServerHello: “I choose this cipher. Here is my half of the shared secret.” Now both sides have a shared secret, and everything after this is encrypted.',
			serverHelloSeen: 'visible: that a cipher was chosen. The shared secret can’t be overheard: it can’t be rebuilt from the two halves.',
			certFake: 'Certificate: “I am www.other-site.com” (but you were going to www.example.com). Plus a signature proving the secret key is mine.',
			certOk: 'Certificate: “I am www.example.com”. Signed by a certificate authority. Plus a signature proving the secret key is mine.',
			certSeen: 'not visible: the certificate is already traveling encrypted.',
			checkFake: 'The name in the certificate doesn’t match the address. The browser stops and shows a warning: “Your connection is not private”.',
			checkOk: 'The check: the certificate authority’s signature is valid, the name matches, the date hasn’t expired, the authority is trusted. Everything adds up.',
			unseen: 'not visible.',
			finished: 'Finished: “We both saw the same handshake.” The exchange of data begins.',
			encrypted: 'An encrypted request carrying your data.',
			caption: 'What an eavesdropper sees',
			protocol: 'Protocol',
			fakeCert: 'A certificate for another name',
			eavesdropper: 'Eavesdropper:',
			next: 'Next step',
			restart: 'Start over',
			plain: 'HTTP has no handshake: the browser sends the request at once. It travels as plain text through Wi-Fi, routers and the provider’s servers.',
			wire: 'What is on the wire for an eavesdropper',
			stopped: 'The connection was stopped: no data was sent.',
			nothing: 'Nothing yet: no data has been sent.',
			readable: 'Everything is readable:',
			readableRest: 'the address, the name and the phone number. Someone sitting on the path can also change the response, for example by inserting an ad into the page.'
		}
	});

	let phone = $state(W.phone);
	onMount(async () => {
		try {
			phone = (await (await import('#lib/learner.ts')).persona()).phone || phone;
		} catch {
			/* example stays */
		}
	});

	let secure = $state(true);
	let fake = $state(false);
	let step = $state(0);

	const secret = $derived(`POST ${W.path} HTTP/1.1\nHost: ${W.host}\n\nname=${W.guest}&phone=${phone}`);
	const noise = (s: string) => {
		let h = 2166136261;
		let out = '';
		for (let i = 0; i < s.length; i++) {
			h = Math.imul(h ^ s.charCodeAt(i), 16777619);
			out += ((h >>> 0) & 0xffff).toString(16).padStart(4, '0');
		}
		return out.slice(0, 96).replace(/(.{4})/g, '$1 ').trim();
	};

	type S = { who: string; text: string; seen: string };
	const handshake = $derived<S[]>([
		{ who: W.who.bs, text: W.hello, seen: W.helloSeen },
		{ who: W.who.sb, text: W.serverHello, seen: W.serverHelloSeen },
		{ who: W.who.sb, text: fake ? W.certFake : W.certOk, seen: W.certSeen },
		{ who: W.who.check, text: fake ? W.checkFake : W.checkOk, seen: W.unseen },
		{ who: W.who.both, text: W.finished, seen: W.unseen },
		{ who: W.who.bs, text: W.encrypted, seen: noise(secret) }
	]);
	const last = $derived(fake ? 3 : handshake.length - 1);
	const shown = $derived(handshake.slice(0, Math.min(step, last) + 1));
	const stopped = $derived(fake && step >= 3);
	const eavesdrop = $derived(secure ? (step >= 5 && !stopped ? noise(secret) : null) : secret);
	function toggle(v: boolean) {
		secure = v;
		step = 0;
	}
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.protocol}>
		<button type="button" aria-pressed={!secure} onclick={() => toggle(false)}>HTTP</button>
		<button type="button" aria-pressed={secure} onclick={() => toggle(true)}>HTTPS (TLS)</button>
		{#if secure}<label><input type="checkbox" bind:checked={fake} onchange={() => (step = 0)} /> {W.fakeCert}</label>{/if}
	</div>

	{#if secure}
		<ol class="steps" aria-live="polite">
			{#each shown as s, i (i)}
				<li class:stop={stopped && i === 3}>
					<p class="who">{i + 1}. {s.who}</p>
					<p>{s.text}</p>
					<p class="eve"><span>{W.eavesdropper}</span> {s.seen}</p>
				</li>
			{/each}
		</ol>
		<div class="dg-ctl">
			<button type="button" disabled={step >= last} onclick={() => (step += 1)}>{W.next}</button>
			<button type="button" disabled={step === 0} onclick={() => (step = 0)}>{W.restart}</button>
		</div>
	{:else}
		<p class="dg-out">{W.plain}</p>
	{/if}

	<div class="dh">{W.wire}</div>
	<pre class="dg-box dg-mono" aria-live="polite">{#if eavesdrop === null}{secure ? (stopped ? W.stopped : W.nothing) : ''}{:else}{eavesdrop}{/if}</pre>
	{#if !secure}<p class="dg-out"><strong>{W.readable}</strong> {W.readableRest}</p>{/if}
</figure>

<style>
	.steps {
		list-style: none;
		padding: 0 !important;
		margin: 0 0 var(--space-3);
		display: grid;
		gap: var(--space-3);
	}
	.steps li {
		padding: var(--space-3);
		border-left: 3px solid var(--border-brass);
		background: var(--surface-canvas);
	}
	.steps li.stop {
		border-left-color: var(--text-primary);
	}
	.steps p {
		margin: 0;
	}
	.who {
		color: var(--text-primary);
	}
	.eve {
		color: var(--text-secondary);
		margin-top: var(--space-1) !important;
		overflow-wrap: anywhere;
	}
	.eve span {
		font-weight: var(--weight-medium);
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		min-height: 4.5rem;
	}
</style>
