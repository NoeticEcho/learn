<!--
	«Разборщик адреса» (part 1, lesson 4). The browser's own URL parser takes whatever is typed
	and the diagram shows its parts and, below, the host read from right to left, as DNS reads it.
	Nothing here is looked up: no request leaves the page.
-->
<script lang="ts">
	import './shared.css';
	const examples = [
		{ name: 'Обычный адрес', url: 'https://www.example.ru/uslugi/mezhevanie?city=zarechye#price' },
		{ name: 'Поддомен и порт', url: 'https://blog.example.com:8443/2025/10/post?utm_source=tg' },
		{ name: 'Зона .рф', url: 'https://пример.рф/контакты' },
		{ name: 'Свой компьютер', url: 'http://localhost:5173/index.html' }
	];
	let value = $state(examples[0].url);

	const parsed = $derived.by(() => {
		try {
			return new URL(value.trim());
		} catch {
			return null;
		}
	});
	const portNote = (u: URL) => (u.port ? u.port : u.protocol === 'https:' ? '443 (по умолчанию, в адресе не пишется)' : u.protocol === 'http:' ? '80 (по умолчанию, в адресе не пишется)' : '—');
	const rows = $derived(
		parsed
			? [
					{ cls: 'scheme', name: 'Схема', val: parsed.protocol.replace(':', ''), note: 'Как разговаривать с сервером: http, https.' },
					{ cls: 'host', name: 'Хост', val: parsed.hostname, note: 'Чей это сервер. Именно по хосту ищут адрес в DNS.' },
					{ cls: 'port', name: 'Порт', val: portNote(parsed), note: 'Какой программе на сервере отдать запрос.' },
					{ cls: 'path', name: 'Путь', val: decodeURIComponent(parsed.pathname) || '/', note: 'Что именно запрашивается на этом сервере.' },
					{ cls: 'query', name: 'Запрос', val: parsed.search || '—', note: 'Уточнение к запросу: пары «имя=значение» после знака вопроса.' },
					{ cls: 'hash', name: 'Якорь', val: parsed.hash || '—', note: 'Место внутри страницы. На сервер не отправляется: его обрабатывает браузер.' }
				]
			: []
	);
	const labels = $derived(parsed ? parsed.hostname.split('.').reverse() : []);
	const levelName = (i: number, n: number) => (n === 1 ? 'имя без зоны: так называют свой же компьютер' : i === 0 ? 'зона верхнего уровня (TLD)' : i === 1 ? 'имя домена (его вы регистрируете)' : i === n - 1 ? 'поддомен (его создаёте сами)' : 'поддомен');
</script>

<figure class="dg">
	<figcaption>Из чего состоит адрес</figcaption>
	<div class="dg-ctl">
		<label class="grow">
			Адрес:
			<input type="text" bind:value spellcheck="false" autocomplete="off" aria-describedby="urlp-err" />
		</label>
	</div>
	<div class="dg-ctl" role="group" aria-label="Примеры адресов">
		{#each examples as e (e.url)}
			<button type="button" aria-pressed={value === e.url} onclick={() => (value = e.url)}>{e.name}</button>
		{/each}
	</div>
	{#if parsed}
		<p class="line dg-mono" aria-label="Адрес по частям">
			<span class="scheme">{parsed.protocol}//</span><span class="host">{parsed.hostname}</span>{#if parsed.port}<span class="port">:{parsed.port}</span>{/if}<span class="path">{parsed.pathname}</span><span class="query">{parsed.search}</span><span class="hash">{parsed.hash}</span>
		</p>
		<dl class="parts">
			{#each rows as r (r.cls)}
				<div>
					<dt><span class="sw {r.cls}"></span>{r.name}</dt>
					<dd><span class="dg-mono">{r.val}</span> <span class="note">{r.note}</span></dd>
				</div>
			{/each}
		</dl>
		<h4>Хост читается справа налево</h4>
		<ol class="levels">
			{#each labels as l, i (i)}
				<li style="padding-left: {i * 1.25}rem"><span class="dg-mono">{i === 0 ? '.' : ''}{l}</span> <span class="note">{levelName(i, labels.length)}</span></li>
			{/each}
		</ol>
		<p class="note">Для адресов в зоне .рф браузер записывает имя особой латинской формой (punycode, она начинается с «xn--»): так его понимает сеть.</p>
	{:else}
		<p id="urlp-err" class="dg-out" role="status">Это не адрес: в начале нужна схема, например https://</p>
	{/if}
</figure>

<style>
	.grow {
		flex: 1 1 18rem;
	}
	.grow input {
		flex: 1;
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-family: var(--font-mono);
		min-width: 0;
	}
	.line {
		margin: var(--space-3) 0;
		padding: var(--space-3);
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
		font-size: 1.05rem;
	}
	.scheme {
		color: var(--echo-400);
	}
	.host {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-thickness: 2px;
	}
	.port {
		color: var(--saffron, var(--brass-300));
	}
	.path {
		color: var(--brass-300);
	}
	.query {
		color: var(--text-secondary);
		font-style: italic;
	}
	.hash {
		color: var(--text-muted, var(--text-secondary));
	}
	.parts {
		margin: 0;
		display: grid;
		gap: var(--space-2);
	}
	.parts dt {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		color: var(--text-primary);
	}
	.parts dd {
		margin: 0 0 0 var(--space-5);
	}
	.sw {
		width: 0.75rem;
		height: 0.75rem;
		background: currentColor;
	}
	.sw.scheme {
		color: var(--echo-400);
	}
	.sw.host {
		color: var(--text-primary);
	}
	.sw.port {
		color: var(--saffron, var(--brass-300));
	}
	.sw.path {
		color: var(--brass-300);
	}
	.sw.query {
		color: var(--text-secondary);
	}
	.sw.hash {
		color: var(--text-muted, var(--text-secondary));
	}
	.note {
		color: var(--text-secondary);
	}
	h4 {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.levels {
		list-style: none;
		padding: 0 !important;
		margin: 0;
	}
</style>
