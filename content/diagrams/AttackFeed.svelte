<!--
	«Лента попыток» (part 15, lessons 5 and 6). Eight everyday automated attempts against a small
	site, and the measures that stop each. The person switches measures on and watches the feed: an
	attempt is stopped when at least one of the measures it depends on is on. Which measure answers
	which attempt is the lesson's teaching map (OWASP Top 10:2025 in plain words), not a model of a
	real attacker. Lesson 6 passes `only` to show the form's own subset.
-->
<script lang="ts">
	import './shared.css';
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });

	let { only = null }: { only?: string[] | null } = $props();

	type Measure = { id: string; label: string; hint: string };
	const all: Measure[] = [
		{ id: 'https', label: t('HTTPS и HSTS', 'HTTPS and HSTS'), hint: t('Шифрование соединения, браузер не ходит по http.', 'The connection is encrypted, and the browser doesn’t use http.') },
		{ id: 'csp', label: t('CSP и заголовки безопасности', 'CSP and security headers'), hint: t('Content-Security-Policy, nosniff, запрет встраивания.', 'Content-Security-Policy, nosniff, a ban on embedding.') },
		{ id: 'upd', label: t('Обновления CMS, плагинов и зависимостей', 'Updates of the CMS, plugins and dependencies'), hint: t('Закрытые дыры не открыты у вас.', 'Holes that are closed are not open on your site.') },
		{ id: 'mfa', label: t('Двухфакторный вход и менеджер паролей', 'Two-factor login and a password manager'), hint: t('Уникальные длинные пароли и второй фактор.', 'Unique long passwords and a second factor.') },
		{ id: 'sec', label: t('Секреты вне репозитория', 'Secrets outside the repository'), hint: t('Ключи в переменных окружения, а не в коде.', 'Keys in environment variables, not in the code.') },
		{ id: 'esc', label: t('Проверка на сервере, экранирование и параметры запросов', 'Server-side checks, escaping and query parameters'), hint: t('Ввод не становится ни кодом, ни частью запроса.', 'Input never becomes code or part of a query.') },
		{ id: 'rate', label: t('Ограничение частоты запросов', 'Rate limiting'), hint: t('Сто попыток в минуту уже не проходят.', 'A hundred attempts a minute no longer get through.') },
		{ id: 'acl', label: t('Проверка прав на каждый запрос', 'A permission check on every request'), hint: t('Сервер сам решает, чьё это, а не верит адресу.', 'The server decides whose it is, and doesn’t trust the address.') },
		{ id: 'trap', label: t('Скрытое поле-ловушка для ботов', 'A hidden trap field for bots'), hint: t('Человек его не видит, бот заполняет.', 'A person doesn’t see it, a bot fills it in.') }
	];

	type Attempt = { id: string; text: string; stoppedBy: string[]; owasp: string };
	const feed: Attempt[] = [
		{ id: 'brute', text: t('Бот перебирает пароли к странице входа в админку', 'A bot guesses passwords on the admin login page'), stoppedBy: ['mfa', 'rate'], owasp: 'A07 Authentication Failures' },
		{ id: 'plugin', text: t('Скрипт пробует известную дыру устаревшего плагина', 'A script tries the known hole of an out-of-date plugin'), stoppedBy: ['upd'], owasp: 'A03 Software Supply Chain Failures' },
		{ id: 'xss', text: t('В поле «Комментарий» вставлен скрипт, чтобы выполниться у других посетителей', 'A script is pasted into the “Comment” field to run for other visitors'), stoppedBy: ['esc', 'csp'], owasp: 'A05 Injection (XSS)' },
		{ id: 'sqli', text: t('В поле формы введена кавычка и фрагмент SQL, чтобы вытащить базу', 'A quotation mark and a scrap of SQL are typed into a form field to pull out the database'), stoppedBy: ['esc'], owasp: 'A05 Injection (SQL)' },
		{ id: 'wifi', text: t('Чужой в открытой сети Wi-Fi читает, что отправляет форма', 'A stranger on open Wi-Fi reads what the form sends'), stoppedBy: ['https'], owasp: 'A04 Cryptographic Failures' },
		{ id: 'frame', text: t('Ваш сайт показан невидимым слоем на чужой странице, чтобы подменить клик', 'Your site is shown as an invisible layer on someone else’s page to hijack a click'), stoppedBy: ['csp'], owasp: 'A02 Security Misconfiguration' },
		{ id: 'env', text: t('Сканер ищет файл .env и ключи в публичном репозитории', 'A scanner looks for a .env file and keys in a public repository'), stoppedBy: ['sec'], owasp: 'A02 Security Misconfiguration' },
		{ id: 'idor', text: t('В адресе /request/105 меняют номер на 106 и читают чужую заявку', 'In the address /request/105 the number is changed to 106 and someone else’s request is read'), stoppedBy: ['acl'], owasp: 'A01 Broken Access Control' },
		{ id: 'spam', text: t('Бот отправляет форму заявки тысячу раз с рекламой', 'A bot submits the inquiry form a thousand times with ads'), stoppedBy: ['trap', 'rate'], owasp: 'A06 Insecure Design' }
	];

	const measures = $derived(only ? all.filter((m) => only!.includes(m.id)) : all);
	const attempts = $derived(only ? feed.filter((a) => a.stoppedBy.some((s) => only!.includes(s))) : feed);
	let on = $state<Record<string, boolean>>({});
	const stopped = (a: Attempt) => a.stoppedBy.some((s) => on[s] && measures.some((m) => m.id === s));
	const n = $derived(attempts.filter(stopped).length);
