<!--
	«Лента попыток» (part 15, lessons 5 and 6). Eight everyday automated attempts against a small
	site, and the measures that stop each. The person switches measures on and watches the feed: an
	attempt is stopped when at least one of the measures it depends on is on. Which measure answers
	which attempt is the lesson's teaching map (OWASP Top 10:2025 in plain words), not a model of a
	real attacker. Lesson 6 passes `only` to show the form's own subset.
-->
<script lang="ts">
	import './shared.css';

	let { only = null }: { only?: string[] | null } = $props();

	type Measure = { id: string; label: string; hint: string };
	const all: Measure[] = [
		{ id: 'https', label: 'HTTPS и HSTS', hint: 'Шифрование соединения, браузер не ходит по http.' },
		{ id: 'csp', label: 'CSP и заголовки безопасности', hint: 'Content-Security-Policy, nosniff, запрет встраивания.' },
		{ id: 'upd', label: 'Обновления CMS, плагинов и зависимостей', hint: 'Закрытые дыры не открыты у вас.' },
		{ id: 'mfa', label: 'Двухфакторный вход и менеджер паролей', hint: 'Уникальные длинные пароли и второй фактор.' },
		{ id: 'sec', label: 'Секреты вне репозитория', hint: 'Ключи в переменных окружения, а не в коде.' },
		{ id: 'esc', label: 'Проверка на сервере, экранирование и параметры запросов', hint: 'Ввод не становится ни кодом, ни частью запроса.' },
		{ id: 'rate', label: 'Ограничение частоты запросов', hint: 'Сто попыток в минуту уже не проходят.' },
		{ id: 'acl', label: 'Проверка прав на каждый запрос', hint: 'Сервер сам решает, чьё это, а не верит адресу.' },
		{ id: 'trap', label: 'Скрытое поле-ловушка для ботов', hint: 'Человек его не видит, бот заполняет.' }
	];

	type Attempt = { id: string; text: string; stoppedBy: string[]; owasp: string };
	const feed: Attempt[] = [
		{ id: 'brute', text: 'Бот перебирает пароли к странице входа в админку', stoppedBy: ['mfa', 'rate'], owasp: 'A07 Authentication Failures' },
		{ id: 'plugin', text: 'Скрипт пробует известную дыру устаревшего плагина', stoppedBy: ['upd'], owasp: 'A03 Software Supply Chain Failures' },
		{ id: 'xss', text: 'В поле «Комментарий» вставлен скрипт, чтобы выполниться у других посетителей', stoppedBy: ['esc', 'csp'], owasp: 'A05 Injection (XSS)' },
		{ id: 'sqli', text: 'В поле формы введена кавычка и фрагмент SQL, чтобы вытащить базу', stoppedBy: ['esc'], owasp: 'A05 Injection (SQL)' },
		{ id: 'wifi', text: 'Чужой в открытой сети Wi-Fi читает, что отправляет форма', stoppedBy: ['https'], owasp: 'A04 Cryptographic Failures' },
		{ id: 'frame', text: 'Ваш сайт показан невидимым слоем на чужой странице, чтобы подменить клик', stoppedBy: ['csp'], owasp: 'A02 Security Misconfiguration' },
		{ id: 'env', text: 'Сканер ищет файл .env и ключи в публичном репозитории', stoppedBy: ['sec'], owasp: 'A02 Security Misconfiguration' },
		{ id: 'idor', text: 'В адресе /request/105 меняют номер на 106 и читают чужую заявку', stoppedBy: ['acl'], owasp: 'A01 Broken Access Control' },
		{ id: 'spam', text: 'Бот отправляет форму заявки тысячу раз с рекламой', stoppedBy: ['trap', 'rate'], owasp: 'A06 Insecure Design' }
	];

	const measures = $derived(only ? all.filter((m) => only!.includes(m.id)) : all);
	const attempts = $derived(only ? feed.filter((a) => a.stoppedBy.some((s) => only!.includes(s))) : feed);
	let on = $state<Record<string, boolean>>({});
	const stopped = (a: Attempt) => a.stoppedBy.some((s) => on[s] && measures.some((m) => m.id === s));
	const n = $derived(attempts.filter(stopped).length);
</script>

<figure class="dg">
	<figcaption>Лента попыток: что остановлено, что прошло</figcaption>
	<p class="dg-out">Это обычные автоматические попытки, которые идут на любой сайт. Включайте меры и смотрите, что остановлено.</p>

	<ul class="ms" aria-label="Меры защиты">
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
				<span>{a.text}<br /><span class="dim">{stopped(a) ? 'Остановлено' : 'Прошло'}. Что это по OWASP: {a.owasp}.</span></span>
			</li>
		{/each}
	</ol>
	<p class="dg-out" aria-live="polite"><strong>Остановлено {n} из {attempts.length}.</strong> {n === attempts.length ? 'Всё из этого списка. Настоящий список длиннее, но эти меры закрывают самое частое.' : n === 0 ? 'Пока ничего: сайт открыт всем, кто попробует.' : 'Остальные попытки проходят: у каждой меры своя задача, одной защиты мало.'}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> лента из попыток (перебор пароля, дыра в плагине, скрипт и SQL в форме, перехват в Wi-Fi, встраивание сайта в чужую страницу, поиск ключей, подмена номера в адресе, спам) и список мер. Каждая попытка останавливается хотя бы одной подходящей мерой: двухфактором или ограничением частоты, обновлением, проверкой ввода, HTTPS, заголовками, хранением секретов вне кода, проверкой прав.</p>
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
