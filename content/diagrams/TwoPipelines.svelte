<!--
	«Два конвейера» (part 6, lesson 2). The same visitor count sent through a static page (a file,
	maybe from a cache) and a dynamic one (code, then a database, then HTML), with and without a
	cache in front of the dynamic one. The numbers are illustrative, not measured: a small model
	(a constant for the file, a base time plus a queue once the server is saturated for the code)
	to show the shape, which is flat for the file and bends for the code, and what a cache does.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words, and the prices in each
	// edition's currency (the figures are illustrative either way), are in `W`.
	const W = pick({
		ru: {
			caption: 'Тот же поток посетителей, два способа',
			visitors: 'Посетителей в минуту:',
			cache: 'перед динамической страницей стоит кэш',
			staticLabel: 'Статическая страница',
			staticHead: 'Статика: файл, часто из кэша',
			staticFlow: ['запрос → ', 'файл', ' → ответ'],
			dynamicLabel: 'Динамическая страница',
			dynamicHead: 'Динамика: код и база',
			dynamicFlow: ['запрос → код → ', 'база', ' → HTML → ответ'],
			ms: 'мс',
			staticNum: (ms: number, cost: string) => `≈ ${ms} мс · серверов: 0 (раздаёт хостинг или CDN) · ≈ ${cost} в месяц сверх хостинга`,
			dynamicNum: (ms: number, servers: number, cost: string) => `на одном сервере ≈ ${ms} мс · чтобы держать нагрузку без очереди, нужно серверов: ${servers} (≈ ${cost} в месяц)`,
			money: (n: number) => `${n.toLocaleString('ru-RU')} ₽`,
			server: 1500,
			cacheCost: 500,
			over: 'Один сервер уже не справляется: очередь запросов растёт, посетители ждут. Нужны кэш или больше серверов (а значит, и больше денег).',
			cached: 'Кэш делает динамическую страницу почти такой же быстрой: большая часть ответов отдаётся готовой.',
			plain: 'При небольшом потоке разница заметна, но терпима. Она растёт вместе с числом посетителей.',
			note: 'Цифры условные: они показывают форму кривой, а не замер. В жизни всё зависит от кода, базы и железа.'
		},
		en: {
			caption: 'The same stream of visitors, two ways',
			visitors: 'Visitors per minute:',
			cache: 'a cache stands in front of the dynamic page',
			staticLabel: 'Static page',
			staticHead: 'Static: a file, often from a cache',
			staticFlow: ['request → ', 'file', ' → response'],
			dynamicLabel: 'Dynamic page',
			dynamicHead: 'Dynamic: code and a database',
			dynamicFlow: ['request → code → ', 'database', ' → HTML → response'],
			ms: 'ms',
			staticNum: (ms: number, cost: string) => `≈ ${ms} ms · servers: 0 (the host or a CDN hands it out) · ≈ ${cost} a month on top of hosting`,
			dynamicNum: (ms: number, servers: number, cost: string) => `on one server ≈ ${ms} ms · to carry the load without a queue you need ${servers} server${servers === 1 ? '' : 's'} (≈ ${cost} a month)`,
			money: (n: number) => `£${n.toLocaleString('en-GB')}`,
			server: 15,
			cacheCost: 5,
			over: 'One server can no longer cope: the queue of requests grows and visitors wait. You need a cache or more servers (and so more money).',
			cached: 'A cache makes the dynamic page almost as fast: most answers go out ready-made.',
			plain: 'With a small stream the difference is noticeable but tolerable. It grows with the number of visitors.',
			note: 'The figures are illustrative: they show the shape of the curve, not a measurement. In real life it all depends on the code, the database and the hardware.'
		}
	});

	let visitors = $state(200); // per minute
	let cache = $state(false);

	const staticMs = 40;
	const capacity = 400; // visits per minute one small server answers without a queue
	const dynamicMs = $derived.by(() => {
		const base = cache ? 70 : 220;
		const cap = cache ? capacity * 8 : capacity;
		const over = Math.max(0, visitors - cap);
		return Math.round(base + over * (cache ? 0.2 : 0.9));
	});
	const servers = $derived(Math.max(1, Math.ceil(visitors / (cache ? capacity * 8 : capacity))));
	const cost = $derived({ static: 0, dynamic: servers * W.server + (cache ? W.cacheCost : 0) });
	const pct = (ms: number) => Math.min(100, Math.round((ms / 1500) * 100));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.visitors} {visitors}
			<input type="range" min="10" max="4000" step="10" bind:value={visitors} />
		</label>
		<label><input type="checkbox" bind:checked={cache} /> {W.cache}</label>
	</div>
	<div class="two">
		<section aria-label={W.staticLabel}>
			<div class="dh">{W.staticHead}</div>
			<p class="flow">{W.staticFlow[0]}<b>{W.staticFlow[1]}</b>{W.staticFlow[2]}</p>
			<div class="bar"><span class="fill" style="width:{pct(staticMs)}%"></span></div>
			<p class="num">{W.staticNum(staticMs, W.money(cost.static))}</p>
		</section>
		<section aria-label={W.dynamicLabel}>
			<div class="dh">{W.dynamicHead}</div>
			<p class="flow">{W.dynamicFlow[0]}<b>{W.dynamicFlow[1]}</b>{W.dynamicFlow[2]}</p>
			<div class="bar"><span class="fill dyn" style="width:{pct(dynamicMs)}%"></span></div>
			<p class="num">{W.dynamicNum(dynamicMs, servers, W.money(cost.dynamic))}</p>
		</section>
	</div>
	<p class="dg-out" aria-live="polite">
		{#if dynamicMs > 600}{W.over}
		{:else if cache}{W.cached}
		{:else}{W.plain}{/if}
	</p>
	<p class="note">{W.note}</p>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.flow {
		margin: 0 0 var(--space-2);
	}
	.bar {
		height: 0.9rem;
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
	.fill.dyn {
		background: var(--brass-300);
	}
	.num,
	.note {
		margin: var(--space-2) 0 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
