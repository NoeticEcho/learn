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
	const human = (s: number) => (s >= 7200 ? `${Math.round(s / 3600)} ч` : s >= 120 ? `${Math.round(s / 60)} мин` : `${s} с`);

	// --- the linter
	let zone = $state(`@      86400 CNAME  hosting.example.net.
www    86400 A      192.0.2.10
@      3600  MX     mail.example.ru.
mail   3600  A      192.0.2.20
@      3600  TXT    "v=spf1 include:_spf.mail.example ~all"
@      3600  TXT    "v=spf1 ip4:192.0.2.20 -all"`);
	let wantsEnglish = $state(false);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			wantsEnglish = (p.languages ?? []).includes('en');
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
		for (const r of records) if (r.type === '?') out.push({ bad: true, text: `Строка ${r.line} не похожа на запись: нужно «имя TTL ТИП значение».` });
		for (const r of records.filter((r) => r.type === 'CNAME' && r.name === '@'))
			out.push({ bad: true, text: `Строка ${r.line}: CNAME в корне домена нельзя, там уже есть служебные записи (NS, SOA). Поставьте A или ALIAS/ANAME у провайдера DNS.` });
		for (const r of records.filter((r) => r.type === 'CNAME')) {
			const mates = at(r.name).filter((x) => x !== r);
			if (mates.length && r.name !== '@') out.push({ bad: true, text: `Строка ${r.line}: у имени ${r.name} есть CNAME и другие записи. CNAME должна быть единственной.` });
		}
		for (const r of records.filter((r) => r.type === 'CNAME' && isIp(r.value))) out.push({ bad: true, text: `Строка ${r.line}: CNAME указывает на имя, а не на IP-адрес. Для адреса нужна запись A.` });
		for (const r of records.filter((r) => r.type === 'A' && !isIp(r.value))) out.push({ bad: true, text: `Строка ${r.line}: запись A хранит IP-адрес, а не имя.` });
		for (const r of records.filter((r) => r.type === 'MX')) {
			const target = r.value.replace(/^\d+\s+/, '');
			if (isIp(target)) out.push({ bad: true, text: `Строка ${r.line}: MX указывает на имя почтового сервера, а не на IP.` });
			else if (records.some((x) => x.type === 'CNAME' && x.name === target.split('.')[0]))
				out.push({ bad: true, text: `Строка ${r.line}: MX не должна указывать на имя, которое само является CNAME.` });
		}
		const spf = records.filter((r) => r.type === 'TXT' && r.value.includes('v=spf1'));
		if (spf.length > 1) out.push({ bad: true, text: `Строки ${spf.map((s) => s.line).join(' и ')}: SPF-записей должна быть одна на домен. Две записи ломают проверку: объедините их в одну.` });
		if (!records.some((r) => r.name === 'www')) out.push({ bad: true, text: 'Нет записи для www: часть посетителей по привычке набирает www.' });
		if (records.some((r) => r.type === 'MX') && !records.some((r) => r.value.includes('v=DMARC1'))) out.push({ bad: false, text: 'У домена есть почта, но нет записи DMARC на имени _dmarc. Начните с p=none.' });
		if (records.some((r) => r.ttl >= 86400)) out.push({ bad: false, text: 'Есть TTL в сутки и больше. Перед переездом такую запись придётся заранее уменьшать.' });
		if (wantsEnglish) out.push({ bad: false, text: 'В вашем брифе есть английский язык: решите, где он живёт: каталог /en/ того же домена, поддомен en. или отдельный домен.' });
		if (!out.some((f) => f.bad)) out.unshift({ bad: false, text: 'Серьёзных ошибок не найдено.' });
		return out;
	});
</script>

<figure class="dg">
	<figcaption>Зона домена: переезд и проверка</figcaption>
	<div class="dg-ctl" role="tablist" aria-label="Режим">
		<button type="button" role="tab" aria-selected={tab === 'move'} onclick={() => (tab = 'move')}>Переезд на новый сервер</button>
		<button type="button" role="tab" aria-selected={tab === 'lint'} onclick={() => (tab = 'lint')}>Проверить зону</button>
	</div>

	{#if tab === 'move'}
		<div class="dg-ctl">
			<label>TTL записи сейчас
				<select bind:value={oldTtl}>
					<option value={300}>5 минут</option>
					<option value={3600}>1 час</option>
					<option value={86400}>сутки</option>
				</select>
			</label>
			<label>Заранее уменьшили до
				<select bind:value={lowerTo}>
					<option value={60}>1 минуты</option>
					<option value={300}>5 минут</option>
					<option value={3600}>1 часа</option>
				</select>
			</label>
			<label>за сколько часов до переезда
				<select bind:value={lowerHoursBefore}>
					<option value={0}>не уменьшали</option>
					<option value={1}>за 1 ч</option>
					<option value={6}>за 6 ч</option>
					<option value={24}>за 24 ч</option>
					<option value={48}>за 48 ч</option>
				</select>
			</label>
		</div>
		<div class="dg-ctl">
			<label>Прошло после смены записи: <input type="range" min="0" max="2880" step="5" bind:value={afterMinutes} /> <strong>{afterMinutes >= 120 ? `${Math.round(afterMinutes / 60)} ч` : `${afterMinutes} мин`}</strong></label>
		</div>
		<ul class="dots" aria-label="Тридцать посетителей">
			{#each visitors as v, i (i)}<li class={v}><span class="visually-hidden">{v === 'new' ? 'видит новый сервер' : 'видит старый сервер'}</span></li>{/each}
		</ul>
		<p class="dg-out" aria-live="polite">
			<strong>{N - oldCount} из {N}</strong> посетителей уже видят новый сервер, <strong>{oldCount}</strong> всё ещё старый. Дольше всех старый ответ может жить около <strong>{human(staleSeconds)}</strong>.
			{#if lowerHoursBefore * 3600 < oldTtl - lowerTo}Сначала уменьшите TTL и подождите хотя бы прежний срок: пока он не истёк, кэши держат длинный ответ.{:else}Кэши успели обновиться на короткий срок, и переезд проходит почти незаметно.{/if}
		</p>
		<p class="dg-out">Тёмные точки видят новый сервер, светлые ещё старый. Поэтому старый сервер не выключают сразу: он должен жить, пока не истечёт самый долгий кэш.</p>
	{:else}
		<p class="dg-out">Зона записана текстом: имя, TTL, тип, значение. Исправьте ошибки в примере или вставьте свою зону. Текст остаётся в этой странице.</p>
		<label class="area">Зона
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
