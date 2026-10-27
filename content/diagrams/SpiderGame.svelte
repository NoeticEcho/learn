<!--
	«Паук» (part 13, lesson 6). A made-up site of seven pages with the links between them. For each
	page the reader can close it in robots.txt and mark it noindex, and switch a sitemap on or put a
	link to the orphan page on the home page. A small crawler walks the links from the home page and
	the diagram states, page by page, what the robot found, whether it could read the page and
	whether it will be kept in the index. The rules are the ones the search engines state (a page
	closed in robots.txt cannot show its noindex; a sitemap is a hint, not a command); the site is
	made up.
-->
<script lang="ts">
	import './shared.css';

	type Page = { path: string; name: string; links: string[]; want: boolean };
	const base: Page[] = [
		{ path: '/', name: 'Главная', links: ['/uslugi/', '/ceny/', '/blog/granica/', '/kabinet/'], want: true },
		{ path: '/uslugi/', name: 'Услуги', links: ['/ceny/'], want: true },
		{ path: '/ceny/', name: 'Цены и запись', links: ['/spasibo/'], want: true },
		{ path: '/blog/granica/', name: 'Статья про границу', links: ['/uslugi/'], want: true },
		{ path: '/kabinet/', name: 'Личный кабинет', links: [], want: false },
		{ path: '/spasibo/', name: 'Страница «Спасибо»', links: [], want: false },
		{ path: '/staroe-predlozhenie/', name: 'Старое предложение (ссылок нет)', links: [], want: true }
	];

	let blocked = $state<Record<string, boolean>>({});
	let noindex = $state<Record<string, boolean>>({});
	let sitemap = $state(false);
	let linkOrphan = $state(false);

	const pages = $derived(
		base.map((p) => (p.path === '/' && linkOrphan ? { ...p, links: [...p.links, '/staroe-predlozhenie/'] } : p))
	);

	type Status = { text: string; indexed: boolean; problem: string | null };
	const result = $derived.by(() => {
		const byPath = new Map(pages.map((p) => [p.path, p]));
		const found = new Set<string>(sitemap ? pages.map((p) => p.path) : []);
		const crawled = new Set<string>();
		const queue: string[] = ['/'];
		found.add('/');
		while (queue.length) {
			const cur = queue.shift()!;
			if (blocked[cur] || crawled.has(cur)) continue;
			crawled.add(cur);
			for (const l of byPath.get(cur)!.links) {
				found.add(l);
				if (!crawled.has(l)) queue.push(l);
			}
		}
		const out = new Map<string, Status>();
		for (const p of pages) {
			const seen = found.has(p.path);
			let s: Status;
			if (!seen) s = { text: 'Робот не нашёл эту страницу: на неё нет ссылок и её нет в sitemap.', indexed: false, problem: p.want ? 'нужная страница не найдена' : null };
			else if (blocked[p.path] && noindex[p.path]) s = { text: 'Закрыта в robots.txt, поэтому робот не откроет её и не увидит noindex. Метка бесполезна.', indexed: false, problem: 'noindex не виден: страница закрыта в robots.txt' };
			else if (blocked[p.path]) s = { text: 'Закрыта в robots.txt: содержимое не читается. Но если на неё ссылаются, поисковик может показать голый адрес.', indexed: false, problem: p.want ? 'нужная страница закрыта от робота' : 'закрытие в robots.txt не гарантирует, что адрес не покажут' };
			else if (!crawled.has(p.path)) s = { text: 'Адрес известен только из sitemap, но робот сюда ещё не дошёл.', indexed: false, problem: null };
			else if (noindex[p.path]) s = { text: 'Просканирована, noindex: в индекс не попадёт.', indexed: false, problem: p.want ? 'нужная страница закрыта noindex' : null };
			else s = { text: 'Просканирована и может попасть в индекс.', indexed: true, problem: p.want ? null : 'служебная страница попадёт в индекс' };
			out.set(p.path, s);
		}
		return out;
	});
	const problems = $derived([...result.entries()].filter(([, s]) => s.problem).map(([path, s]) => `${path}: ${s.problem}`));
</script>

<figure class="dg">
	<figcaption>Робот идёт по ссылкам</figcaption>
	<div class="dg-ctl" role="group" aria-label="Для всего сайта">
		<label><input type="checkbox" bind:checked={sitemap} /> есть sitemap.xml со всеми адресами</label>
		<label><input type="checkbox" bind:checked={linkOrphan} /> главная ссылается на старое предложение</label>
	</div>
	<ul class="pages">
		{#each pages as p (p.path)}
			{@const s = result.get(p.path)!}
			<li class:bad={!!s.problem}>
				<p class="h"><strong>{p.name}</strong> <span class="dg-mono">{p.path}</span> {p.want ? '' : '(служебная: в поиск не нужна)'}</p>
				<div class="dg-ctl">
					<label><input type="checkbox" checked={!!blocked[p.path]} onchange={(e) => (blocked[p.path] = e.currentTarget.checked)} /> Disallow в robots.txt</label>
					<label><input type="checkbox" checked={!!noindex[p.path]} onchange={(e) => (noindex[p.path] = e.currentTarget.checked)} /> noindex</label>
				</div>
				<p class="st">{s.indexed ? 'В индексе. ' : 'Не в индексе. '}{s.text}</p>
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		{#if problems.length}
			<strong>Что не так ({problems.length}):</strong> {problems.join('; ')}.
		{:else}
			Все нужные страницы доступны роботу и в индексе, а служебные в индекс не попадут.
		{/if}
	</p>
	<p class="dg-out">Сайт выдуманный. Правила те, что описывают поисковики: robots.txt управляет доступом, а не показом; чтобы страницу не показывали, оставьте её открытой и поставьте noindex.</p>
</figure>

<style>
	.pages {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
	}
	li {
		padding: var(--space-2) var(--space-3);
		border-left: 3px solid var(--border-rule);
	}
	li.bad {
		border-left-color: currentColor;
	}
	.h,
	.st {
		margin: 0 0 var(--space-1);
	}
	.st {
		color: var(--text-secondary);
	}
</style>
