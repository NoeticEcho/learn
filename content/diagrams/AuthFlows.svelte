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
	import { pick } from '#lib/i18n/index.ts';

	let { mode = 'flows' }: { mode?: 'flows' | 'jwt' } = $props();

	const W = pick({
		ru: {
			flows: [
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
			],
			secret: 'учебный-секрет',
			flowsCaption: 'Четыре способа войти',
			flowsGroup: 'Способ входа',
			nextStep: 'Следующий шаг',
			steal: 'Что можно украсть?',
			jwtCaption: 'Токен читается всеми, подделать его нельзя',
			contentLabel: 'Содержимое токена',
			decodedHead: 'Вторая часть, расшифрованная любым желающим',
			checkLabel: 'Проверка на сервере',
			whatServer: 'Что делает сервер',
			attackerSwapped: 'злоумышленник заменил роль в токене на',
			roleLabel: 'Роль в подменённом токене',
			okTitle: 'Подпись сошлась: токен принят.',
			badTitle: 'Подпись не сошлась: токен отвергнут.',
			okWhy: 'Сервер пересчитал подпись по первым двум частям и своему секрету, и она совпала с третьей.',
			badWhy: 'Тело изменили, а подписать новое без секрета нельзя: пересчитанная подпись отличается от присланной.',
			note: 'Секрет здесь учебный и лежит в этой странице. В жизни он только на сервере. Токен ничего не шифрует: даже подписанный, он читается, поэтому не кладите в него то, что нельзя показать.'
		},
		en: {
			flows: [
				{
					id: 'session',
					name: 'Password and session',
					steps: [
						['Browser → server', 'The visitor types a password, and the form sends it over HTTPS.'],
						['Server', 'Hashes the password and compares it with the hash in the database. A match: it creates a session and remembers its number.'],
						['Server → browser', 'Set-Cookie: sid=… (HttpOnly; Secure; SameSite). The browser stores the cookie.'],
						['Browser → server', 'Every next request carries the cookie, and the server recognizes the visitor by the session number.']
					],
					steal: 'If the session cookie is stolen, the attacker signs in “as you” for as long as the session lives. That is why HttpOnly, Secure, a short lifetime and sign-out on every device. If the database is stolen, they get hashes, not passwords.',
					verdict: 'Simple and familiar. The server remembers sessions, and they can be closed instantly. It needs a strong password and a protected database.'
				},
				{
					id: 'jwt',
					name: 'JWT token',
					steps: [
						['Browser → server', 'A password or another way of signing in, as usual.'],
						['Server', 'Checked, and issued a token: signed JSON with the user’s number, a role and an expiry time.'],
						['Server → browser', 'The token goes back to the client (best in an HttpOnly cookie).'],
						['Browser → server', 'The token travels with every request, and the server checks the signature. No database needed.']
					],
					steal: 'Whoever steals the token acts in your name until it expires: revoking it early is hard, so the lifetime is kept short. If the signing secret leaks, any token can be forged.',
					verdict: 'Handy for APIs and many servers, because the server keeps no state. The price is that revocation is hard.'
				},
				{
					id: 'oauth',
					name: 'Sign in with Google (OAuth)',
					steps: [
						['Browser → your site', 'The visitor presses “Sign in with Google”.'],
						['Browser → Google', 'The site redirects to Google’s page, where the visitor types the password (the site never sees it).'],
						['Google → your site', 'Google sends the visitor back to the site with a one-time code.'],
						['Your server → Google', 'The server exchanges the code for a token and learns who signed in. After that, a session of its own.']
					],
					steal: 'Your site stores no password, so there is nothing to steal. But if the account at the provider is broken into, so is the sign-in to your site, and the visitor’s data passes through a third-party operator.',
					verdict: 'No passwords to store and no recovery flow to invent. In return: dependence on the provider and questions about personal data.'
				},
				{
					id: 'passkey',
					name: 'Passkey',
					steps: [
						['Registration', 'The device creates a pair of keys. The public key goes to the site, the private key stays on the device.'],
						['Sign-in: site → browser', 'The site sends a random string (a challenge).'],
						['Device', 'A fingerprint, face or PIN confirms it, and the private key signs the challenge for this very site’s address.'],
						['Browser → site', 'The site checks the signature with the public key. There was no password, so there was nothing to send.']
					],
					steal: 'From the site’s database only public keys can be stolen, and they cannot be used to sign in. On a fake site a signature for the real address cannot be made: phishing does not work.',
					verdict: 'The safest of the four. The minus: people are not used to it yet, and a fallback way to sign in is needed.'
				}
			],
			secret: 'learning-secret',
			flowsCaption: 'Four ways to sign in',
			flowsGroup: 'Way of signing in',
			nextStep: 'Next step',
			steal: 'What can be stolen?',
			jwtCaption: 'Anyone can read a token, and nobody can forge it',
			contentLabel: 'Contents of the token',
			decodedHead: 'The second part, decoded by anyone who likes',
			checkLabel: 'Check on the server',
			whatServer: 'What the server does',
			attackerSwapped: 'an attacker swapped the role in the token for',
			roleLabel: 'Role in the swapped token',
			okTitle: 'The signature matches: the token is accepted.',
			badTitle: 'The signature does not match: the token is rejected.',
			okWhy: 'The server recomputed the signature from the first two parts and its own secret, and it matched the third.',
			badWhy: 'The body was changed, and a new one cannot be signed without the secret: the recomputed signature differs from the one sent.',
			note: 'The secret here is for learning and sits in this page. In real life it is only on the server. A token encrypts nothing: even signed, it can be read, so put nothing in it that must not be shown.'
		}
	});

	// ----- flows
	type Flow = { id: string; name: string; steps: [string, string][]; steal: string; verdict: string };
	const flows: Flow[] = W.flows as Flow[];
	let chosen = $state('session');
	let step = $state(0);
	let stolen = $state(false);
	const cur = $derived(flows.find((f) => f.id === chosen)!);
	const select = (id: string) => {
		chosen = id;
		step = 0;
		stolen = false;
	};

	// ----- JWT
	const secret = W.secret;
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
		<figcaption>{W.flowsCaption}</figcaption>
		<div class="dg-ctl" role="group" aria-label={W.flowsGroup}>
			{#each flows as f (f.id)}
				<button type="button" aria-pressed={chosen === f.id} onclick={() => select(f.id)}>{f.name}</button>
			{/each}
		</div>
		<ol class="steps dg-box">
			{#each cur.steps as [who, what], i (i)}
				<li class:done={i <= step}><strong>{who}.</strong> {what}</li>
			{/each}
		</ol>
		<div class="dg-ctl">
			<button type="button" onclick={() => (step = Math.min(step + 1, cur.steps.length - 1))} disabled={step >= cur.steps.length - 1}>{W.nextStep}</button>
			<button type="button" onclick={() => (stolen = !stolen)} aria-pressed={stolen}>{W.steal}</button>
		</div>
		<p class="dg-out" aria-live="polite">{stolen ? cur.steal : cur.verdict}</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>{W.jwtCaption}</figcaption>
		<pre class="dg-box dg-mono token"><span class="h">{header}</span>.<span class="p">{sentPayload}</span>.<span class="s">{genuine}</span></pre>
		<div class="two">
			<section aria-label={W.contentLabel}>
				<div class="dh">{W.decodedHead}</div>
				<pre class="dg-box dg-mono">{decoded}</pre>
			</section>
			<section aria-label={W.checkLabel} aria-live="polite">
				<div class="dh">{W.whatServer}</div>
				<label class="chk"><input type="checkbox" bind:checked={editMode} /> {W.attackerSwapped}</label>
				<select bind:value={role} disabled={!editMode} aria-label={W.roleLabel}>
					<option value="visitor">visitor</option>
					<option value="admin">admin</option>
				</select>
				<p class="verdict" class:bad={!valid}><strong>{valid ? W.okTitle : W.badTitle}</strong> {valid ? W.okWhy : W.badWhy}</p>
			</section>
		</div>
		<p class="note">{W.note}</p>
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
