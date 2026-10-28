<!--
	«Разборщик адреса» (part 1, lesson 4). The browser's own URL parser takes whatever is typed
	and the diagram shows its parts and, below, the host read from right to left, as DNS reads it.
	Nothing here is looked up: no request leaves the page.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';
	const W = pick({
		ru: {
			examples: [
				{ name: 'Обычный адрес', url: 'https://www.example.ru/uslugi/mezhevanie?city=zarechye#price' },
				{ name: 'Поддомен и порт', url: 'https://blog.example.com:8443/2025/10/post?utm_source=tg' },
				{ name: 'Зона .рф', url: 'https://пример.рф/контакты' },
				{ name: 'Свой компьютер', url: 'http://localhost:5173/index.html' }
			],
			defaultPort: (p: string) => `${p} (по умолчанию, в адресе не пишется)`,
			rows: {
				scheme: ['Схема', 'Как разговаривать с сервером: http, https.'],
				host: ['Хост', 'Чей это сервер. Именно по хосту ищут адрес в DNS.'],
				port: ['Порт', 'Какой программе на сервере отдать запрос.'],
				path: ['Путь', 'Что именно запрашивается на этом сервере.'],
				query: ['Запрос', 'Уточнение к запросу: пары «имя=значение» после знака вопроса.'],
				hash: ['Якорь', 'Место внутри страницы. На сервер не отправляется: его обрабатывает браузер.']
			},
			levels: {
				single: 'имя без зоны: так называют свой же компьютер',
				tld: 'зона верхнего уровня (TLD)',
				domain: 'имя домена (его вы регистрируете)',
				sub: 'поддомен (его создаёте сами)',
				subMid: 'поддомен'
			},
			caption: 'Из чего состоит адрес',
			address: 'Адрес:',
			examplesLabel: 'Примеры адресов',
			parts: 'Адрес по частям',
			rtl: 'Хост читается справа налево',
			punycode: 'Для адресов в зоне .рф браузер записывает имя особой латинской формой (punycode, она начинается с «xn--»): так его понимает сеть.',
			bad: 'Это не адрес: в начале нужна схема, например https://'
		},
		en: {
			examples: [
				{ name: 'A plain address', url: 'https://www.example.com/services/surveying?city=riverbend#price' },
				{ name: 'Subdomain and port', url: 'https://blog.example.com:8443/2025/10/post?utm_source=news' },
				{ name: 'An accented name', url: 'https://bücher.de/über-uns' },
				{ name: 'Your own computer', url: 'http://localhost:5173/index.html' }
			],
			defaultPort: (p: string) => `${p} (the default, not written in the address)`,
			rows: {
				scheme: ['Scheme', 'How to talk to the server: http, https.'],
				host: ['Host', 'Whose server it is. The host is what is looked up in DNS.'],
				port: ['Port', 'Which program on the server gets the request.'],
				path: ['Path', 'What exactly is requested on this server.'],
				query: ['Query', 'A refinement of the request: “name=value” pairs after the question mark.'],
				hash: ['Fragment', 'A place inside the page. It is not sent to the server: the browser handles it.']
			},
			levels: {
				single: 'a name with no zone: the way a computer refers to itself',
				tld: 'top-level domain (TLD)',
				domain: 'the domain name (the one you register)',
				sub: 'subdomain (you create it yourself)',
				subMid: 'subdomain'
			},
			caption: 'What an address is made of',
			address: 'Address:',
			examplesLabel: 'Example addresses',
			parts: 'The address in parts',
			rtl: 'The host is read from right to left',
			punycode: 'For a name with letters outside the basic Latin alphabet (such as bücher.de), the browser writes it in a special Latin form (punycode, which starts with “xn--”): that is how the network understands it.',
			bad: 'This is not an address: it needs a scheme at the start, for example https://'
		}
	});
	const examples = W.examples;
	let value = $state(examples[0].url);

	const parsed = $derived.by(() => {
		try {
			return new URL(value.trim());
		} catch {
			return null;
		}
	});
	const portNote = (u: URL) => (u.port ? u.port : u.protocol === 'https:' ? W.defaultPort('443') : u.protocol === 'http:' ? W.defaultPort('80') : '—');
	const rows = $derived(
		parsed
			? [
					{ cls: 'scheme', val: parsed.protocol.replace(':', '') },
					{ cls: 'host', val: parsed.hostname },
					{ cls: 'port', val: portNote(parsed) },
					{ cls: 'path', val: decodeURIComponent(parsed.pathname) || '/' },
					{ cls: 'query', val: parsed.search || '—' },
					{ cls: 'hash', val: parsed.hash || '—' }
				].map((r) => ({ ...r, name: W.rows[r.cls as keyof typeof W.rows][0], note: W.rows[r.cls as keyof typeof W.rows][1] }))
			: []
	);
	const labels = $derived(parsed ? parsed.hostname.split('.').reverse() : []);
	const levelName = (i: number, n: number) => (n === 1 ? W.levels.single : i === 0 ? W.levels.tld : i === 1 ? W.levels.domain : i === n - 1 ? W.levels.sub : W.levels.subMid);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label class="grow">
			{W.address}
			<input type="text" bind:value spellcheck="false" autocomplete="off" aria-describedby="urlp-err" />
		</label>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.examplesLabel}>
		{#each examples as e (e.url)}
			<button type="button" aria-pressed={value === e.url} onclick={() => (value = e.url)}>{e.name}</button>
		{/each}
	</div>
	{#if parsed}
		<p class="line dg-mono" aria-label={W.parts}>
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
		<div class="dh">{W.rtl}</div>
		<ol class="levels">
			{#each labels as l, i (i)}
				<li style="padding-left: {i * 1.25}rem"><span class="dg-mono">{i === 0 ? '.' : ''}{l}</span> <span class="note">{levelName(i, labels.length)}</span></li>
			{/each}
		</ol>
		<p class="note">{W.punycode}</p>
	{:else}
		<p id="urlp-err" class="dg-out" role="status">{W.bad}</p>
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
	.dh {
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
