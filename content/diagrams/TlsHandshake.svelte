<!--
	«Рукопожатие TLS» (part 1, lesson 7). Two modes: plain HTTP, where a third party on the path
	reads everything, and HTTPS, where the TLS 1.3 handshake runs first and what the third party
	sees afterwards is noise. One switch gives the server a certificate for another name, and the
	browser stops at the check. The ciphertext is a made-up hex string: no real cryptography runs.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let phone = $state('+7 000 000-00-00');
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

	const secret = $derived(`POST /zayavka HTTP/1.1\nHost: www.example.ru\n\nname=Анна&phone=${phone}`);
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
		{ who: 'Браузер → сервер', text: 'ClientHello: «Хочу говорить с www.example.ru. Умею такие шифры. Вот моя половина общего секрета.»', seen: 'видно: что браузер зашёл на www.example.ru, и список шифров. Содержимое страниц ещё не передано.' },
		{ who: 'Сервер → браузер', text: 'ServerHello: «Выбираю этот шифр. Вот моя половина общего секрета.» Теперь у обеих сторон есть общий секрет, и дальше всё зашифровано.', seen: 'видно: что выбран шифр. Общий секрет подслушать нельзя: по двум половинкам его не восстановить.' },
		{ who: 'Сервер → браузер', text: fake ? 'Сертификат: «Я www.other-site.ru» (но вы шли на www.example.ru). Подпись, что секретный ключ у меня.' : 'Сертификат: «Я www.example.ru». Подписан удостоверяющим центром. Плюс подпись, что секретный ключ у меня.', seen: 'не видно: сертификат уже идёт в зашифрованном виде.' },
		{ who: 'Браузер проверяет', text: fake ? 'Имя в сертификате не совпадает с адресом. Браузер останавливается и показывает предупреждение: «Подключение не защищено».' : 'Проверка: подпись удостоверяющего центра верна, имя совпадает, срок не истёк, центру доверяют. Всё сходится.', seen: 'не видно.' },
		{ who: 'Обе стороны', text: 'Finished: «Мы оба видели одно и то же рукопожатие.» Начинается обмен данными.', seen: 'не видно.' },
		{ who: 'Браузер → сервер', text: 'Зашифрованный запрос с вашими данными.', seen: noise(secret) }
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
	<figcaption>Что видит тот, кто подслушивает</figcaption>
	<div class="dg-ctl" role="group" aria-label="Протокол">
		<button type="button" aria-pressed={!secure} onclick={() => toggle(false)}>HTTP</button>
		<button type="button" aria-pressed={secure} onclick={() => toggle(true)}>HTTPS (TLS)</button>
		{#if secure}<label><input type="checkbox" bind:checked={fake} onchange={() => (step = 0)} /> Сертификат на чужое имя</label>{/if}
	</div>

	{#if secure}
		<ol class="steps" aria-live="polite">
			{#each shown as s, i (i)}
				<li class:stop={stopped && i === 3}>
					<p class="who">{i + 1}. {s.who}</p>
					<p>{s.text}</p>
					<p class="eve"><span>Подслушивающий:</span> {s.seen}</p>
				</li>
			{/each}
		</ol>
		<div class="dg-ctl">
			<button type="button" disabled={step >= last} onclick={() => (step += 1)}>Следующий шаг</button>
			<button type="button" disabled={step === 0} onclick={() => (step = 0)}>Сначала</button>
		</div>
	{:else}
		<p class="dg-out">В HTTP нет рукопожатия: браузер сразу отправляет запрос. Он идёт открытым текстом через Wi-Fi, роутеры и серверы провайдера.</p>
	{/if}

	<h4>Что на проводе у подслушивающего</h4>
	<pre class="dg-box dg-mono" aria-live="polite">{#if eavesdrop === null}{secure ? (stopped ? 'Соединение остановлено: данные не отправлены.' : 'Пока ничего: данные ещё не отправлены.') : ''}{:else}{eavesdrop}{/if}</pre>
	{#if !secure}<p class="dg-out"><strong>Читается всё:</strong> и адрес, и имя, и телефон. Тот, кто сидит на пути, может ещё и изменить ответ, например вставить в страницу рекламу.</p>{/if}
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
	h4 {
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
