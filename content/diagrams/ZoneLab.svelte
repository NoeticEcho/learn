<!--
	«Зона и переезд» (part 9, lesson 2). Two tabs. The first moves a site to a new server and shows
	who still sees the old one: thirty visitors, each with a resolver cache holding the old answer
	for as long as its TTL has left. A model, not a measurement: visitors' caches are spread evenly
	over the old TTL, which is what many independent visitors look like. The second is a small
	linter for a zone written as text: it knows the handful of mistakes that actually break sites
	(a CNAME at the root, a CNAME beside other records, a mail record that points at an address,
	two SPF records, a missing www). Nothing is sent anywhere: the zone stays in the page.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The sample zone differs only in its mail host's name (a .ru and a .com).
	const W = pick({
		ru: {
			h: 'ч', min: 'мин', sec: 'с',
			sampleMx: 'mail.example.ru.',
			badLine: (n: number) => `Строка ${n} не похожа на запись: нужно «имя TTL ТИП значение».`,
			rootCname: (n: number) => `Строка ${n}: CNAME в корне домена нельзя, там уже есть служебные записи (NS, SOA). Поставьте A или ALIAS/ANAME у провайдера DNS.`,
			cnameAlone: (n: number, name: string) => `Строка ${n}: у имени ${name} есть CNAME и другие записи. CNAME должна быть единственной.`,
			cnameIp: (n: number) => `Строка ${n}: CNAME указывает на имя, а не на IP-адрес. Для адреса нужна запись A.`,
			aName: (n: number) => `Строка ${n}: запись A хранит IP-адрес, а не имя.`,
			mxIp: (n: number) => `Строка ${n}: MX указывает на имя почтового сервера, а не на IP.`,
			mxCname: (n: number) => `Строка ${n}: MX не должна указывать на имя, которое само является CNAME.`,
			spf2: (lines: string) => `Строки ${lines}: SPF-записей должна быть одна на домен. Две записи ломают проверку: объедините их в одну.`,
			and: ' и ',
			noWww: 'Нет записи для www: часть посетителей по привычке набирает www.',
			noDmarc: 'У домена есть почта, но нет записи DMARC на имени _dmarc. Начните с p=none.',
			longTtl: 'Есть TTL в сутки и больше. Перед переездом такую запись придётся заранее уменьшать.',
			wantsEn: 'В вашем брифе есть английский язык: решите, где он живёт: каталог /en/ того же домена, поддомен en. или отдельный домен.',
			fine: 'Серьёзных ошибок не найдено.',
			caption: 'Зона домена: переезд и проверка',
			mode: 'Режим',
			tabMove: 'Переезд на новый сервер',
			tabLint: 'Проверить зону',
			ttlNow: 'TTL записи сейчас',
			ttl5: '5 минут', ttl1h: '1 час', ttlDay: 'сутки',
			loweredTo: 'Заранее уменьшили до',
			to1m: '1 минуты', to5m: '5 минут', to1h: '1 часа',
			hoursBefore: 'за сколько часов до переезда',
			notLowered: 'не уменьшали', before1: 'за 1 ч', before6: 'за 6 ч', before24: 'за 24 ч', before48: 'за 48 ч',
			passed: 'Прошло после смены записи:',
			thirty: 'Тридцать посетителей',
			seesNew: 'видит новый сервер',
			seesOld: 'видит старый сервер',
			of: 'из',
			summary1: 'посетителей уже видят новый сервер,',
			summary2: 'всё ещё старый. Дольше всех старый ответ может жить около',
			lowerFirst: 'Сначала уменьшите TTL и подождите хотя бы прежний срок: пока он не истёк, кэши держат длинный ответ.',
			quiet: 'Кэши успели обновиться на короткий срок, и переезд проходит почти незаметно.',
			dotsNote: '{W.dotsNote}',
			lintIntro: '{W.lintIntro}',
			zone: 'Зона'
		},
		en: {
			h: 'h', min: 'min', sec: 's',
			sampleMx: 'mail.example.com.',
			badLine: (n: number) => `Line ${n} doesn’t look like a record: it needs “name TTL TYPE value”.`,
			rootCname: (n: number) => `Line ${n}: a CNAME at the root of a domain is not allowed, because the root already holds service records (NS, SOA). Use an A record, or ALIAS/ANAME at your DNS provider.`,
			cnameAlone: (n: number, name: string) => `Line ${n}: the name ${name} has a CNAME and other records. A CNAME has to be the only record.`,
			cnameIp: (n: number) => `Line ${n}: a CNAME points at a name, not at an IP address. For an address you need an A record.`,
			aName: (n: number) => `Line ${n}: an A record holds an IP address, not a name.`,
			mxIp: (n: number) => `Line ${n}: an MX points at the name of a mail server, not at an IP.`,
			mxCname: (n: number) => `Line ${n}: an MX must not point at a name that is itself a CNAME.`,
			spf2: (lines: string) => `Lines ${lines}: there should be one SPF record per domain. Two records break the check: merge them into one.`,
			and: ' and ',
			noWww: 'There is no record for www: some visitors type www out of habit.',
			noDmarc: 'The domain has mail but no DMARC record at the name _dmarc. Start with p=none.',
			longTtl: 'Some TTLs are a day or longer. Before a move, such a record has to be shortened in advance.',
			wantsEn: 'Your brief has more than one language: decide where the extra one lives: a folder on the same domain, a subdomain or a separate domain.',
			fine: 'No serious mistakes found.',
			caption: 'A domain’s zone: a move and a check',
			mode: 'Mode',
			tabMove: 'Moving to a new server',
			tabLint: 'Check a zone',
			ttlNow: 'The record’s TTL now',
			ttl5: '5 minutes', ttl1h: '1 hour', ttlDay: 'a day',
			loweredTo: 'Shortened in advance to',
			to1m: '1 minute', to5m: '5 minutes', to1h: '1 hour',
			hoursBefore: 'how many hours before the move',
			notLowered: 'not shortened', before1: '1 h before', before6: '6 h before', before24: '24 h before', before48: '48 h before',
			passed: 'Time since the record changed:',
			thirty: 'Thirty visitors',
			seesNew: 'sees the new server',
			seesOld: 'sees the old server',
			of: 'of',
			summary1: 'visitors already see the new server,',
			summary2: 'still see the old one. The longest an old answer can live is about',
			lowerFirst: 'First shorten the TTL and wait at least the old period: until it runs out, caches keep the long answer.',
			quiet: 'The caches had time to switch to the short period, and the move goes almost unnoticed.',
			dotsNote: 'Dark dots see the new server and light ones still see the old. That is why the old server isn’t switched off at once: it has to live until the longest cache expires.',
			lintIntro: 'The zone is written as text: name, TTL, type, value. Fix the mistakes in the example or paste your own zone. The text stays in this page.',
			zone: 'Zone'
		}
	});

	let tab = $state<'move' | 'lint'>('move');

	// --- the move
	let oldTtl = $state(86400);
	let lowerTo = $state(300);
	let lowerHoursBefore = $state(0);
	let afterMinutes = $state(30);
	const N = 30;

	// the longest an old answer can still be cached after the change
	const staleSeconds = $derived(Math.max(lowerTo, oldTtl - lowerHoursBefore * 3600));
	const visitors = $derived(
		Array.from({ length: N }, (_, i) => {
			const expires = ((i + 0.5) / N) * staleSeconds;
			return afterMinutes * 60 >= expires ? 'new' : 'old';
		})
	);
	const oldCount = $derived(visitors.filter((v) => v === 'old').length);
	const human = (s: number) => (s >= 7200 ? `${Math.round(s / 3600)} ${W.h}` : s >= 120 ? `${Math.round(s / 60)} ${W.min}` : `${s} ${W.sec}`);

	// --- the linter
	let zone = $state(`@      86400 CNAME  hosting.example.net.
www    86400 A      192.0.2.10
@      3600  MX     ${W.sampleMx}
mail   3600  A      192.0.2.20
@      3600  TXT    "v=spf1 include:_spf.mail.example ~all"
@      3600  TXT    "v=spf1 ip4:192.0.2.20 -all"`);
	let wantsEnglish = $state(false);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			wantsEnglish = (p.languages ?? []).length > 1 && (p.languages ?? []).includes('en');
		} catch {
			/* the example stays */
		}
	});

	type Rec = { name: string; ttl: number; type: string; value: string; line: number };
	const records = $derived<Rec[]>(
		zone
			.split('\n')
			.map((l, i) => ({ l: l.trim(), i }))
			.filter(({ l }) => l && !l.startsWith(';'))
			.map(({ l, i }) => {
				const m = l.match(/^(\S+)\s+(\d+)\s+(\S+)\s+(.+)$/);
				return m ? { name: m[1], ttl: +m[2], type: m[3].toUpperCase(), value: m[4].trim(), line: i + 1 } : { name: '?', ttl: 0, type: '?', value: l, line: i + 1 };
			})
	);
	const isIp = (v: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(v);
	const findings = $derived.by(() => {
		const out: { bad: boolean; text: string }[] = [];
		const at = (n: string) => records.filter((r) => r.name === n);
		for (const r of records) if (r.type === '?') out.push({ bad: true, text: W.badLine(r.line) });
		for (const r of records.filter((r) => r.type === 'CNAME' && r.name === '@'))
			out.push({ bad: true, text: W.rootCname(r.line) });
		for (const r of records.filter((r) => r.type === 'CNAME')) {
			const mates = at(r.name).filter((x) => x !== r);
			if (mates.length && r.name !== '@') out.push({ bad: true, text: W.cnameAlone(r.line, r.name) });
		}
		for (const r of records.filter((r) => r.type === 'CNAME' && isIp(r.value))) out.push({ bad: true, text: W.cnameIp(r.line) });
		for (const r of records.filter((r) => r.type === 'A' && !isIp(r.value))) out.push({ bad: true, text: W.aName(r.line) });
		for (const r of records.filter((r) => r.type === 'MX')) {
			const target = r.value.replace(/^\d+\s+/, '');
			if (isIp(target)) out.push({ bad: true, text: W.mxIp(r.line) });
			else if (records.some((x) => x.type === 'CNAME' && x.name === target.split('.')[0]))
				out.push({ bad: true, text: W.mxCname(r.line) });
		}
		const spf = records.filter((r) => r.type === 'TXT' && r.value.includes('v=spf1'));
		if (spf.length > 1) out.push({ bad: true, text: W.spf2(spf.map((s) => s.line).join(W.and)) });
		if (!records.some((r) => r.name === 'www')) out.push({ bad: true, text: W.noWww });
		if (records.some((r) => r.type === 'MX') && !records.some((r) => r.value.includes('v=DMARC1'))) out.push({ bad: false, text: W.noDmarc });
		if (records.some((r) => r.ttl >= 86400)) out.push({ bad: false, text: W.longTtl });
		if (wantsEnglish) out.push({ bad: false, text: W.wantsEn });
		if (!out.some((f) => f.bad)) out.unshift({ bad: false, text: W.fine });
		return out;
	});
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="tablist" aria-label={W.mode}>
		<button type="button" role="tab" aria-selected={tab === 'move'} onclick={() => (tab = 'move')}>{W.tabMove}</button>
		<button type="button" role="tab" aria-selected={tab === 'lint'} onclick={() => (tab = 'lint')}>{W.tabLint}</button>
	</div>

	{#if tab === 'move'}
		<div class="dg-ctl">
			<label>{W.ttlNow}
				<select bind:value={oldTtl}>
					<option value={300}>{W.ttl5}</option>
					<option value={3600}>{W.ttl1h}</option>
					<option value={86400}>{W.ttlDay}</option>
				</select>
			</label>
			<label>{W.loweredTo}
				<select bind:value={lowerTo}>
					<option value={60}>{W.to1m}</option>
					<option value={300}>{W.to5m}</option>
					<option value={3600}>{W.to1h}</option>
				</select>
			</label>
			<label>{W.hoursBefore}
				<select bind:value={lowerHoursBefore}>
					<option value={0}>{W.notLowered}</option>
					<option value={1}>{W.before1}</option>
					<option value={6}>{W.before6}</option>
					<option value={24}>{W.before24}</option>
					<option value={48}>{W.before48}</option>
				</select>
			</label>
		</div>
		<div class="dg-ctl">
			<label>{W.passed} <input type="range" min="0" max="2880" step="5" bind:value={afterMinutes} /> <strong>{afterMinutes >= 120 ? `${Math.round(afterMinutes / 60)} ${W.h}` : `${afterMinutes} ${W.min}`}</strong></label>
		</div>
		<ul class="dots" aria-label={W.thirty}>
			{#each visitors as v, i (i)}<li class={v}><span class="visually-hidden">{v === 'new' ? W.seesNew : W.seesOld}</span></li>{/each}
		</ul>
		<p class="dg-out" aria-live="polite">
			<strong>{N - oldCount} {W.of} {N}</strong> {W.summary1} <strong>{oldCount}</strong> {W.summary2} <strong>{human(staleSeconds)}</strong>.
			{#if lowerHoursBefore * 3600 < oldTtl - lowerTo}{W.lowerFirst}{:else}{W.quiet}{/if}
		</p>
		<p class="dg-out">{W.dotsNote}</p>
	{:else}
		<p class="dg-out">{W.lintIntro}</p>
		<label class="area">{W.zone}
			<textarea bind:value={zone} rows="8" spellcheck="false" class="dg-mono"></textarea>
		</label>
		<ul class="finds" aria-live="polite">
			{#each findings as f, i (i)}<li class:bad={f.bad}>{f.text}</li>{/each}
		</ul>
	{/if}
</figure>

<style>
	.dots {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: var(--space-2);
		padding: 0 !important;
		max-width: 28rem;
	}
	.dots li {
		aspect-ratio: 1;
		border: var(--line) solid var(--border-rule);
		border-radius: 50%;
	}
	.dots li.new {
		background: var(--accent-measure);
		border-color: var(--accent-measure);
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.area {
		display: grid;
		gap: var(--space-1);
	}
	textarea {
		width: 100%;
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-body);
	}
	.finds {
		margin-top: var(--space-3) !important;
		display: grid;
		gap: var(--space-2);
		list-style: none;
		padding: 0 !important;
	}
	.finds li {
		padding: var(--space-2) var(--space-3);
		border-left: 4px solid var(--border-brass);
		background: var(--surface-canvas);
	}
	.finds li.bad {
		border-left-color: var(--text-primary);
	}
</style>
