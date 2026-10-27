<!--
	Two labs for part 6, lesson 7. In `flows` mode four ways to sign in (a password with a session,
	a JWT, OAuth through a provider, a passkey) are walked step by step between the browser, the
	server and, where there is one, the provider; a button shows what an attacker who stole one
	thing from each scenario would gain. In `jwt` mode a token is built and signed in the browser
	with HMAC SHA-256 (the browser's own crypto; nothing leaves the page): its two readable parts
	are decoded, and changing the role in the payload breaks the signature. The scenarios are
	simplified: real systems add refresh, revocation and second factors.
-->
<script lang="ts">
	import './shared.css';

	let { mode = 'flows' }: { mode?: 'flows' | 'jwt' } = $props();

	// ----- flows
	type Flow = { id: string; name: string; steps: [string, string][]; steal: string; verdict: string };
	const flows: Flow[] = [
		{
			id: 'session',
			name: 'Пароль и сессия',
			steps: [
				['Браузер → сервер', 'Посетитель вводит пароль, форма отправляет его по HTTPS.'],
				['Сервер', 'Хеширует пароль и сравнивает с хешем в базе. Совпало: создаёт сессию и запоминает её номер.'],
				['Сервер → браузер', 'Set-Cookie: sid=… (HttpOnly; Secure; SameSite). Браузер сохраняет cookie.'],
				['Браузер → сервер', 'Каждый следующий запрос несёт cookie, и сервер узнаёт посетителя по номеру сессии.']
			],
			steal: 'Если украли cookie сессии, злоумышленник входит «как вы», пока сессия жива. Поэтому HttpOnly, Secure, короткий срок и выход со всех устройств. Если украли базу, он получит хеши, но не пароли.',
			verdict: 'Просто и привычно. Сервер помнит сессии, и их можно мгновенно закрыть. Нужен надёжный пароль и защита базы.'
		},
		{
			id: 'jwt',
			name: 'JWT-токен',
			steps: [
				['Браузер → сервер', 'Пароль или другой способ входа, как обычно.'],
				['Сервер', 'Проверил и выпустил токен: подписанный JSON с номером пользователя, ролью и сроком.'],
				['Сервер → браузер', 'Токен возвращается клиенту (лучше в HttpOnly-cookie).'],
				['Браузер → сервер', 'Токен идёт в каждом запросе, а сервер проверяет подпись, и базы не нужно.']
			],
			steal: 'Кто украл токен, действует от вашего имени до конца срока: отозвать его досрочно трудно, поэтому срок делают коротким. Секрет подписи утёк: подделать можно любой токен.',
			verdict: 'Удобно для API и многих серверов, потому что состояния на сервере нет. Платой стала трудность отзыва.'
		},
		{
			id: 'oauth',
			name: 'Вход через Яндекс ID (OAuth)',
			steps: [
				['Браузер → ваш сайт', 'Нажали «Войти через Яндекс».'],
				['Браузер → Яндекс', 'Сайт переадресует на страницу Яндекса, где вы вводите пароль (сайту он не виден).'],
				['Яндекс → ваш сайт', 'Яндекс возвращает посетителя на сайт с одноразовым кодом.'],
				['Ваш сервер → Яндекс', 'Сервер обменивает код на токен и узнаёт, кто вошёл. Дальше своя сессия.']
			],
			steal: 'Пароль у вашего сайта не хранится и красть нечего. Но если взломан аккаунт у провайдера, взломан и вход на ваш сайт, а данные посетителя проходят через стороннего оператора.',
			verdict: 'Не надо хранить пароли и придумывать восстановление. Зависимость от провайдера и вопросы по персональным данным.'
		},
		{
			id: 'passkey',
			name: 'Пасскей',
			steps: [
				['Регистрация', 'Устройство создаёт пару ключей. Открытый ключ уходит на сайт, закрытый остаётся на устройстве.'],
				['Вход: сайт → браузер', 'Сайт присылает случайную строку (вызов).'],
				['Устройство', 'Подтверждение отпечатком, лицом или PIN, и закрытый ключ подписывает вызов для адреса именно этого сайта.'],
				['Браузер → сайт', 'Сайт проверяет подпись открытым ключом. Пароля не было, передавать было нечего.']
			],
			steal: 'Из базы сайта можно украсть только открытые ключи: войти по ним нельзя. На поддельном сайте подпись для настоящего адреса не получится: фишинг не работает.',
			verdict: 'Самый безопасный из четырёх. Минус: людям ещё непривычно, нужен запасной способ входа.'
		}
	];
	let pick = $state('session');
	let step = $state(0);
	let stolen = $state(false);
	const cur = $derived(flows.find((f) => f.id === pick)!);
	const select = (id: string) => {
		pick = id;
		step = 0;
		stolen = false;
	};

	// ----- JWT
	const secret = 'учебный-секрет';
	const b64 = (s: string | Uint8Array) => {
		const bytes = typeof s === 'string' ? new TextEncoder().encode(s) : s;
		let bin = '';
		bytes.forEach((b) => (bin += String.fromCharCode(b)));
		return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	};
	const unb64 = (s: string) => {
		const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
		return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
	};
	async function sign(data: string): Promise<string> {
		const enc = new TextEncoder();
		const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
		return b64(new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data))));
	}
	const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	let role = $state('visitor');
	let editMode = $state(false);
	let genuine = $state('');
	let valid = $state(true);
	const payloadOf = (r: string) => b64(JSON.stringify({ sub: 'user-42', role: r, exp: 1893456000 }));
	// the token the server issued says "visitor"; the one the attacker sends carries the chosen role
	$effect(() => {
		const issued = payloadOf('visitor');
		const sent = payloadOf(editMode ? role : 'visitor');
		let live = true;
		sign(`${header}.${issued}`).then((s) => {
			if (!live) return;
			genuine = s;
			sign(`${header}.${sent}`).then((s2) => live && (valid = s2 === s));
		});
		return () => (live = false);
	});
	const sentPayload = $derived(payloadOf(editMode ? role : 'visitor'));
	const decoded = $derived.by(() => {
		try {
			return JSON.stringify(JSON.parse(unb64(sentPayload)), null, 1);
		} catch {
			return '';
		}
	});
