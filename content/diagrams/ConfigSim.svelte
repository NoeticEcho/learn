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
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words, the example config and
	// the pretend disk are in `W`, one entry per edition.
	const W = pick({
		ru: {
			initial: `server {
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
}`,
			disk: ['index.html', 'uslugi.html', 'kontakty.html', '404.html'],
			urls: ['/', '/uslugi.html', '/kontakty.html', '/staraya-stranica', '/net-takoj', '/api/items', '/uslugi.html/'],
			start: '/net-takoj',
			okApp: 'OK (ответ приложения)',
			errorPage: (page: string) => `Отдана страница ошибки ${page} с кодом 404.`,
			noErrorPage: 'Своей страницы 404 в конфиге нет: будет стандартная страница сервера.',
			noLocation: 'правила location нет, работает умолчание сервера',
			moved: 'Сервер сказал: ищите по новому адресу (заголовок Location).',
			proxied: (target: string) => `Запрос передан приложению ${target}. Что ответит оно, сервер не решает.`,
			via: 'прокси',
			served: (file: string, root: string) => `Отдан файл ${file} из папки ${root}.`,
			caption: 'Спросите сервер по вашему конфигу',
			confLabel: 'Конфиг (его можно править)',
			reset: 'Вернуть пример',
			disks: 'Файлы на диске в папке сайта:',
			urlGroup: 'Адрес в запросе',
			matched: 'Сработало правило:',
			note: 'Это модель: настоящий nginx понимает гораздо больше директив и порядок поиска правил у него тоньше. Здесь только то, что нужно уроку.'
		},
		en: {
			initial: `server {
    listen 80;
    server_name example.com;
    root /var/www/site;
    index index.html;

    error_page 404 /404.html;

    location = /old-page {
        return 301 /services.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}`,
			disk: ['index.html', 'services.html', 'contact.html', '404.html'],
			urls: ['/', '/services.html', '/contact.html', '/old-page', '/no-such-page', '/api/items', '/services.html/'],
			start: '/no-such-page',
			okApp: 'OK (the app’s answer)',
			errorPage: (page: string) => `The error page ${page} was sent, with status 404.`,
			noErrorPage: 'The config has no page of its own for 404, so the server’s default page is shown.',
			noLocation: 'no location rule matches, so the server’s default applies',
			moved: 'The server said: look at the new address (the Location header).',
			proxied: (target: string) => `The request was passed to the app at ${target}. What the app answers is not the server’s decision.`,
			via: 'proxy',
			served: (file: string, root: string) => `The file ${file} was sent from the folder ${root}.`,
			caption: 'Ask the server, using your config',
			confLabel: 'Config (you can edit it)',
			reset: 'Restore the example',
			disks: 'Files on the disk, in the site’s folder:',
			urlGroup: 'Address in the request',
			matched: 'The rule that matched:',
			note: 'This is a model. Real nginx understands many more directives, and its way of choosing a rule is subtler. Only what the lesson needs is here.'
		}
	});

	const initial = W.initial;
	let conf = $state(initial);
	const disk = W.disk;
	const urls = W.urls;
	let url = $state(W.start);

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
				note: page ? W.errorPage(c.errorPage!) : W.noErrorPage,
				headers: [['Content-Type', 'text/html']]
			};
		};
		// exact match first, then the longest prefix
		const exact = c.locs.find((l) => l.exact && l.path === path);
		const prefix = c.locs.filter((l) => !l.exact && path.startsWith(l.path)).sort((a, b) => b.path.length - a.path.length)[0];
		const loc = exact ?? prefix;
		const rule = loc ? `location ${loc.exact ? '= ' : ''}${loc.path}` : W.noLocation;
		const body = loc?.body ?? '';
		const ret = body.match(/return\s+(\d{3})\s+(\S+);/);
		if (ret) {
			const code = Number(ret[1]);
			const names: Record<number, string> = { 301: 'Moved Permanently', 302: 'Found' };
			return { status: code, text: names[code] ?? 'Redirect', rule, note: W.moved, headers: [['Location', ret[2]]] };
		}
		const proxy = body.match(/proxy_pass\s+(\S+);/);
		if (proxy) return { status: 200, text: W.okApp, rule, note: W.proxied(proxy[1]), headers: [['Via', W.via]] };
		const tf = body.match(/try_files\s+([^;]+);/);
		const serve = (file: string): Answer => ({ status: 200, text: 'OK', rule, note: W.served(file, c.root), headers: [['Content-Type', 'text/html']] });
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
	<figcaption>{W.caption}</figcaption>
	<label class="conf">{W.confLabel}
		<textarea class="dg-mono" rows="19" bind:value={conf} spellcheck="false"></textarea>
	</label>
	<div class="dg-ctl">
		<button type="button" onclick={() => (conf = initial)}>{W.reset}</button>
	</div>
	<p class="disk">{W.disks} <code>{disk.join(', ')}</code></p>
	<div class="dg-ctl" role="group" aria-label={W.urlGroup}>
		{#each urls as u (u)}
			<button type="button" class="dg-mono" aria-pressed={url === u} onclick={() => (url = u)}>GET {u}</button>
		{/each}
	</div>
	<div class="dg-box answer" aria-live="polite">
		<p class="line"><strong class="st {group}">{res.status} {res.text}</strong></p>
		{#each res.headers as [k, v] (k)}<p class="dg-mono">{k}: {v}</p>{/each}
		<p>{W.matched} <code>{res.rule}</code>.</p>
		<p>{res.note}</p>
	</div>
	<p class="note">{W.note}</p>
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
