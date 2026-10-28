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
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			paths: ['/', '/uslugi/', '/ceny/', '/blog/granica/', '/kabinet/', '/spasibo/', '/staroe-predlozhenie/'],
			names: ['Главная', 'Услуги', 'Цены и запись', 'Статья про границу', 'Личный кабинет', 'Страница «Спасибо»', 'Старое предложение (ссылок нет)'],
			notFound: 'Робот не нашёл эту страницу: на неё нет ссылок и её нет в sitemap.',
			notFoundP: 'нужная страница не найдена',
			both: 'Закрыта в robots.txt, поэтому робот не откроет её и не увидит noindex. Метка бесполезна.',
			bothP: 'noindex не виден: страница закрыта в robots.txt',
			blocked: 'Закрыта в robots.txt: содержимое не читается. Но если на неё ссылаются, поисковик может показать голый адрес.',
			blockedWant: 'нужная страница закрыта от робота',
			blockedOther: 'закрытие в robots.txt не гарантирует, что адрес не покажут',
			sitemapOnly: 'Адрес известен только из sitemap, но робот сюда ещё не дошёл.',
			noindexed: 'Просканирована, noindex: в индекс не попадёт.',
			noindexedP: 'нужная страница закрыта noindex',
			ok: 'Просканирована и может попасть в индекс.',
			okP: 'служебная страница попадёт в индекс',
			caption: 'Робот идёт по ссылкам',
			group: 'Для всего сайта',
			sitemap: 'есть sitemap.xml со всеми адресами',
			link: 'главная ссылается на старое предложение',
			service: '(служебная: в поиск не нужна)',
			disallow: 'Disallow в robots.txt',
			indexed: 'В индексе. ',
			notIndexed: 'Не в индексе. ',
			problems: 'Что не так',
			allGood: 'Все нужные страницы доступны роботу и в индексе, а служебные в индекс не попадут.',
			made: 'Сайт выдуманный. Правила те, что описывают поисковики: robots.txt управляет доступом, а не показом; чтобы страницу не показывали, оставьте её открытой и поставьте noindex.'
		},
		en: {
			paths: ['/', '/services/', '/prices/', '/blog/boundary/', '/account/', '/thanks/', '/old-offer/'],
			names: ['Home', 'Services', 'Prices and booking', 'An article on boundaries', 'The customer account', 'The “Thank you” page', 'The old offer (no links to it)'],
			notFound: 'The robot did not find this page: no link leads to it and it is not in the sitemap.',
			notFoundP: 'a page you need was not found',
			both: 'Blocked in robots.txt, so the robot will not open it and will not see noindex. The tag is useless.',
			bothP: 'noindex is not seen: the page is blocked in robots.txt',
			blocked: 'Blocked in robots.txt: the content is not read. But if others link to it, the search engine may show a bare address.',
			blockedWant: 'a page you need is blocked from the robot',
			blockedOther: 'blocking in robots.txt does not guarantee the address will not be shown',
			sitemapOnly: 'The address is known only from the sitemap, but the robot has not got there yet.',
			noindexed: 'Crawled, and marked noindex: it will not enter the index.',
			noindexedP: 'a page you need is closed by noindex',
			ok: 'Crawled, and may enter the index.',
			okP: 'a service page will enter the index',
			caption: 'The robot follows links',
			group: 'For the whole site',
			sitemap: 'there is a sitemap.xml with all the addresses',
			link: 'the home page links to the old offer',
			service: '(a service page: not needed in search)',
			disallow: 'Disallow in robots.txt',
			indexed: 'In the index. ',
			notIndexed: 'Not in the index. ',
			problems: 'What is wrong',
			allGood: 'All the pages you need are open to the robot and in the index, and the service pages will not enter the index.',
			made: 'The site is invented. The rules are those the search engines state: robots.txt controls access, not display; to keep a page from being shown, leave it open and set noindex.'
		}
	});
	const P = W.paths;

	type Page = { path: string; name: string; links: string[]; want: boolean };
	const base: Page[] = [
		{ path: P[0], name: W.names[0], links: [P[1], P[2], P[3], P[4]], want: true },
		{ path: P[1], name: W.names[1], links: [P[2]], want: true },
		{ path: P[2], name: W.names[2], links: [P[5]], want: true },
		{ path: P[3], name: W.names[3], links: [P[1]], want: true },
		{ path: P[4], name: W.names[4], links: [], want: false },
		{ path: P[5], name: W.names[5], links: [], want: false },
		{ path: P[6], name: W.names[6], links: [], want: true }
	];

	let blocked = $state<Record<string, boolean>>({});
	let noindex = $state<Record<string, boolean>>({});
	let sitemap = $state(false);
	let linkOrphan = $state(false);

	const pages = $derived(
		base.map((p) => (p.path === '/' && linkOrphan ? { ...p, links: [...p.links, P[6]] } : p))
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
			if (!seen) s = { text: W.notFound, indexed: false, problem: p.want ? W.notFoundP : null };
			else if (blocked[p.path] && noindex[p.path]) s = { text: W.both, indexed: false, problem: W.bothP };
			else if (blocked[p.path]) s = { text: W.blocked, indexed: false, problem: p.want ? W.blockedWant : W.blockedOther };
			else if (!crawled.has(p.path)) s = { text: W.sitemapOnly, indexed: false, problem: null };
			else if (noindex[p.path]) s = { text: W.noindexed, indexed: false, problem: p.want ? W.noindexedP : null };
			else s = { text: W.ok, indexed: true, problem: p.want ? null : W.okP };
			out.set(p.path, s);
		}
		return out;
	});
	const problems = $derived([...result.entries()].filter(([, s]) => s.problem).map(([path, s]) => `${path}: ${s.problem}`));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.group}>
		<label><input type="checkbox" bind:checked={sitemap} /> {W.sitemap}</label>
		<label><input type="checkbox" bind:checked={linkOrphan} /> {W.link}</label>
	</div>
	<ul class="pages">
		{#each pages as p (p.path)}
			{@const s = result.get(p.path)!}
			<li class:bad={!!s.problem}>
				<p class="h"><strong>{p.name}</strong> <span class="dg-mono">{p.path}</span> {p.want ? '' : W.service}</p>
				<div class="dg-ctl">
					<label><input type="checkbox" checked={!!blocked[p.path]} onchange={(e) => (blocked[p.path] = e.currentTarget.checked)} /> {W.disallow}</label>
					<label><input type="checkbox" checked={!!noindex[p.path]} onchange={(e) => (noindex[p.path] = e.currentTarget.checked)} /> noindex</label>
				</div>
				<p class="st">{s.indexed ? W.indexed : W.notIndexed}{s.text}</p>
			</li>
		{/each}
	</ul>
	<p class="dg-out" aria-live="polite">
		{#if problems.length}
			<strong>{W.problems} ({problems.length}):</strong> {problems.join('; ')}.
		{:else}
			{W.allGood}
		{/if}
	</p>
	<p class="dg-out">{W.made}</p>
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
