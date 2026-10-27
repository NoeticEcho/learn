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

	type City = { name: string; lat: number; lon: number };
	const cities: City[] = [
		{ name: 'Калининград', lat: 54.71, lon: 20.51 },
		{ name: 'Санкт-Петербург', lat: 59.93, lon: 30.34 },
		{ name: 'Москва', lat: 55.75, lon: 37.62 },
		{ name: 'Краснодар', lat: 45.04, lon: 38.98 },
		{ name: 'Екатеринбург', lat: 56.84, lon: 60.65 },
		{ name: 'Новосибирск', lat: 55.03, lon: 82.92 },
		{ name: 'Владивосток', lat: 43.12, lon: 131.89 }
	];
	const frankfurt: City = { name: 'Франкфурт', lat: 50.11, lon: 8.68 };
	const pops = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск'];

	const km = (a: City, b: City) => {
		const r = (d: number) => (d * Math.PI) / 180;
		const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
		return 2 * 6371 * Math.asin(Math.sqrt(h));
	};
	const rtt = (d: number) => Math.round(d * 1.4 * 2 / 200 + 5); // ms, round trip

	let visitor = $state('Владивосток');
	let originName = $state('Москва');
	let cdn = $state(true);
	let hit = $state(true);

	const v = $derived(cities.find((c) => c.name === visitor)!);
	const origin = $derived(originName === 'Москва' ? cities[2] : frankfurt);
	const nearest = $derived(
		cities
			.filter((c) => pops.includes(c.name))
			.map((c) => ({ c, d: km(v, c) }))
			.sort((a, b) => a.d - b.d)[0]
	);
	const direct = $derived(3 * rtt(km(v, origin)));
	const viaCdn = $derived(3 * rtt(nearest.d) + (hit ? 0 : rtt(km(nearest.c, origin))));
	const shown = $derived(cdn ? viaCdn : direct);
	const maxMs = 3 * rtt(km(cities[6], frankfurt));

	// --- cache and a new version
	type Policy = { id: string; label: string; header: string; ttl: number; note: string };
	const policies: Policy[] = [
		{ id: 'html-long', label: 'HTML на сутки', header: 'Cache-Control: public, max-age=86400', ttl: 1440, note: 'быстро, но правку увидят только завтра' },
		{ id: 'html-short', label: 'HTML на 5 минут', header: 'Cache-Control: public, max-age=300', ttl: 5, note: 'правка видна в пределах пяти минут' },
		{ id: 'html-reval', label: 'HTML с перепроверкой', header: 'Cache-Control: no-cache', ttl: 0, note: 'копия хранится, но перед каждым показом спрашивают «изменилось ли?» (ответ 304 без тела)' },
		{ id: 'asset', label: 'CSS с хэшем в имени, на год', header: 'Cache-Control: public, max-age=31536000, immutable', ttl: Infinity, note: 'имя файла меняется вместе с содержимым, поэтому старая копия никому не мешает' },
		{ id: 'private', label: 'Страница с личными данными', header: 'Cache-Control: private, no-store', ttl: 0, note: 'общий кэш и CDN её не хранят' }
	];
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
	<figcaption>Расстояние до сервера и жизнь кэша</figcaption>

	<div class="dg-ctl">
		<label>Посетитель в городе
			<select bind:value={visitor}>{#each cities as c (c.name)}<option>{c.name}</option>{/each}</select>
		</label>
		<label>Сервер сайта
			<select bind:value={originName}><option>Москва</option><option>Франкфурт</option></select>
		</label>
	</div>
	<div class="dg-ctl" role="group" aria-label="CDN">
		<button type="button" aria-pressed={!cdn} onclick={() => (cdn = false)}>Без CDN</button>
		<button type="button" aria-pressed={cdn} onclick={() => (cdn = true)}>С CDN (Москва, Санкт-Петербург, Екатеринбург, Новосибирск)</button>
	</div>
	{#if cdn}
		<div class="dg-ctl" role="group" aria-label="Копия в кэше">
			<button type="button" aria-pressed={hit} onclick={() => (hit = true)}>Копия уже в кэше (попадание)</button>
			<button type="button" aria-pressed={!hit} onclick={() => (hit = false)}>Первый запрос (промах)</button>
		</div>
	{/if}
	<p class="dg-out" aria-live="polite">
		{#if cdn}Ближайший узел: <strong>{nearest.c.name}</strong>, около {Math.round(nearest.d)} км. {hit ? 'Копия лежит на узле: сервер сайта вообще не участвует.' : 'Копии нет: узел сходит на сервер сайта и запомнит ответ.'}
		{:else}Запрос идёт прямо на сервер в городе {origin.name}, около {Math.round(km(v, origin))} км.{/if}
		Начало загрузки страницы (соединение, шифрование, первый ответ): примерно <strong>{shown} мс</strong>.
	</p>
	<div class="bar" aria-hidden="true"><span style="width: {Math.min(100, (shown / maxMs) * 100)}%"></span></div>
	<p class="dg-out">Модель: свет в кабеле проходит около 200 км за миллисекунду, реальный путь длиннее прямой в полтора раза, и для начала страницы нужно три «туда и обратно». Все остальные запросы страницы тоже выигрывают.</p>

	<h4>Опубликовали новую версию</h4>
	<div class="dg-ctl">
		<label>Что кэшируем
			<select bind:value={pol}>{#each policies as o (o.id)}<option value={o.id}>{o.label}</option>{/each}</select>
		</label>
		<label><input type="checkbox" bind:checked={purge} /> Сбросили кэш при публикации</label>
	</div>
	<div class="dg-ctl">
		<label>Через сколько минут после публикации: <input type="range" min="0" max="1440" step="5" bind:value={minutes} /> <strong>{minutes >= 120 ? `${Math.round(minutes / 60)} ч` : `${minutes} мин`}</strong></label>
	</div>
	<p class="dg-out dg-mono">{p.header}</p>
	<p class="dg-out" aria-live="polite">Новую версию уже видят <strong>{seesNew}%</strong> посетителей. Итог: {p.note}.</p>
</figure>

<style>
	h4 {
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
