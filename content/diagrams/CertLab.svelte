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

	let domain = $state('example.ru');
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
			? [
					'Вы просите сертификат на ' + names.join(' и ') + ' (программа на сервере: Certbot, Caddy или кнопка в панели хостинга).',
					'Центр отвечает: «Положите по адресу http://' + domain + '/.well-known/acme-challenge/<случайная строка> файл с таким содержимым».',
					'Программа кладёт файл. Для этого порт 80 должен быть открыт: HTTP-проверка идёт именно по нему.',
					'Центр сам заходит по этому адресу, находит файл и убеждается, что сайтом управляете вы.',
					'Центр подписывает сертификат. Задолго до конца срока программа сама запросит новый.'
				]
			: [
					'Вы просите сертификат на ' + names.join(' и ') + '.',
					'Центр отвечает: «Добавьте в DNS запись TXT с именем _acme-challenge.' + domain + ' и таким значением».',
					'Программа сама добавляет запись через API вашего DNS-провайдера (вручную это делать не стоит: через пару месяцев всё повторится).',
					'Центр спрашивает DNS и находит запись: значит, зона ваша. Веб-сервер для этого не нужен, порт 80 может быть закрыт.',
					'Центр подписывает сертификат. Для *.' + domain + ' годится только эта проверка.'
				]
	);

	type Fault = { label: string; code: string; sees: string; why: string; fix: string };
	const faults = $derived<Record<string, Fault>>({
		none: { label: 'Всё в порядке', code: '', sees: 'Замочек, страница открывается.', why: 'Сертификат действует, имя совпадает, цепочка полная, на странице нет ресурсов по http.', fix: 'Ничего делать не нужно. Следите за сроком.' },
		expired: { label: 'Срок истёк', code: 'NET::ERR_CERT_DATE_INVALID', sees: 'Полноэкранное предупреждение «Подключение не защищено». Большинство уйдёт.', why: 'Автоматическое продление молча перестало работать: сменили DNS, закрыли порт 80, кончилось место на диске.', fix: 'Продлите вручную (certbot renew), найдите причину в журнале и поставьте мониторинг срока.' },
		name: { label: 'Имя не совпало', code: 'NET::ERR_CERT_COMMON_NAME_INVALID', sees: 'Предупреждение: сертификат выдан на другое имя.', why: `Сертификат выдан на ${domain}, а посетитель зашёл на www.${domain} (или на поддомен).`, fix: 'Выпустите сертификат на все имена сразу: корень и www, поддомены или wildcard.' },
		chain: { label: 'Неполная цепочка', code: 'NET::ERR_CERT_AUTHORITY_INVALID', sees: 'Работает в одном браузере и «не защищено» в другом, на телефонах и в программах (curl, вебхуки).', why: 'Сервер отдаёт только свой сертификат, а промежуточный забыл. Часть браузеров докачивает его сами, остальные нет.', fix: 'Настройте полную цепочку (файл fullchain.pem), а не один сертификат.' },
		mixed: { label: 'Картинка по http', code: 'Mixed Content', sees: 'Замочек есть, но часть страницы не загрузилась: картинка не появилась, а скрипт заблокирован.', why: 'Страница открыта по https, а ссылка на картинку или скрипт начинается с http://. Браузер блокирует активное (скрипты, фреймы) и часто подменяет или блокирует пассивное (картинки).', fix: 'Замените http:// на https:// или на относительные адреса. Включите заголовок Content-Security-Policy: upgrade-insecure-requests как страховку.' }
	});
	const f = $derived(faults[fault]);
</script>

<figure class="dg">
	<figcaption>Как центр проверяет домен и что видит посетитель, когда что-то сломалось</figcaption>

	<div class="dg-ctl">
		<label>Домен <input type="text" bind:value={domain} class="dg-mono" size="16" /></label>
		<label><input type="checkbox" bind:checked={wildcard} /> Нужен wildcard (*.{domain}) для любых поддоменов</label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Способ проверки">
		<button type="button" aria-pressed={effective === 'http'} disabled={wildcard} onclick={() => (challenge = 'http')}>Проверка по HTTP (HTTP-01)</button>
		<button type="button" aria-pressed={effective === 'dns'} onclick={() => (challenge = 'dns')}>Проверка через DNS (DNS-01)</button>
	</div>
	{#if wildcard}<p class="dg-out">Wildcard выдаётся только после проверки через DNS: файл на сайте не докажет, что вам принадлежат все поддомены.</p>{/if}
	<ol class="steps">
		{#each steps as s, i (i)}<li>{s}</li>{/each}
	</ol>
	{#if langs.includes('en')}<p class="dg-out">В вашем брифе два языка. Если английская версия в каталоге <span class="dg-mono">/en/</span>, отдельный сертификат не нужен. Если на поддомене <span class="dg-mono">en.{domain}</span>, он должен быть среди имён сертификата или под wildcard.</p>{/if}

	<div class="dh">Что сломалось</div>
	<div class="dg-ctl" role="group" aria-label="Поломка">
		{#each Object.entries(faults) as [k, v] (k)}
			<button type="button" aria-pressed={fault === k} onclick={() => (fault = k as typeof fault)}>{v.label}</button>
		{/each}
	</div>
	<div class="dg-box" aria-live="polite">
		{#if f.code}<p class="dg-mono">{f.code}</p>{/if}
		<p><strong>Посетитель видит.</strong> {f.sees}</p>
		<p><strong>Почему.</strong> {f.why}</p>
		<p><strong>Что делать.</strong> {f.fix}</p>
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
