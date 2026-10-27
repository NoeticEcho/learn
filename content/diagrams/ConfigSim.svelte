<!--
	«Путь запроса через конфиг» (part 6, lesson 1). A real server is not run; this is a small
	interpreter for the part of nginx's language the lesson uses (server-level root, index,
	error_page; location with `=` or a prefix; return, try_files, proxy_pass) over a pretend disk.
	The person edits the config and asks for an address; the answer is computed by the rules, and
	the rule that matched is named. It is a model: real nginx has many more directives and a
	few subtler rules (regex locations, nested blocks), and the page says so.
-->
<script lang="ts">
	import './shared.css';

	const initial = `server {
    listen 80;
    server_name example.ru;
    root /var/www/site;
    index index.html;

    error_page 404 /404.html;

    location = /staraya-stranica {
        return 301 /uslugi.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}`;
	let conf = $state(initial);
	const disk = ['index.html', 'uslugi.html', 'kontakty.html', '404.html'];
	const urls = ['/', '/uslugi.html', '/kontakty.html', '/staraya-stranica', '/net-takoj', '/api/items', '/uslugi.html/'];
	let url = $state('/net-takoj');

	type Loc = { exact: boolean; path: string; body: string };
	type Answer = { status: number; text: string; rule: string; note: string; headers: [string, string][] };

	function parse(src: string) {
		const text = src.replace(/#.*$/gm, '');
		const locs: Loc[] = [];
		const re = /location\s+(=\s+)?(\S+)\s*\{([^}]*)\}/g;
		for (let m = re.exec(text); m; m = re.exec(text)) locs.push({ exact: !!m[1], path: m[2], body: m[3] });
		const outside = text.replace(re, '');
		const get = (name: string) => outside.match(new RegExp(`\\b${name}\\s+([^;]+);`))?.[1].trim();
		return { locs, root: get('root') ?? '/var/www/html', index: get('index') ?? 'index.html', errorPage: outside.match(/error_page\s+404\s+(\S+);/)?.[1] };
	}

	function exists(root: string, path: string): boolean {
		return path.startsWith('/') && disk.includes(path.slice(1)) && root.length > 0;
	}

	function answer(src: string, path: string): Answer {
		const c = parse(src);
		const notFound = (rule: string): Answer => {
			const page = c.errorPage && exists(c.root, c.errorPage);
			return {
				status: 404,
				text: 'Not Found',
				rule,
				note: page ? `Отдана страница ошибки ${c.errorPage} с кодом 404.` : 'Своей страницы 404 в конфиге нет: будет стандартная страница сервера.',
				headers: [['Content-Type', 'text/html']]
			};
		};
		// exact match first, then the longest prefix
		const exact = c.locs.find((l) => l.exact && l.path === path);
		const prefix = c.locs.filter((l) => !l.exact && path.startsWith(l.path)).sort((a, b) => b.path.length - a.path.length)[0];
		const loc = exact ?? prefix;
		const rule = loc ? `location ${loc.exact ? '= ' : ''}${loc.path}` : 'правила location нет, работает умолчание сервера';
		const body = loc?.body ?? '';
		const ret = body.match(/return\s+(\d{3})\s+(\S+);/);
		if (ret) {
			const code = Number(ret[1]);
			const names: Record<number, string> = { 301: 'Moved Permanently', 302: 'Found' };
			return { status: code, text: names[code] ?? 'Redirect', rule, note: `Сервер сказал: ищите по новому адресу (заголовок Location).`, headers: [['Location', ret[2]]] };
		}
		const proxy = body.match(/proxy_pass\s+(\S+);/);
		if (proxy) return { status: 200, text: 'OK (ответ приложения)', rule, note: `Запрос передан приложению ${proxy[1]}. Что ответит оно, сервер не решает.`, headers: [['Via', 'прокси']] };
		const tf = body.match(/try_files\s+([^;]+);/);
		const serve = (file: string): Answer => ({ status: 200, text: 'OK', rule, note: `Отдан файл ${file} из папки ${c.root}.`, headers: [['Content-Type', 'text/html']] });
		const candidates = tf ? tf[1].trim().split(/\s+/) : ['$uri', '$uri/', '=404'];
		for (const cand of candidates) {
			if (cand.startsWith('=')) return notFound(rule);
			if (cand === '$uri' && exists(c.root, path)) return serve(path.slice(1));
			// the only folder on the pretend disk is the site's root
			if (cand === '$uri/' && path === '/' && exists(c.root, '/' + c.index)) return serve(c.index);
		}
		return notFound(rule);
	}
	const res = $derived(answer(conf, url));
	const group = $derived(res.status < 300 ? 'ok' : res.status < 400 ? 'move' : 'bad');
</script>

<figure class="dg">
	<figcaption>Спросите сервер по вашему конфигу</figcaption>
	<label class="conf">Конфиг (его можно править)
		<textarea class="dg-mono" rows="19" bind:value={conf} spellcheck="false"></textarea>
	</label>
	<div class="dg-ctl">
		<button type="button" onclick={() => (conf = initial)}>Вернуть пример</button>
	</div>
	<p class="disk">Файлы на диске в папке сайта: <code>{disk.join(', ')}</code></p>
	<div class="dg-ctl" role="group" aria-label="Адрес в запросе">
		{#each urls as u (u)}
			<button type="button" class="dg-mono" aria-pressed={url === u} onclick={() => (url = u)}>GET {u}</button>
		{/each}
	</div>
	<div class="dg-box answer" aria-live="polite">
		<p class="line"><strong class="st {group}">{res.status} {res.text}</strong></p>
		{#each res.headers as [k, v] (k)}<p class="dg-mono">{k}: {v}</p>{/each}
		<p>Сработало правило: <code>{res.rule}</code>.</p>
		<p>{res.note}</p>
	</div>
	<p class="note">Это модель: настоящий nginx понимает гораздо больше директив и порядок поиска правил у него тоньше. Здесь только то, что нужно уроку.</p>
</figure>

<style>
	.conf {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	textarea {
		width: 100%;
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-size: 0.85rem;
		tab-size: 4;
		resize: vertical;
	}
	.disk,
	.note {
		margin: var(--space-2) 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.answer p {
		margin: 0 0 var(--space-2);
	}
	.st.ok {
		color: var(--accent-state-text);
	}
	.st.move {
		color: var(--echo-400);
	}
	.st.bad {
		color: var(--brass-300);
	}
</style>
