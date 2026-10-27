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

	type Step = { text: string; check?: string };
	type Way = { id: string; name: string; url: (slug: string) => string; steps: Step[]; note: string };

	let slug = $state('moi-sait');
	let domain = $state('example.ru');
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

	const ways: Way[] = [
		{
			id: 'pages',
			name: 'GitHub Pages',
			url: (s) => `https://ваш-аккаунт.github.io/${s}/`,
			note: 'Бесплатно для открытых репозиториев; сайт отдаётся из репозитория. Подходит для статических сайтов.',
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
			note: 'Есть бесплатный тариф; каждое изменение в репозитории даёт новую выкладку, а предыдущую можно вернуть. Доступность и оплата зарубежных сервисов из России меняются: проверьте до того, как строить на этом план.',
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
	];

	let way = $state('pages');
	let done = $state<Record<string, boolean[]>>({ pages: [], vercel: [], ru: [] });
	const cur = $derived(ways.find((w) => w.id === way)!);
	const count = $derived(done[way].filter(Boolean).length);

	const symptoms = [
		{ id: '404', label: '404 или пусто после выкладки', why: 'Файл index.html не на верхнем уровне публикуемой папки, выбрана не та ветка или папка, или регистр букв в имени не тот (на серверах Index.html и index.html разные файлы).', fix: 'Проверьте источник публикации в настройках и положение index.html. Подождите до десяти минут после выкладки.' },
		{ id: 'css', label: 'Страница без стилей и картинок', why: 'Адреса в файлах начинаются со слеша (/styles.css), а сайт лежит в подпапке (/имя-репозитория/): браузер ищет файл в корне домена. Или не совпал регистр в именах.', fix: 'Пишите адреса относительно страницы (styles.css, images/photo.jpg) и сверьте регистр.' },
		{ id: 'old', label: 'После правки виден старый сайт', why: 'Копию хранит кэш браузера или CDN, либо выкладка не прошла (красная проверка в конвейере).', fix: 'Обновите страницу без кэша (Ctrl+Shift+R), посмотрите журнал выкладки, при необходимости сбросьте кэш. Вспомните урок про CDN.' },
		{ id: 'cert', label: 'Предупреждение о сертификате на своём домене', why: 'Сертификат ещё не выпущен (после привязки домена это может занять до суток), записи DNS не те, или в зоне есть запись CAA, запрещающая выдачу.', fix: 'Проверьте записи командой dig, подождите, не меняйте настройки подряд. Урок про HTTPS поможет прочитать, что именно не так.' },
		{ id: 'dns', label: 'Домен вообще не открывается', why: 'Записи DNS не те, не там, куда указывают NS, или ещё не дошли до всех кэшей.', fix: 'Выполните dig example.ru NS и dig example.ru A, сравните с тем, что просит провайдер, и подождите TTL.' },
		{ id: 'www', label: 'Без www открывается, с www нет (или наоборот)', why: 'Добавлена запись только для одного имени.', fix: 'Добавьте второе имя (CNAME для www) и настройте перенаправление на основной адрес.' }
	];
	let sym = $state('404');
	const s = $derived(symptoms.find((x) => x.id === sym)!);
</script>

<figure class="dg">
	<figcaption>Три пути выкладки: репетиция</figcaption>
	<p class="dg-out">Это репетиция: ничего не отправляется и не публикуется. Шаги настоящие, и вы можете повторить их у себя.</p>
	<div class="dg-ctl" role="tablist" aria-label="Путь">
		{#each ways as w (w.id)}<button type="button" role="tab" aria-selected={way === w.id} onclick={() => (way = w.id)}>{w.name}</button>{/each}
	</div>
	<p class="dg-out">{cur.note}</p>
	<p class="dg-out">Ваш сайт будет по адресу вроде <span class="dg-mono">{cur.url(slug)}</span>, а на своём домене: <span class="dg-mono">https://{domain}/</span>.</p>
	<label class="dg-ctl">Ваш домен (для примера): <input type="text" bind:value={domain} class="dg-mono" size="16" /></label>
	<ol class="steps">
		{#each cur.steps as st, i (i)}
			<li class:on={done[way][i]}>
				<label><input type="checkbox" checked={!!done[way][i]} onchange={(e) => (done[way][i] = e.currentTarget.checked)} /> <span>{st.text}</span></label>
				{#if st.check}<p class="chk">{st.check}</p>{/if}
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite">Отмечено шагов: <strong>{count} из {cur.steps.length}</strong>.{count === cur.steps.length ? ' Осталось открыть сайт с телефона по мобильной сети и убедиться, что главное действие проекта работает.' : ''}</p>

	<div class="dh">Что-то не так</div>
	<label class="dg-ctl">Симптом
		<select bind:value={sym}>{#each symptoms as x (x.id)}<option value={x.id}>{x.label}</option>{/each}</select>
	</label>
	<div class="dg-box" aria-live="polite">
		<p><strong>Чаще всего.</strong> {s.why}</p>
		<p><strong>Что делать.</strong> {s.fix}</p>
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