</script>

{#if mode === 'flows'}
	<figure class="dg">
		<figcaption>Четыре способа войти</figcaption>
		<div class="dg-ctl" role="group" aria-label="Способ входа">
			{#each flows as f (f.id)}
				<button type="button" aria-pressed={pick === f.id} onclick={() => select(f.id)}>{f.name}</button>
			{/each}
		</div>
		<ol class="steps dg-box">
			{#each cur.steps as [who, what], i (i)}
				<li class:done={i <= step}><strong>{who}.</strong> {what}</li>
			{/each}
		</ol>
		<div class="dg-ctl">
			<button type="button" onclick={() => (step = Math.min(step + 1, cur.steps.length - 1))} disabled={step >= cur.steps.length - 1}>Следующий шаг</button>
			<button type="button" onclick={() => (stolen = !stolen)} aria-pressed={stolen}>Что можно украсть?</button>
		</div>
		<p class="dg-out" aria-live="polite">{stolen ? cur.steal : cur.verdict}</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>Токен читается всеми, подделать его нельзя</figcaption>
		<pre class="dg-box dg-mono token"><span class="h">{header}</span>.<span class="p">{sentPayload}</span>.<span class="s">{genuine}</span></pre>
		<div class="two">
			<section aria-label="Содержимое токена">
				<div class="dh">Вторая часть, расшифрованная любым желающим</div>
				<pre class="dg-box dg-mono">{decoded}</pre>
			</section>
			<section aria-label="Проверка на сервере" aria-live="polite">
				<div class="dh">Что делает сервер</div>
				<label class="chk"><input type="checkbox" bind:checked={editMode} /> злоумышленник заменил роль в токене на</label>
				<select bind:value={role} disabled={!editMode} aria-label="Роль в подменённом токене">
					<option value="visitor">visitor</option>
					<option value="admin">admin</option>
				</select>
				<p class="verdict" class:bad={!valid}><strong>{valid ? 'Подпись сошлась: токен принят.' : 'Подпись не сошлась: токен отвергнут.'}</strong> {valid ? 'Сервер пересчитал подпись по первым двум частям и своему секрету, и она совпала с третьей.' : 'Тело изменили, а подписать новое без секрета нельзя: пересчитанная подпись отличается от присланной.'}</p>
			</section>
		</div>
		<p class="note">Секрет здесь учебный и лежит в этой странице. В жизни он только на сервере. Токен ничего не шифрует: даже подписанный, он читается, поэтому не кладите в него то, что нельзя показать.</p>
	</figure>
{/if}

<style>
	.steps {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.steps li {
		color: var(--text-secondary);
	}
	.steps li.done {
		color: var(--text-primary);
	}
	.token {
		margin: 0 0 var(--space-3);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 0.8rem;
	}
	.token .h {
		color: var(--echo-400);
	}
	.token .p {
		color: var(--accent-state-text);
	}
	.token .s {
		color: var(--brass-300);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		font-size: 0.82rem;
	}
	select {
		min-height: var(--hit-min);
	}
	.verdict {
		margin: var(--space-3) 0 0;
	}
	.verdict.bad {
		color: var(--brass-300);
	}
	.note {
		margin: var(--space-3) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
</style>
