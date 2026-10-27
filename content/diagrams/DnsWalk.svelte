<!--
	«Путь DNS-запроса» (part 1, lesson 5), in two parts. First, a step-by-step walk of one lookup:
	browser, resolver, root, the zone's servers, the domain's own server, with a choice of what is
	already cached. Second, the TTL: a slider shows how long an old answer can live after a record
	changes. Names and addresses are the documentation ones (example, 203.0.113.x), not real.
-->
<script lang="ts">
	import './shared.css';

	const names = ['www.example.ru', 'shop.example.com', 'пример.рф'] as const;
	const zones: Record<string, string> = { 'www.example.ru': 'ru', 'shop.example.com': 'com', 'пример.рф': 'рф' };
	let name = $state<(typeof names)[number]>(names[0]);
	const zone = $derived(zones[name]);

	type Cache = 'cold' | 'zone' | 'answer' | 'browser';
	let cache = $state<Cache>('cold');
	let step = $state(0);

	type Step = { from: string; to: string; ask: string; reply: string };
	const full = $derived<Step[]>([
		{ from: 'Браузер', to: 'Резолвер', ask: `Какой адрес у ${name}?`, reply: 'Не знаю, но найду.' },
		{ from: 'Резолвер', to: 'Корневой сервер', ask: `Кто отвечает за зону .${zone}?`, reply: `Не знаю ${name}, но за .${zone} отвечают вот эти серверы.` },
		{ from: 'Резолвер', to: `Сервер зоны .${zone}`, ask: `Кто отвечает за example в зоне .${zone}?`, reply: 'За этот домен отвечает ns1.hosting.example, спросите его.' },
		{ from: 'Резолвер', to: 'Авторитетный сервер домена', ask: `Какой адрес у ${name}?`, reply: 'Запись A: 203.0.113.10, TTL 3600 секунд.' },
		{ from: 'Резолвер', to: 'Браузер', ask: '(ответ)', reply: `${name} это 203.0.113.10. Запомню на 3600 секунд.` }
	]);
	const steps = $derived.by<Step[]>(() => {
		if (cache === 'browser') return [];
		if (cache === 'answer') return [full[0], full[4]];
		if (cache === 'zone') return [full[0], full[2], full[3], full[4]];
		return full;
	});
	const labels: Record<Cache, string> = {
		cold: 'Ничего не известно',
		zone: 'Резолвер знает серверы зоны',
		answer: 'Резолвер знает ответ',
		browser: 'Браузер знает ответ'
	};
	const shown = $derived(steps.slice(0, step));

	// the TTL part
	const ttls = [60, 300, 3600, 14400, 86400];
	let ttl = $state(3600);
	let t = $state(1800);
	const pct = $derived(Math.max(0, Math.round((1 - t / ttl) * 100)));
	const human = (s: number) => (s < 60 ? `${s} с` : s < 3600 ? `${Math.round(s / 60)} мин` : s < 86400 ? `${Math.round(s / 3600)} ч` : `${Math.round(s / 86400)} сут`);
</script>

<figure class="dg">
	<figcaption>Один запрос, шаг за шагом</figcaption>
	<div class="dg-ctl" role="group" aria-label="Имя сайта">
		{#each names as n (n)}
			<button type="button" aria-pressed={name === n} onclick={() => ((name = n), (step = 0))}>{n}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label="Что уже есть в кэше">
		{#each Object.keys(labels) as c (c)}
			<button type="button" aria-pressed={cache === c} onclick={() => ((cache = c as Cache), (step = 0))}>{labels[c as Cache]}</button>
		{/each}
	</div>
	<ol class="talk" aria-live="polite">
		{#each shown as s, i (i)}
			<li>
				<p class="who"><strong>{s.from}</strong> → <strong>{s.to}</strong></p>
				{#if s.ask !== '(ответ)'}<p class="ask">«{s.ask}»</p>{/if}
				<p class="reply">{s.reply}</p>
			</li>
		{/each}
		{#if cache === 'browser'}<li><p class="reply">Браузер уже знает адрес {name} и вообще не спрашивает сеть: 0 запросов.</p></li>{/if}
	</ol>
	<div class="dg-ctl">
		<button type="button" onclick={() => (step = Math.min(steps.length, step + 1))} disabled={step >= steps.length}>Следующий шаг</button>
		<button type="button" onclick={() => (step = 0)} disabled={step === 0}>Сначала</button>
		<span>Запросов по сети: <strong>{steps.length === 0 ? 0 : steps.length - 1}</strong> (ответ браузеру не считается запросом)</span>
	</div>
	{#if step >= steps.length && steps.length}
		<p class="dg-out">Дальше браузер подключается к 203.0.113.10 (это уже TCP, урок 3). Чем больше в кэше, тем быстрее первый шаг: корневой сервер спрашивают редко.</p>
	{/if}

	<div class="dh">Сколько живёт старый ответ (TTL)</div>
	<p class="dg-out">Вы сменили адрес сайта. Резолверы по всему миру запомнили старый ответ в разное время и держат его, пока не истечёт TTL.</p>
	<div class="dg-ctl" role="group" aria-label="TTL записи">
		{#each ttls as v (v)}
			<button type="button" aria-pressed={ttl === v} onclick={() => ((ttl = v), (t = Math.min(t, v)))}>TTL {human(v)}</button>
		{/each}
	</div>
	<label class="dg-ctl">
		Прошло после смены записи: {human(t)}
		<input type="range" min="0" max={ttl} step={Math.max(1, Math.round(ttl / 60))} bind:value={t} />
	</label>
	<div class="bar" role="img" aria-label="Доля резолверов, которые ещё отдают старый адрес: {pct}%">
		<span style="width: {pct}%"></span>
	</div>
	<p class="dg-out" aria-live="polite">
		Резолверов, которые ещё отдают <strong>старый</strong> адрес: <strong>{pct}%</strong>. Через {human(ttl)} после смены не останется ни одного.
		{#if ttl >= 14400}Поэтому перед переездом сайта TTL заранее уменьшают, а потом возвращают обратно.{/if}
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
