<!--
	«Три пути выкладки» (part 9, lesson 8). A guided rehearsal, not a deployment: nothing leaves the
	person's browser. For each of the three ways to publish the downloaded site (GitHub Pages,
	Vercel, a Russian shared host) the page lists the real steps in order, with the address the
	site would get (made from the person's own project name), and lets them tick the steps off.
	Beside it, a symptom list (404, no styles, an old version, a certificate warning, the domain
	does not open, www does not open) answers with the usual cause and the fix. The steps follow
	the providers' documentation as read in October 2026; interfaces change, so each step names
	what to look for, not a pixel to click.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Step = { text: string; check?: string };
	type Way = { id: string; name: string; url: (slug: string) => string; steps: Step[]; note: string };
	type Symptom = { id: string; label: string; why: string; fix: string };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// Russian: GitHub Pages, Vercel, a Russian shared host. English: GitHub Pages, Vercel, an ordinary web host.
	const W = pick({
		ru: {
			slug: 'moi-sait',
			domain: 'example.ru',
			ways: [
		{
			id: 'pages',
			name: 'GitHub Pages',
			url: (s) => `https://ваш-аккаунт.github.io/${s}/`,
			note: 'Бесплатно для открытых репозиториев; сайт отдаётся из репозитория. Подходит для статических сайтов. По условиям GitHub, Pages не предназначен для интернет-магазина и другого коммерческого сервиса (октябрь 2026).',
			steps: [
				{ text: 'Скачайте свой сайт из галереи («Скачать сайт»): получится архив с файлами и README.' },
				{ text: 'Создайте аккаунт на github.com и новый репозиторий с именем, например, из латинских букв и дефисов.' },
				{ text: 'Загрузите файлы в корень репозитория (кнопка «Add file», «Upload files») и сохраните («Commit»). index.html должен лежать на верхнем уровне.' },
				{ text: 'В репозитории откройте Settings, затем Pages, выберите источник: ветку main и корневую папку, сохраните.', check: 'Подождите несколько минут (иногда до десяти): вверху раздела Pages появится адрес.' },
				{ text: 'Откройте адрес вида https://ваш-аккаунт.github.io/имя-репозитория/ и убедитесь, что страница та же, что в предпросмотре.', check: 'Если пусто или 404, смотрите раздел «Что-то не так» ниже.' },
				{ text: 'Свой домен: в Settings, Pages впишите домен в поле Custom domain и сохраните, затем добавьте у регистратора записи DNS из документации GitHub (четыре A для корня и CNAME для www на ваш-аккаунт.github.io).' },
				{ text: 'Когда сертификат готов (до суток), отметьте «Enforce HTTPS».', check: 'Проверьте: http:// перенаправляет на https://, www и без www открываются.' }
			]
		},
		{
			id: 'vercel',
			name: 'Vercel',
			url: (s) => `https://${s}.vercel.app/`,
			note: 'Есть бесплатный тариф Hobby, но только для личных некоммерческих проектов (страница тарифов Vercel, октябрь 2026); каждое изменение в репозитории даёт новую выкладку, а предыдущую можно вернуть. Доступность и оплата зарубежных сервисов из России меняются: проверьте до того, как строить на этом план.',
			steps: [
				{ text: 'Скачайте свой сайт из галереи («Скачать сайт»).' },
				{ text: 'Самый быстрый путь без Git: откройте vercel.com/drop и перетащите папку с файлами в окно. Для постоянного сайта войдите в аккаунт.' },
				{ text: 'Либо подключите репозиторий: «Add New», «Project», выберите репозиторий; для готовых файлов выберите шаблон Other.', check: 'Каждый следующий коммит будет выкладываться сам, а коммиты в другие ветки дадут предпросмотр.' },
				{ text: 'Дождитесь окончания выкладки и откройте адрес вида https://имя-проекта.vercel.app/.', check: 'Сайт сразу по https: сертификат Vercel выдаёт сам.' },
				{ text: 'Свой домен: в проекте Settings, Domains, «Add Domain». Для корня Vercel покажет запись A, для www запись CNAME. Берите значения, которые показаны в вашем проекте, а не из чужих статей.' },
				{ text: 'Добавьте записи у регистратора, дождитесь зелёной отметки в Domains, проверьте оба адреса, с www и без.', check: 'Один из двух адресов настройте как основной, а второй как перенаправление.' }
			]
		},
		{
			id: 'ru',
			name: 'Российский хостинг',
			url: () => 'https://ваш-домен.ru/',
			note: 'Платно (порядка сотен рублей в месяц), с договором и поддержкой на русском; дата-центр в России, что удобно для персональных данных из форм.',
			steps: [
				{ text: 'Скачайте свой сайт из галереи («Скачать сайт») и распакуйте архив.' },
				{ text: 'Выберите провайдера и тариф «виртуальный хостинг» (или для простых сайтов). Прочитайте условия: где дата-центр, как делаются копии, как продлевается.' },
				{ text: 'В панели добавьте сайт и домен. Панель покажет папку сайта (обычно public_html, у некоторых www или htdocs).' },
				{ text: 'Загрузите файлы в эту папку: файловым менеджером панели или по SFTP (не по обычному FTP: он отправляет пароль открытым текстом).', check: 'index.html должен лежать прямо в папке сайта, а не во вложенной.' },
				{ text: 'Направьте домен на хостинг: либо смените NS у регистратора на серверы хостинга, либо оставьте зону у регистратора и добавьте запись A с адресом, который назвал хостинг.' },
				{ text: 'Включите сертификат (в панели есть кнопка Let’s Encrypt или SSL), затем включите перенаправление с http на https.', check: 'Проверьте: https, замочек, www и без www.' }
			]
		}
	] as Way[],
			symptoms: [
		{ id: '404', label: '404 или пусто после выкладки', why: 'Файл index.html не на верхнем уровне публикуемой папки, выбрана не та ветка или папка, или регистр букв в имени не тот (на серверах Index.html и index.html разные файлы).', fix: 'Проверьте источник публикации в настройках и положение index.html. Подождите до десяти минут после выкладки.' },
		{ id: 'css', label: 'Страница без стилей и картинок', why: 'Адреса в файлах начинаются со слеша (/styles.css), а сайт лежит в подпапке (/имя-репозитория/): браузер ищет файл в корне домена. Или не совпал регистр в именах.', fix: 'Пишите адреса относительно страницы (styles.css, images/photo.jpg) и сверьте регистр.' },
		{ id: 'old', label: 'После правки виден старый сайт', why: 'Копию хранит кэш браузера или CDN, либо выкладка не прошла (красная проверка в конвейере).', fix: 'Обновите страницу без кэша (Ctrl+Shift+R), посмотрите журнал выкладки, при необходимости сбросьте кэш. Вспомните урок про CDN.' },
		{ id: 'cert', label: 'Предупреждение о сертификате на своём домене', why: 'Сертификат ещё не выпущен (после привязки домена это может занять до суток), записи DNS не те, или в зоне есть запись CAA, запрещающая выдачу.', fix: 'Проверьте записи командой dig, подождите, не меняйте настройки подряд. Урок про HTTPS поможет прочитать, что именно не так.' },
		{ id: 'dns', label: 'Домен вообще не открывается', why: 'Записи DNS не те, не там, куда указывают NS, или ещё не дошли до всех кэшей.', fix: 'Выполните dig example.ru NS и dig example.ru A, сравните с тем, что просит провайдер, и подождите TTL.' },
		{ id: 'www', label: 'Без www открывается, с www нет (или наоборот)', why: 'Добавлена запись только для одного имени.', fix: 'Добавьте второе имя (CNAME для www) и настройте перенаправление на основной адрес.' }
	] as Symptom[],
			caption: 'Три пути выкладки: репетиция',
			rehearsal: 'Это репетиция: ничего не отправляется и не публикуется. Шаги настоящие, и вы можете повторить их у себя.',
			path: 'Путь',
			siteAt: 'Ваш сайт будет по адресу вроде',
			onDomain: 'а на своём домене:',
			yourDomain: 'Ваш домен (для примера):',
			ticked: 'Отмечено шагов:',
			of: 'из',
			phone: ' Осталось открыть сайт с телефона по мобильной сети и убедиться, что главное действие проекта работает.',
			wrong: 'Что-то не так',
			symptom: 'Симптом',
			usually: 'Чаще всего.',
			fix: 'Что делать.'
		},
		en: {
			slug: 'my-site',
			domain: 'example.com',
			ways: [
				{
					id: 'pages',
					name: 'GitHub Pages',
					url: (s) => `https://your-account.github.io/${s}/`,
					note: 'Free for public repositories; the site is served from the repository. GitHub’s terms say Pages is not meant for running an online business or a store (checked October 2026).',
					steps: [
						{ text: 'Download your site from the gallery (“Download the site”): you get an archive with the files and a README.' },
						{ text: 'Create an account at github.com and a new repository with a name of Latin letters and hyphens, say.' },
						{ text: 'Upload the files to the root of the repository (the “Add file”, “Upload files” button) and save (“Commit”). index.html has to be at the top level.' },
						{ text: 'In the repository, open Settings, then Pages, choose the source: the main branch and the root folder, and save.', check: 'Wait a few minutes (sometimes up to ten): an address appears at the top of the Pages section.' },
						{ text: 'Open the address that looks like https://your-account.github.io/repository-name/ and make sure the page is the same as in the preview.', check: 'If it is empty or a 404, see the “Something is wrong” section below.' },
						{ text: 'Your own domain: in Settings, Pages, enter the domain in the Custom domain field and save, then add the DNS records from GitHub’s documentation at your registrar (four A records for the root and a CNAME for www pointing to your-account.github.io).' },
						{ text: 'When the certificate is ready (up to a day), check “Enforce HTTPS”.', check: 'Check: http:// redirects to https://, and both www and no-www open.' }
					]
				},
				{
					id: 'vercel',
					name: 'Vercel',
					url: (s) => `https://${s}.vercel.app/`,
					note: 'There is a free Hobby plan, but it is for personal, non-commercial use only; a business site needs a paid plan or another host (Vercel’s plan page, October 2026). Every change in a repository gives a new deploy, and the previous one can be restored.',
					steps: [
						{ text: 'Download your site from the gallery (“Download the site”).' },
						{ text: 'The fastest way with no Git: open vercel.com/drop and drag the folder of files into the window. For a lasting site, sign in to an account.' },
						{ text: 'Or connect a repository: “Add New”, “Project”, choose the repository; for ready-made files choose the Other preset.', check: 'Every next commit will deploy by itself, and commits to other branches will give a preview.' },
						{ text: 'Wait for the deploy to finish and open an address like https://project-name.vercel.app/.', check: 'The site is on https at once: Vercel issues the certificate itself.' },
						{ text: 'Your own domain: in the project, Settings, Domains, “Add Domain”. For the root Vercel will show an A record, for www a CNAME record. Take the values shown in your project, not those from other people’s articles.' },
						{ text: 'Add the records at your registrar, wait for the green mark in Domains, and check both addresses, with www and without.', check: 'Set one of the two up as the main address and the other as a redirect.' }
					]
				},
				{
					id: 'host',
					name: 'An ordinary web host',
					url: () => 'https://your-domain.com/',
					note: 'Paid (a few dollars a month), with a contract, support and a data center in a region you choose; the usual home of a store or a site with forms and customer data. Netlify and Cloudflare Pages work much like Vercel.',
					steps: [
						{ text: 'Download your site from the gallery (“Download the site”) and unpack the archive.' },
						{ text: 'Choose a provider and a “shared hosting” plan (or a basic one for simple sites). Read the terms: where the data center is, how backups are made, how renewal works.' },
						{ text: 'In the panel, add the site and the domain. The panel will show the site’s folder (usually public_html, at some hosts www or htdocs).' },
						{ text: 'Upload the files to that folder: with the panel’s file manager or over SFTP (not over plain FTP: it sends the password in plain text).', check: 'index.html has to be right in the site’s folder, not in a nested one.' },
						{ text: 'Point the domain at the host: either change the NS at the registrar to the host’s servers, or keep the zone at the registrar and add an A record with the address the host gave you.' },
						{ text: 'Switch the certificate on (the panel has a Let’s Encrypt or SSL button), then switch on the redirect from http to https.', check: 'Check: https, the padlock, www and no-www.' }
					]
				}
			] as Way[],
			symptoms: [
				{ id: '404', label: '404 or empty after the deploy', why: 'The file index.html is not at the top level of the published folder, the wrong branch or folder is chosen, or the case of letters in a name is off (on servers Index.html and index.html are different files).', fix: 'Check the publishing source in the settings and the position of index.html. Wait up to ten minutes after the deploy.' },
				{ id: 'css', label: 'The page has no styles and pictures', why: 'The addresses in the files start with a slash (/styles.css), and the site lies in a subfolder (/repository-name/): the browser looks for the file at the root of the domain. Or the case in names doesn’t match.', fix: 'Write addresses relative to the page (styles.css, images/photo.jpg) and check the case.' },
				{ id: 'old', label: 'The old site shows after an edit', why: 'A copy is held by the browser’s cache or the CDN, or the deploy didn’t go through (a red check in the pipeline).', fix: 'Refresh without the cache (Ctrl+Shift+R), look at the deploy log and, if needed, purge the cache. Recall the lesson on CDNs.' },
				{ id: 'cert', label: 'A certificate warning on your own domain', why: 'The certificate isn’t issued yet (after connecting a domain it can take up to a day), the DNS records are wrong, or the zone has a CAA record that forbids issuing.', fix: 'Check the records with dig, wait, and don’t change settings one after another. The lesson on HTTPS helps you read what exactly is wrong.' },
				{ id: 'dns', label: 'The domain doesn’t open at all', why: 'The DNS records are wrong, are not where the NS point, or haven’t reached all the caches yet.', fix: 'Run dig example.com NS and dig example.com A, compare with what the provider asks for, and wait out the TTL.' },
				{ id: 'www', label: 'It opens without www but not with it (or the reverse)', why: 'A record was added for only one of the names.', fix: 'Add the second name (a CNAME for www) and set up a redirect to the main address.' }
			] as Symptom[],
			caption: 'Three ways to deploy: a rehearsal',
			rehearsal: 'This is a rehearsal: nothing is sent or published. The steps are real, and you can repeat them yourself.',
			path: 'Way',
			siteAt: 'Your site will be at an address like',
			onDomain: 'and on your own domain:',
			yourDomain: 'Your domain (as an example):',
			ticked: 'Steps checked:',
			of: 'of',
			phone: ' What is left is to open the site on a phone over the mobile network and make sure the project’s main action works.',
			wrong: 'Something is wrong',
			symptom: 'The symptom',
			usually: 'Most often.',
			fix: 'What to do.'
		}
	});

	let slug = $state(W.slug);
	let domain = $state(W.domain);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			const tr: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
			const s = (p.name ?? '')
				.toLowerCase()
				.split('')
				.map((c) => tr[c] ?? c)
				.join('')
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
			if (s) slug = s;
		} catch {
			/* the example stays */
		}
	});

	const ways: Way[] = W.ways;
	let way = $state('pages');
	let done = $state<Record<string, boolean[]>>({ pages: [], vercel: [], host: [], ru: [] });
	const cur = $derived(ways.find((w) => w.id === way)!);
	const count = $derived(done[way].filter(Boolean).length);

	const symptoms = W.symptoms;
	let sym = $state('404');
	const s = $derived(symptoms.find((x) => x.id === sym)!);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.rehearsal}</p>
	<div class="dg-ctl" role="tablist" aria-label={W.path}>
		{#each ways as w (w.id)}<button type="button" role="tab" aria-selected={way === w.id} onclick={() => (way = w.id)}>{w.name}</button>{/each}
	</div>
	<p class="dg-out">{cur.note}</p>
	<p class="dg-out">{W.siteAt} <span class="dg-mono">{cur.url(slug)}</span>, {W.onDomain} <span class="dg-mono">https://{domain}/</span>.</p>
	<label class="dg-ctl">{W.yourDomain} <input type="text" bind:value={domain} class="dg-mono" size="16" /></label>
	<ol class="steps">
		{#each cur.steps as st, i (i)}
			<li class:on={done[way][i]}>
				<label><input type="checkbox" checked={!!done[way][i]} onchange={(e) => (done[way][i] = e.currentTarget.checked)} /> <span>{st.text}</span></label>
				{#if st.check}<p class="chk">{st.check}</p>{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">{W.ticked} <strong>{count} {W.of} {cur.steps.length}</strong>.{count === cur.steps.length ? W.phone : ''}</p>

	<div class="dh">{W.wrong}</div>
	<label class="dg-ctl">{W.symptom}
		<select bind:value={sym}>{#each symptoms as x (x.id)}<option value={x.id}>{x.label}</option>{/each}</select>
	</label>
	<div class="dg-box" aria-live="polite">
		<p><strong>{W.usually}</strong> {s.why}</p>
		<p><strong>{W.fix}</strong> {s.fix}</p>
	</div>
</figure>

<style>
	.steps {
		padding-left: var(--space-5);
		margin: var(--space-3) 0;
	}
	.steps li {
		margin-bottom: var(--space-2);
		max-width: var(--measure);
	}
	.steps li.on span {
		color: var(--text-secondary);
	}
	.steps label {
		align-items: flex-start;
	}
	.chk {
		margin: var(--space-1) 0 0 var(--space-6);
		color: var(--text-secondary);
		font-size: 0.92em;
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
