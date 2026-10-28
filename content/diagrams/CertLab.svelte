<!--
	«Сертификат на практике» (part 9, lesson 3). Two halves. On the left, how Let's Encrypt
	checks that the domain is yours (the ACME challenge): the person picks HTTP-01 or DNS-01,
	ticks «wildcard», and sees which check is allowed and what must be put where. On the right,
	one switch breaks the site in a way that really happens (an expired certificate, a name that
	does not match, a missing intermediate, a plain-http image on an https page) and the page says
	what a visitor sees and what to do. The browser's own words are paraphrased; the error codes
	are Chrome's. A model: no certificate is issued and nothing is sent anywhere.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick, getLocale } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The browser's own words are paraphrased in both; the error codes are Chrome's.
	const W = pick({
		ru: {
			domain: 'example.ru',
			and: ' и ',
			http: [
				(n: string) => `Вы просите сертификат на ${n} (программа на сервере: Certbot, Caddy или кнопка в панели хостинга).`,
				(d: string) => `Центр отвечает: «Положите по адресу http://${d}/.well-known/acme-challenge/<случайная строка> файл с таким содержимым».`,
				'Программа кладёт файл. Для этого порт 80 должен быть открыт: HTTP-проверка идёт именно по нему.',
				'Центр сам заходит по этому адресу, находит файл и убеждается, что сайтом управляете вы.',
				'Центр подписывает сертификат. Задолго до конца срока программа сама запросит новый.'
			],
			dns: [
				(n: string) => `Вы просите сертификат на ${n}.`,
				(d: string) => `Центр отвечает: «Добавьте в DNS запись TXT с именем _acme-challenge.${d} и таким значением».`,
				'Программа сама добавляет запись через API вашего DNS-провайдера (вручную это делать не стоит: через пару месяцев всё повторится).',
				'Центр спрашивает DNS и находит запись: значит, зона ваша. Веб-сервер для этого не нужен, порт 80 может быть закрыт.',
				(d: string) => `Центр подписывает сертификат. Для *.${d} годится только эта проверка.`
			],
			faults: (domain: string) => ({
				none: { label: 'Всё в порядке', code: '', sees: 'Замочек, страница открывается.', why: 'Сертификат действует, имя совпадает, цепочка полная, на странице нет ресурсов по http.', fix: 'Ничего делать не нужно. Следите за сроком.' },
				expired: { label: 'Срок истёк', code: 'NET::ERR_CERT_DATE_INVALID', sees: 'Полноэкранное предупреждение «Подключение не защищено». Большинство уйдёт.', why: 'Автоматическое продление молча перестало работать: сменили DNS, закрыли порт 80, кончилось место на диске.', fix: 'Продлите вручную (certbot renew), найдите причину в журнале и поставьте мониторинг срока.' },
				name: { label: 'Имя не совпало', code: 'NET::ERR_CERT_COMMON_NAME_INVALID', sees: 'Предупреждение: сертификат выдан на другое имя.', why: `Сертификат выдан на ${domain}, а посетитель зашёл на www.${domain} (или на поддомен).`, fix: 'Выпустите сертификат на все имена сразу: корень и www, поддомены или wildcard.' },
				chain: { label: 'Неполная цепочка', code: 'NET::ERR_CERT_AUTHORITY_INVALID', sees: 'Работает в одном браузере и «не защищено» в другом, на телефонах и в программах (curl, вебхуки).', why: 'Сервер отдаёт только свой сертификат, а промежуточный забыл. Часть браузеров докачивает его сами, остальные нет.', fix: 'Настройте полную цепочку (файл fullchain.pem), а не один сертификат.' },
				mixed: { label: 'Картинка по http', code: 'Mixed Content', sees: 'Замочек есть, но часть страницы не загрузилась: картинка не появилась, а скрипт заблокирован.', why: 'Страница открыта по https, а ссылка на картинку или скрипт начинается с http://. Браузер блокирует активное (скрипты, фреймы) и часто подменяет или блокирует пассивное (картинки).', fix: 'Замените http:// на https:// или на относительные адреса. Включите заголовок Content-Security-Policy: upgrade-insecure-requests как страховку.' }
			}),
			caption: 'Как центр проверяет домен и что видит посетитель, когда что-то сломалось',
			domainLabel: 'Домен',
			wildcardLabel: (d: string) => `Нужен wildcard (*.${d}) для любых поддоменов`,
			howLabel: 'Способ проверки',
			httpBtn: 'Проверка по HTTP (HTTP-01)',
			dnsBtn: 'Проверка через DNS (DNS-01)',
			wildNote: 'Wildcard выдаётся только после проверки через DNS: файл на сайте не докажет, что вам принадлежат все поддомены.',
			twoLangs: 'В вашем брифе два языка. Если английская версия в каталоге',
			twoLangs2: ', отдельный сертификат не нужен. Если на поддомене',
			twoLangs3: ', он должен быть среди имён сертификата или под wildcard.',
			enPath: '/en/',
			enHost: (d: string) => `en.${d}`,
			broke: 'Что сломалось',
			brokeLabel: 'Поломка',
			sees: 'Посетитель видит.',
			why: 'Почему.',
			fix: 'Что делать.'
		},
		en: {
			domain: 'example.com',
			and: ' and ',
			http: [
				(n: string) => `You ask for a certificate for ${n} (a program on the server: Certbot, Caddy or a button in the host’s panel).`,
				(d: string) => `The authority replies: “Put a file with this content at http://${d}/.well-known/acme-challenge/<a random string>.”`,
				'The program puts the file there. Port 80 has to be open for that: the HTTP check goes over exactly that port.',
				'The authority comes to that address itself, finds the file and is satisfied that you control the site.',
				'The authority signs the certificate. Long before the term ends, the program asks for a new one by itself.'
			],
			dns: [
				(n: string) => `You ask for a certificate for ${n}.`,
				(d: string) => `The authority replies: “Add a TXT record named _acme-challenge.${d} to DNS, with this value.”`,
				'The program adds the record itself through your DNS provider’s API (doing it by hand isn’t worth it: in a couple of months it all repeats).',
				'The authority asks DNS and finds the record, so the zone is yours. No web server is needed for this, and port 80 can be closed.',
				(d: string) => `The authority signs the certificate. For *.${d} only this check will do.`
			],
			faults: (domain: string) => ({
				none: { label: 'All is well', code: '', sees: 'A padlock, and the page opens.', why: 'The certificate is valid, the name matches, the chain is complete and the page has no resources over http.', fix: 'Nothing to do. Watch the expiry date.' },
				expired: { label: 'Expired', code: 'NET::ERR_CERT_DATE_INVALID', sees: 'A full-screen warning: “Your connection is not private.” Most visitors will leave.', why: 'Automatic renewal quietly stopped working: DNS was changed, port 80 was closed, or the disk filled up.', fix: 'Renew by hand (certbot renew), find the cause in the log and set up an expiry monitor.' },
				name: { label: 'Name mismatch', code: 'NET::ERR_CERT_COMMON_NAME_INVALID', sees: 'A warning: the certificate was issued for a different name.', why: `The certificate was issued for ${domain}, and the visitor went to www.${domain} (or to a subdomain).`, fix: 'Issue a certificate for all the names at once: the root and www, subdomains or a wildcard.' },
				chain: { label: 'Incomplete chain', code: 'NET::ERR_CERT_AUTHORITY_INVALID', sees: 'It works in one browser and shows “not secure” in another, on phones and in programs (curl, webhooks).', why: 'The server sends only its own certificate and forgot the intermediate one. Some browsers fetch it themselves, the rest don’t.', fix: 'Set up the full chain (the fullchain.pem file), not a single certificate.' },
				mixed: { label: 'A picture over http', code: 'Mixed Content', sees: 'The padlock is there, but part of the page didn’t load: a picture didn’t appear and a script is blocked.', why: 'The page is open over https, and the link to a picture or a script starts with http://. The browser blocks the active kind (scripts, frames) and often swaps or blocks the passive kind (pictures).', fix: 'Change http:// to https:// or to relative addresses. Turn on the header Content-Security-Policy: upgrade-insecure-requests as insurance.' }
			}),
			caption: 'How an authority checks a domain, and what a visitor sees when something breaks',
			domainLabel: 'Domain',
			wildcardLabel: (d: string) => `I need a wildcard (*.${d}) for any subdomains`,
			howLabel: 'Way of checking',
			httpBtn: 'Check over HTTP (HTTP-01)',
			dnsBtn: 'Check through DNS (DNS-01)',
			wildNote: 'A wildcard is issued only after a check through DNS: a file on the site wouldn’t prove that you own all the subdomains.',
			twoLangs: 'Your brief has more than one language. If the extra version lives in a folder like',
			twoLangs2: ', no separate certificate is needed. If it lives on a subdomain like',
			twoLangs3: ', that name must be among the certificate’s names or covered by a wildcard.',
			enPath: '/es/',
			enHost: (d: string) => `es.${d}`,
			broke: 'What broke',
			brokeLabel: 'The breakage',
			sees: 'The visitor sees.',
			why: 'Why.',
			fix: 'What to do.'
		}
	});

	type Fn = (s: string) => string;
	let domain = $state(W.domain);
	let wildcard = $state(false);
	let challenge = $state<'http' | 'dns'>('http');
	let fault = $state<'none' | 'expired' | 'name' | 'chain' | 'mixed'>('none');
	let langs = $state<string[]>(['ru']);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			langs = p.languages ?? langs;
		} catch {
			/* the example stays */
		}
	});

	const effective = $derived(wildcard ? 'dns' : challenge);
	const names = $derived(wildcard ? [domain, `*.${domain}`] : [domain, `www.${domain}`]);
	const steps = $derived(
		effective === 'http'
			? [(W.http[0] as Fn)(names.join(W.and)), (W.http[1] as Fn)(domain), W.http[2] as string, W.http[3] as string, W.http[4] as string]
			: [(W.dns[0] as Fn)(names.join(W.and)), (W.dns[1] as Fn)(domain), W.dns[2] as string, W.dns[3] as string, (W.dns[4] as Fn)(domain)]
	);

	type Fault = { label: string; code: string; sees: string; why: string; fix: string };
	const faults = $derived<Record<string, Fault>>(W.faults(domain));
	const f = $derived(faults[fault]);
	const manyLangs = $derived(getLocale() === 'ru' ? langs.includes('en') : langs.length > 1);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>

	<div class="dg-ctl">
		<label>{W.domainLabel} <input type="text" bind:value={domain} class="dg-mono" size="16" /></label>
		<label><input type="checkbox" bind:checked={wildcard} /> {W.wildcardLabel(domain)}</label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.howLabel}>
		<button type="button" aria-pressed={effective === 'http'} disabled={wildcard} onclick={() => (challenge = 'http')}>{W.httpBtn}</button>
		<button type="button" aria-pressed={effective === 'dns'} onclick={() => (challenge = 'dns')}>{W.dnsBtn}</button>
	</div>
	{#if wildcard}<p class="dg-out">{W.wildNote}</p>{/if}
	<ol class="steps">
		{#each steps as s, i (i)}<li>{s}</li>{/each}
	</ol>
	{#if manyLangs}<p class="dg-out">{W.twoLangs} <span class="dg-mono">{W.enPath}</span>{W.twoLangs2} <span class="dg-mono">{W.enHost(domain)}</span>{W.twoLangs3}</p>{/if}

	<div class="dh">{W.broke}</div>
	<div class="dg-ctl" role="group" aria-label={W.brokeLabel}>
		{#each Object.entries(faults) as [k, v] (k)}
			<button type="button" aria-pressed={fault === k} onclick={() => (fault = k as typeof fault)}>{v.label}</button>
		{/each}
	</div>
	<div class="dg-box" aria-live="polite">
		{#if f.code}<p class="dg-mono">{f.code}</p>{/if}
		<p><strong>{W.sees}</strong> {f.sees}</p>
		<p><strong>{W.why}</strong> {f.why}</p>
		<p><strong>{W.fix}</strong> {f.fix}</p>
	</div>
</figure>

<style>
	.steps {
		margin: 0 0 var(--space-3);
	}
	.steps li {
		margin-bottom: var(--space-2);
		max-width: var(--measure);
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	p {
		margin: 0 0 var(--space-2);
	}
	input[type='text'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
	}
</style>
