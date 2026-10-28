<!--
	«Путь DNS-запроса» (part 1, lesson 5), in two parts. First, a step-by-step walk of one lookup:
	browser, resolver, root, the zone's servers, the domain's own server, with a choice of what is
	already cached. Second, the TTL: a slider shows how long an old answer can live after a record
	changes. Names and addresses are the documentation ones (example, 203.0.113.x), not real.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';
	type Cache = 'cold' | 'zone' | 'answer' | 'browser';
	type Step = { from: string; to: string; ask: string; reply: string; answer?: boolean };
	const W = pick({
		ru: {
			names: ['www.example.ru', 'shop.example.com', 'пример.рф'],
			zones: { 'www.example.ru': 'ru', 'shop.example.com': 'com', 'пример.рф': 'рф' } as Record<string, string>,
			full: (name: string, zone: string): Step[] => [
				{ from: 'Браузер', to: 'Резолвер', ask: `Какой адрес у ${name}?`, reply: 'Не знаю, но найду.' },
				{ from: 'Резолвер', to: 'Корневой сервер', ask: `Кто отвечает за зону .${zone}?`, reply: `Не знаю ${name}, но за .${zone} отвечают вот эти серверы.` },
				{ from: 'Резолвер', to: `Сервер зоны .${zone}`, ask: `Кто отвечает за example в зоне .${zone}?`, reply: 'За этот домен отвечает ns1.hosting.example, спросите его.' },
				{ from: 'Резолвер', to: 'Авторитетный сервер домена', ask: `Какой адрес у ${name}?`, reply: 'Запись A: 203.0.113.10, TTL 3600 секунд.' },
				{ from: 'Резолвер', to: 'Браузер', ask: '', answer: true, reply: `${name} это 203.0.113.10. Запомню на 3600 секунд.` }
			],
			labels: { cold: 'Ничего не известно', zone: 'Резолвер знает серверы зоны', answer: 'Резолвер знает ответ', browser: 'Браузер знает ответ' } as Record<Cache, string>,
			units: { s: 'с', min: 'мин', h: 'ч', d: 'сут' },
			caption: 'Один запрос, шаг за шагом',
			nameGroup: 'Имя сайта',
			cacheGroup: 'Что уже есть в кэше',
			open: '«',
			close: '»',
			browserKnows: (name: string) => `Браузер уже знает адрес ${name} и вообще не спрашивает сеть: 0 запросов.`,
			next: 'Следующий шаг',
			restart: 'Сначала',
			requests: 'Запросов по сети:',
			notCounted: '(ответ браузеру не считается запросом)',
			after: 'Дальше браузер подключается к 203.0.113.10 (это уже TCP, урок 3). Чем больше в кэше, тем быстрее первый шаг: корневой сервер спрашивают редко.',
			ttlHead: 'Сколько живёт старый ответ (TTL)',
			ttlIntro: 'Вы сменили адрес сайта. Резолверы по всему миру запомнили старый ответ в разное время и держат его, пока не истечёт TTL.',
			ttlGroup: 'TTL записи',
			elapsed: 'Прошло после смены записи:',
			barLabel: (pct: number) => `Доля резолверов, которые ещё отдают старый адрес: ${pct}%`,
			stillOld: 'Резолверов, которые ещё отдают',
			old: 'старый',
			addr: 'адрес:',
			none: (h: string) => `Через ${h} после смены не останется ни одного.`,
			advice: 'Поэтому перед переездом сайта TTL заранее уменьшают, а потом возвращают обратно.'
		},
		en: {
			names: ['www.example.com', 'shop.example.org', 'blog.example.net'],
			zones: { 'www.example.com': 'com', 'shop.example.org': 'org', 'blog.example.net': 'net' } as Record<string, string>,
			full: (name: string, zone: string): Step[] => [
				{ from: 'Browser', to: 'Resolver', ask: `What is the address of ${name}?`, reply: 'I don’t know, but I’ll find out.' },
				{ from: 'Resolver', to: 'Root server', ask: `Who is responsible for the .${zone} zone?`, reply: `I don’t know ${name}, but these servers are responsible for .${zone}.` },
				{ from: 'Resolver', to: `.${zone} zone server`, ask: `Who is responsible for example in the .${zone} zone?`, reply: 'This domain is handled by ns1.hosting.example, ask it.' },
				{ from: 'Resolver', to: 'The domain’s authoritative server', ask: `What is the address of ${name}?`, reply: 'An A record: 203.0.113.10, TTL 3600 seconds.' },
				{ from: 'Resolver', to: 'Browser', ask: '', answer: true, reply: `${name} is 203.0.113.10. I’ll remember it for 3600 seconds.` }
			],
			labels: { cold: 'Nothing is known', zone: 'The resolver knows the zone’s servers', answer: 'The resolver knows the answer', browser: 'The browser knows the answer' } as Record<Cache, string>,
			units: { s: 's', min: 'min', h: 'h', d: 'days' },
			caption: 'One query, step by step',
			nameGroup: 'The site’s name',
			cacheGroup: 'What is already cached',
			open: '“',
			close: '”',
			browserKnows: (name: string) => `The browser already knows the address of ${name} and doesn’t ask the network at all: 0 requests.`,
			next: 'Next step',
			restart: 'Start over',
			requests: 'Requests over the network:',
			notCounted: '(the reply to the browser doesn’t count as a request)',
			after: 'Next the browser connects to 203.0.113.10 (that is TCP, lesson 3). The more is cached, the quicker the first step: the root server is rarely asked.',
			ttlHead: 'How long an old answer lives (TTL)',
			ttlIntro: 'You changed the site’s address. Resolvers around the world remembered the old answer at different times and keep it until the TTL runs out.',
			ttlGroup: 'The record’s TTL',
			elapsed: 'Time since the record changed:',
			barLabel: (pct: number) => `Share of resolvers still giving the old address: ${pct}%`,
			stillOld: 'Resolvers still giving the',
			old: 'old',
			addr: 'address:',
			none: (h: string) => `${h} after the change there will be none.`,
			advice: 'That is why the TTL is lowered in advance before a site is moved, and raised again afterwards.'
		}
	});
	const names = W.names;
	const zones = W.zones;
	let name = $state<string>(names[0]);
	const zone = $derived(zones[name]);

	let cache = $state<Cache>('cold');
	let step = $state(0);

	const full = $derived<Step[]>(W.full(name, zone));
	const steps = $derived.by<Step[]>(() => {
		if (cache === 'browser') return [];
		if (cache === 'answer') return [full[0], full[4]];
		if (cache === 'zone') return [full[0], full[2], full[3], full[4]];
		return full;
	});
	const labels = W.labels;
	const shown = $derived(steps.slice(0, step));

	// the TTL part
	const ttls = [60, 300, 3600, 14400, 86400];
	let ttl = $state(3600);
	let t = $state(1800);
	const pct = $derived(Math.max(0, Math.round((1 - t / ttl) * 100)));
	const human = (s: number) =>
		s < 60 ? `${s} ${W.units.s}` : s < 3600 ? `${Math.round(s / 60)} ${W.units.min}` : s < 86400 ? `${Math.round(s / 3600)} ${W.units.h}` : `${Math.round(s / 86400)} ${W.units.d}`;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.nameGroup}>
		{#each names as n (n)}
			<button type="button" aria-pressed={name === n} onclick={() => ((name = n), (step = 0))}>{n}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label={W.cacheGroup}>
		{#each Object.keys(labels) as c (c)}
			<button type="button" aria-pressed={cache === c} onclick={() => ((cache = c as Cache), (step = 0))}>{labels[c as Cache]}</button>
		{/each}
	</div>
	<ol class="talk" aria-live="polite">
		{#each shown as s, i (i)}
			<li>
				<p class="who"><strong>{s.from}</strong> → <strong>{s.to}</strong></p>
				{#if !s.answer}<p class="ask">{W.open}{s.ask}{W.close}</p>{/if}
				<p class="reply">{s.reply}</p>
			</li>
		{/each}
		{#if cache === 'browser'}<li><p class="reply">{W.browserKnows(name)}</p></li>{/if}
	</ol>
	<div class="dg-ctl">
		<button type="button" onclick={() => (step = Math.min(steps.length, step + 1))} disabled={step >= steps.length}>{W.next}</button>
		<button type="button" onclick={() => (step = 0)} disabled={step === 0}>{W.restart}</button>
		<span>{W.requests} <strong>{steps.length === 0 ? 0 : steps.length - 1}</strong> {W.notCounted}</span>
	</div>
	{#if step >= steps.length && steps.length}
		<p class="dg-out">{W.after}</p>
	{/if}

	<div class="dh">{W.ttlHead}</div>
	<p class="dg-out">{W.ttlIntro}</p>
	<div class="dg-ctl" role="group" aria-label={W.ttlGroup}>
		{#each ttls as v (v)}
			<button type="button" aria-pressed={ttl === v} onclick={() => ((ttl = v), (t = Math.min(t, v)))}>TTL {human(v)}</button>
		{/each}
	</div>
	<label class="dg-ctl">
		{W.elapsed} {human(t)}
		<input type="range" min="0" max={ttl} step={Math.max(1, Math.round(ttl / 60))} bind:value={t} />
	</label>
	<div class="bar" role="img" aria-label={W.barLabel(pct)}>
		<span style="width: {pct}%"></span>
	</div>
	<p class="dg-out" aria-live="polite">
		{W.stillOld} <strong>{W.old}</strong> {W.addr} <strong>{pct}%</strong>. {W.none(human(ttl))}
		{#if ttl >= 14400}{W.advice}{/if}
	</p>
</figure>

<style>
	.dh {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.talk {
		list-style: none;
		padding: 0 !important;
		margin: 0 0 var(--space-3);
		display: grid;
		gap: var(--space-3);
		min-height: 3rem;
	}
	.talk li {
		padding: var(--space-3);
		border-left: 3px solid var(--border-brass);
		background: var(--surface-canvas);
	}
	.talk p {
		margin: 0;
	}
	.who {
		color: var(--text-primary);
	}
	.ask {
		color: var(--text-secondary);
		font-style: italic;
	}
	.reply {
		color: var(--text-body);
	}
	.bar {
		height: 1rem;
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--accent-measure);
		transition: width var(--dur-micro) var(--ease-stop);
	}
</style>