</script>

<figure class="dg">
	<figcaption>{t('Лента попыток: что остановлено, что прошло', 'A feed of attempts: what is stopped, what gets through')}</figcaption>
	<p class="dg-out">{t('Это обычные автоматические попытки, которые идут на любой сайт. Включайте меры и смотрите, что остановлено.', 'These are ordinary automatic attempts that hit any site. Switch measures on and see what is stopped.')}</p>

	<ul class="ms" aria-label={t('Меры защиты', 'Protective measures')}>
		{#each measures as m (m.id)}
			<li>
				<label>
					<input type="checkbox" bind:checked={on[m.id]} />
					<span><strong>{m.label}</strong><br /><span class="dim">{m.hint}</span></span>
				</label>
			</li>
		{/each}
	</ul>

	<ol class="feed" aria-live="polite">
		{#each attempts as a (a.id)}
			<li class:ok={stopped(a)}>
				<span class="mk" aria-hidden="true">{stopped(a) ? '✓' : '✕'}</span>
				<span>{a.text}<br /><span class="dim">{stopped(a) ? t('Остановлено', 'Stopped') : t('Прошло', 'Got through')}{t('. Что это по OWASP:', '. OWASP category:')} {a.owasp}.</span></span>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>{t('Остановлено', 'Stopped')} {n} {t('из', 'of')} {attempts.length}.</strong> {n === attempts.length ? t('Всё из этого списка. Настоящий список длиннее, но эти меры закрывают самое частое.', 'All of this list. The real list is longer, but these measures close the commonest.') : n === 0 ? t('Пока ничего: сайт открыт всем, кто попробует.', 'Nothing yet: the site is open to anyone who tries.') : t('Остальные попытки проходят: у каждой меры своя задача, одной защиты мало.', 'The other attempts get through: each measure has its own job, and one protection is not enough.')}</p>
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('лента из попыток (перебор пароля, дыра в плагине, скрипт и SQL в форме, перехват в Wi-Fi, встраивание сайта в чужую страницу, поиск ключей, подмена номера в адресе, спам) и список мер. Каждая попытка останавливается хотя бы одной подходящей мерой: двухфактором или ограничением частоты, обновлением, проверкой ввода, HTTPS, заголовками, хранением секретов вне кода, проверкой прав.', 'a feed of attempts (password guessing, a hole in a plugin, a script and SQL in a form, interception on Wi-Fi, embedding the site in someone else’s page, a search for keys, a swapped number in the address, spam) and a list of measures. Each attempt is stopped by at least one suitable measure: a second factor or rate limiting, updates, input checks, HTTPS, headers, keeping secrets out of the code, permission checks.')}</p>
</figure>

<style>
	.ms {
		list-style: none;
		margin: 0 0 var(--space-4);
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.ms li {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-1) var(--space-3);
	}
	.ms label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: start;
		min-height: var(--hit-min);
	}
	.dim {
		color: var(--text-secondary);
	}
	.feed {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.feed li {
		display: grid;
		grid-template-columns: 1.5rem 1fr;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: var(--line) dashed var(--border-rule);
	}
	.feed li.ok {
		border-style: solid;
		border-color: var(--accent-measure);
	}
	.mk {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}
</style>
