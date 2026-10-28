<!--
	«CDN и кэш» (part 9, lesson 4). Two models in one figure. The first: a visitor in one of seven
	Russian cities opens a page whose server is in Moscow or in Frankfurt, with or without a CDN with
	points of presence in four cities; the page shows how long the first request takes, from the
	distance (light in fibre travels about 200 km a millisecond, and real routes are longer than the
	straight line, which the 1.4 stands for). The second: a new version of the page is published,
	and for each `Cache-Control` the visitors a few minutes later either still see the old copy or
	the new, with or without a purge. Both are models, orders of magnitude: they teach the shape,
	not a measurement of any network.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type City = { name: string; lat: number; lon: number };
	// The diagram's words and places, one table per edition (docs/content-plan/README.md, «English edition»).
	// Russian: seven Russian cities, a server in Moscow or Frankfurt. English: seven cities of the US and
	// London, a server in Ashburn (Virginia, where much of the cloud lives) or Frankfurt.
	const W = pick({
		ru: {
			cities: [
				{ name: 'Калининград', lat: 54.71, lon: 20.51 },
				{ name: 'Санкт-Петербург', lat: 59.93, lon: 30.34 },
				{ name: 'Москва', lat: 55.75, lon: 37.62 },
				{ name: 'Краснодар', lat: 45.04, lon: 38.98 },
				{ name: 'Екатеринбург', lat: 56.84, lon: 60.65 },
				{ name: 'Новосибирск', lat: 55.03, lon: 82.92 },
				{ name: 'Владивосток', lat: 43.12, lon: 131.89 }
			] as City[],
			home: { name: 'Москва', lat: 55.75, lon: 37.62 } as City,
			abroad: { name: 'Франкфурт', lat: 50.11, lon: 8.68 } as City,
			pops: ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск'],
			visitor: 'Владивосток',
			policies: [
				{ id: 'html-long', label: 'HTML на сутки', header: 'Cache-Control: public, max-age=86400', ttl: 1440, note: 'быстро, но правку увидят только завтра' },
				{ id: 'html-short', label: 'HTML на 5 минут', header: 'Cache-Control: public, max-age=300', ttl: 5, note: 'правка видна в пределах пяти минут' },
				{ id: 'html-reval', label: 'HTML с перепроверкой', header: 'Cache-Control: no-cache', ttl: 0, note: 'копия хранится, но перед каждым показом спрашивают «изменилось ли?» (ответ 304 без тела)' },
				{ id: 'asset', label: 'CSS с хешем в имени, на год', header: 'Cache-Control: public, max-age=31536000, immutable', ttl: Infinity, note: 'имя файла меняется вместе с содержимым, поэтому старая копия никому не мешает' },
				{ id: 'private', label: 'Страница с личными данными', header: 'Cache-Control: private, no-store', ttl: 0, note: 'общий кэш и CDN её не хранят' }
			],
			caption: 'Расстояние до сервера и жизнь кэша',
			visitorIn: 'Посетитель в городе',
			serverOf: 'Сервер сайта',
			noCdn: 'Без CDN',
			withCdn: (p: string) => `С CDN (${p})`,
			copyInCache: 'Копия в кэше',
			hitBtn: 'Копия уже в кэше (попадание)',
			missBtn: 'Первый запрос (промах)',
			nearest: 'Ближайший узел:',
			about: 'около',
			km: 'км',
			hitText: 'Копия лежит на узле: сервер сайта вообще не участвует.',
			missText: 'Копии нет: узел сходит на сервер сайта и запомнит ответ.',
			direct: (city: string) => `Запрос идёт прямо на сервер в городе ${city}, около`,
			start: 'Начало загрузки страницы (соединение, шифрование, первый ответ): примерно',
			ms: 'мс',
			model: 'Модель: свет в кабеле проходит около 200 км за миллисекунду, реальный путь длиннее прямой в полтора раза, и для начала страницы нужно три «туда и обратно». Все остальные запросы страницы тоже выигрывают.',
			published: 'Опубликовали новую версию',
			whatCache: 'Что кэшируем',
			purged: 'Сбросили кэш при публикации',
			after: 'Через сколько минут после публикации:',
			h: 'ч',
			min: 'мин',
			newSeen1: 'Новую версию уже видят',
			newSeen2: 'посетителей. Итог:'
		},
		en: {
			cities: [
				{ name: 'Seattle', lat: 47.61, lon: -122.33 },
				{ name: 'Los Angeles', lat: 34.05, lon: -118.24 },
				{ name: 'Denver', lat: 39.74, lon: -104.99 },
				{ name: 'Chicago', lat: 41.88, lon: -87.63 },
				{ name: 'New York', lat: 40.71, lon: -74.01 },
				{ name: 'Miami', lat: 25.76, lon: -80.19 },
				{ name: 'London', lat: 51.51, lon: -0.13 }
			] as City[],
			home: { name: 'Ashburn, Virginia', lat: 39.04, lon: -77.49 } as City,
			abroad: { name: 'Frankfurt', lat: 50.11, lon: 8.68 } as City,
			pops: ['Los Angeles', 'Chicago', 'New York', 'London'],
			visitor: 'Seattle',
			policies: [
				{ id: 'html-long', label: 'HTML for a day', header: 'Cache-Control: public, max-age=86400', ttl: 1440, note: 'fast, but an edit will only be seen tomorrow' },
				{ id: 'html-short', label: 'HTML for 5 minutes', header: 'Cache-Control: public, max-age=300', ttl: 5, note: 'an edit shows within five minutes' },
				{ id: 'html-reval', label: 'HTML with revalidation', header: 'Cache-Control: no-cache', ttl: 0, note: 'a copy is kept, but before each showing the cache asks “has it changed?” (a 304 answer with no body)' },
				{ id: 'asset', label: 'CSS with a hash in its name, for a year', header: 'Cache-Control: public, max-age=31536000, immutable', ttl: Infinity, note: 'the file’s name changes with its content, so the old copy bothers no one' },
				{ id: 'private', label: 'A page with personal data', header: 'Cache-Control: private, no-store', ttl: 0, note: 'shared caches and the CDN don’t keep it' }
			],
			caption: 'The distance to the server, and the life of a cache',
			visitorIn: 'The visitor is in',
			serverOf: 'The site’s server',
			noCdn: 'No CDN',
			withCdn: (p: string) => `With a CDN (${p})`,
			copyInCache: 'The copy in the cache',
			hitBtn: 'The copy is already in the cache (a hit)',
			missBtn: 'The first request (a miss)',
			nearest: 'The nearest node:',
			about: 'about',
			km: 'km',
			hitText: 'The copy is on the node: the site’s server isn’t involved at all.',
			missText: 'There is no copy: the node goes to the site’s server and remembers the answer.',
			direct: (city: string) => `The request goes straight to the server in ${city}, about`,
			start: 'The start of the page load (connection, encryption, the first answer): roughly',
			ms: 'ms',
			model: 'The model: light in a cable travels about 200 km a millisecond, a real route is about one and a half times longer than the straight line, and the start of a page takes three round trips. All the page’s other requests gain too.',
			published: 'A new version was published',
			whatCache: 'What we cache',
			purged: 'The cache was purged on publishing',
			after: 'Minutes after publishing:',
			h: 'h',
			min: 'min',
			newSeen1: 'The new version is already seen by',
			newSeen2: 'of visitors. In short:'
		}
	});

	const cities = W.cities;
	const home = W.home;
	const frankfurt = W.abroad;
	const pops = W.pops;

	const km = (a: City, b: City) => {
		const r = (d: number) => (d * Math.PI) / 180;
		const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
		return 2 * 6371 * Math.asin(Math.sqrt(h));
	};
	const rtt = (d: number) => Math.round(d * 1.4 * 2 / 200 + 5); // ms, round trip

	let visitor = $state(W.visitor);
	let originName = $state(home.name);
	let cdn = $state(true);
	let hit = $state(true);

	const v = $derived(cities.find((c) => c.name === visitor)!);
	const origin = $derived(originName === home.name ? home : frankfurt);
	const nearest = $derived(
		cities
			.filter((c) => pops.includes(c.name))
			.map((c) => ({ c, d: km(v, c) }))
			.sort((a, b) => a.d - b.d)[0]
	);
	const direct = $derived(3 * rtt(km(v, origin)));
	const viaCdn = $derived(3 * rtt(nearest.d) + (hit ? 0 : rtt(km(nearest.c, origin))));
	const shown = $derived(cdn ? viaCdn : direct);
	const maxMs = Math.max(...cities.flatMap((c) => [home, frankfurt].map((o) => 3 * rtt(km(c, o)))));

	// --- cache and a new version
	type Policy = { id: string; label: string; header: string; ttl: number; note: string };
	const policies: Policy[] = W.policies;
	let pol = $state('html-long');
	let purge = $state(false);
	let minutes = $state(10);
	const p = $derived(policies.find((x) => x.id === pol)!);
	const seesNew = $derived(
		p.id === 'asset'
			? 100 // a new file has a new name: the page that links to it is new HTML
			: purge || p.ttl === 0
				? 100
				: Math.min(100, Math.round((minutes / p.ttl) * 100))
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>

	<div class="dg-ctl">
		<label>{W.visitorIn}
			<select bind:value={visitor}>{#each cities as c (c.name)}<option>{c.name}</option>{/each}</select>
		</label>
		<label>{W.serverOf}
			<select bind:value={originName}><option>{home.name}</option><option>{frankfurt.name}</option></select>
		</label>
	</div>
	<div class="dg-ctl" role="group" aria-label="CDN">
		<button type="button" aria-pressed={!cdn} onclick={() => (cdn = false)}>{W.noCdn}</button>
		<button type="button" aria-pressed={cdn} onclick={() => (cdn = true)}>{W.withCdn(pops.join(', '))}</button>
	</div>
	{#if cdn}
		<div class="dg-ctl" role="group" aria-label={W.copyInCache}>
			<button type="button" aria-pressed={hit} onclick={() => (hit = true)}>{W.hitBtn}</button>
			<button type="button" aria-pressed={!hit} onclick={() => (hit = false)}>{W.missBtn}</button>
		</div>
	{/if}
	<p class="dg-out" aria-live="polite">
		{#if cdn}{W.nearest} <strong>{nearest.c.name}</strong>, {W.about} {Math.round(nearest.d)} {W.km}. {hit ? W.hitText : W.missText}
		{:else}{W.direct(origin.name)} {Math.round(km(v, origin))} {W.km}.{/if}
		{W.start} <strong>{shown} {W.ms}</strong>.
	</p>
	<div class="bar" aria-hidden="true"><span style="width: {Math.min(100, (shown / maxMs) * 100)}%"></span></div>
	<p class="dg-out">{W.model}</p>

	<div class="dh">{W.published}</div>
	<div class="dg-ctl">
		<label>{W.whatCache}
			<select bind:value={pol}>{#each policies as o (o.id)}<option value={o.id}>{o.label}</option>{/each}</select>
		</label>
		<label><input type="checkbox" bind:checked={purge} /> {W.purged}</label>
	</div>
	<div class="dg-ctl">
		<label>{W.after} <input type="range" min="0" max="1440" step="5" bind:value={minutes} /> <strong>{minutes >= 120 ? `${Math.round(minutes / 60)} ${W.h}` : `${minutes} ${W.min}`}</strong></label>
	</div>
	<p class="dg-out dg-mono">{p.header}</p>
	<p class="dg-out" aria-live="polite">{W.newSeen1} <strong>{seesNew}%</strong> {W.newSeen2} {p.note}.</p>
</figure>

<style>
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.bar {
		height: 0.75rem;
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		max-width: 28rem;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
</style>
