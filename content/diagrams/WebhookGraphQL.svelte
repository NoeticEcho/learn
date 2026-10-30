<!--
	Two small labs for part 6, lesson 6. In `graphql` mode the person ticks the fields a client asks
	for and sees the query and the answer, built from their own list, beside what a REST address
	that returns whole items would send (sizes counted, not drawn). In `webhook` mode a request
	body is signed with HMAC SHA-256 by the browser's own crypto (nothing leaves the page): the
	receiver recomputes the signature and accepts or rejects; one changed character is enough to
	break it. A second panel shows the redelivery after a failure, with and without remembering
	event ids. The retry schedule is illustrative: every service has its own.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	let { mode = 'graphql' }: { mode?: 'graphql' | 'webhook' } = $props();

	const W = pick({
		ru: {
			first: 'Первое предложение',
			firstText: 'Описание первого предложения.',
			second: 'Второе предложение',
			secondText: 'Описание второго предложения.',
			price: '0 000 ₽',
			name: 'Анна',
			phone: '+7 000 000-00-00',
			schedule: ['сразу', 'через 1 минуту', 'через 5 минут', 'через 30 минут'],
			caption: 'Клиент выбирает поля сам',
			legend: 'Какие поля нужны странице',
			queryLabel: 'Запрос GraphQL',
			answerLabel: 'Ответ GraphQL',
			queryHead: 'POST /graphql: запрос',
			answerHead: (n: number) => `Ответ: только выбранное (${n} байт)`,
			restAll: (n: number) => `REST по адресу GET /items отдал бы всё: ${n} байт.`,
			noGain: 'Вы выбрали все поля, и выигрыша нет.',
			saved: (pct: number) => `GraphQL сэкономил ${pct}% ответа: странице не нужны остальные поля.`,
			price_: ' Цена GraphQL: отдельный слой на сервере, сложнее кэширование и защита от слишком тяжёлых запросов.',
			whCaption: 'Подпись вебхука и повторная доставка',
			secretLabel: 'Общий секрет (знают только сервис и вы)',
			bodyLabel: 'Тело запроса (заявка, вымышленная)',
			tamper: 'по дороге в тело дописали один символ',
			service: 'Сервис',
			serviceHead: 'Сервис подписывает тело',
			receiver: 'Приёмник',
			receiverHead: 'Приёмник считает подпись по тому, что получил',
			expects: 'ожидает:  ',
			arrived: 'пришло:   ',
			okVerdict: '200: принято',
			badVerdict: '401: отклонено, подпись не сошлась',
			okWhy: 'Тело дошло без изменений, и отправитель знает секрет.',
			badWhy: 'Либо тело изменили, либо запрос прислал тот, кто секрета не знает.',
			lateHead: 'А если ответ не дошёл вовремя',
			lost: 'приёмник обработал событие, но ответ не дошёл вовремя',
			remembers: 'обработчик запоминает id событий',
			delivery: (when: string) => `Доставка ${when}`,
			processedRetry: ': событие обработано, но ответа сервис не дождался и повторит',
			finallyAnswered: ': наконец ответ получен',
			answeredAtOnce: ': ответ получен сразу',
			ownerGets: (n: number) => `Владелец получит сообщений: ${n}.`,
			deduped: 'Повторы того же события опознаются по id и игнорируются.',
			dupes: 'Без запоминания id каждая повторная доставка станет отдельной заявкой, а то и отдельным списанием денег.',
			noDupes: 'Пока всё доходит с первого раза, различия не видно, а дублей нет.',
			note: 'Расписание повторов условное: у каждого сервиса своё, обычно с нарастающими паузами на часы и сутки.'
		},
		en: {
			first: 'First offering',
			firstText: 'A description of the first offering.',
			second: 'Second offering',
			secondText: 'A description of the second offering.',
			price: '£0.00',
			name: 'Anna',
			phone: '+44 0000 000000',
			schedule: ['at once', 'after 1 minute', 'after 5 minutes', 'after 30 minutes'],
			caption: 'The client chooses the fields',
			legend: 'Which fields the page needs',
			queryLabel: 'GraphQL query',
			answerLabel: 'GraphQL response',
			queryHead: 'POST /graphql: the query',
			answerHead: (n: number) => `Response: only what was chosen (${n} bytes)`,
			restAll: (n: number) => `REST at GET /items would send everything: ${n} bytes.`,
			noGain: 'You chose every field, so there is no gain.',
			saved: (pct: number) => `GraphQL saved ${pct}% of the response: the page doesn’t need the other fields.`,
			price_: ' The price of GraphQL: a separate layer on the server, harder caching and protection against queries that are too heavy.',
			whCaption: 'A webhook signature and redelivery',
			secretLabel: 'Shared secret (known only to the service and you)',
			bodyLabel: 'Request body (an inquiry, made up)',
			tamper: 'one character was added to the body on the way',
			service: 'Service',
			serviceHead: 'The service signs the body',
			receiver: 'Receiver',
			receiverHead: 'The receiver computes the signature from what it got',
			expects: 'expects:  ',
			arrived: 'arrived:  ',
			okVerdict: '200: accepted',
			badVerdict: '401: rejected, the signature does not match',
			okWhy: 'The body arrived unchanged, and the sender knows the secret.',
			badWhy: 'Either the body was changed, or the request came from someone who does not know the secret.',
			lateHead: 'And if the response does not arrive in time',
			lost: 'the receiver processed the event, but its response did not arrive in time',
			remembers: 'the handler remembers event ids',
			delivery: (when: string) => `Delivery ${when}`,
			processedRetry: ': the event was processed, but the service got no response and will try again',
			finallyAnswered: ': a response at last',
			answeredAtOnce: ': a response at once',
			ownerGets: (n: number) => `Messages the owner receives: ${n}.`,
			deduped: 'A repeat of the same event is recognized by its id and ignored.',
			dupes: 'Without remembering ids, each repeated delivery becomes a separate inquiry, or even a separate charge.',
			noDupes: 'While everything arrives the first time, there is no visible difference, and no duplicates.',
			note: 'The retry schedule is made up: every service has its own, usually with growing pauses of hours and days.'
		}
	});

	// ----- GraphQL
	type Item = { title: string; text: string; price: string };
	let items = $state<Item[]>([
		{ title: W.first, text: W.firstText, price: W.price },
		{ title: W.second, text: W.secondText, price: '' }
	]);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.length) items = p.items.slice(0, 3).map((i) => ({ title: i.title, text: i.text, price: i.price ?? '' }));
		} catch {
			/* the example stays */
		}
	});
	const all = ['title', 'text', 'price'] as const;
	let want = $state<Record<(typeof all)[number], boolean>>({ title: true, text: false, price: true });
	const chosen = $derived(all.filter((f) => want[f]));
	const query = $derived(`{\n  items {\n${chosen.map((f) => `    ${f}`).join('\n')}\n  }\n}`);
	const picked = $derived(items.map((i) => Object.fromEntries(chosen.map((f) => [f, i[f]]))));
	const whole = $derived(JSON.stringify(items));
	const small = $derived(JSON.stringify({ data: { items: picked } }));
	const bytes = (s: string) => new TextEncoder().encode(s).length;

	// ----- webhook
	let secret = $state('demo-secret');
	let body = $state('{"id":"evt_1","type":"request.created","name":"' + W.name + '","phone":"' + W.phone + '"}');
	let tampered = $state(false);
	let sig = $state('');
	let received = $state('');
	const sent = $derived(tampered ? body.replace(/.$/, (c) => (c === '}' ? ' }' : c + 'x')) : body);
	async function hmac(key: string, msg: string): Promise<string> {
		const enc = new TextEncoder();
		const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
		const out = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
		return Array.from(new Uint8Array(out), (b) => b.toString(16).padStart(2, '0')).join('');
	}
	$effect(() => {
		const [k, b, s] = [secret, body, sent];
		let live = true;
		hmac(k, b).then((h) => live && (sig = h));
		hmac(k, s).then((h) => live && (received = h));
		return () => (live = false);
	});
	const accepted = $derived(sig !== '' && sig === received);

	let down = $state(true); // the answer is lost: the receiver did process the event
	let remember = $state(true);
	const schedule = W.schedule;
	const deliveries = $derived(down ? 4 : 1);
	// when the receiver is slow rather than down, the same event arrives more than once
	const owner = $derived(remember ? 1 : deliveries > 1 ? deliveries : 1);
</script>

{#if mode === 'graphql'}
	<figure class="dg">
		<figcaption>{W.caption}</figcaption>
		<fieldset class="fields">
			<legend>{W.legend}</legend>
			{#each all as f (f)}<label class="dg-mono"><input type="checkbox" bind:checked={want[f]} /> {f}</label>{/each}
		</fieldset>
		<div class="two">
			<section aria-label={W.queryLabel}>
				<div class="dh">{W.queryHead}</div>
				<pre class="dg-box dg-mono">{query}</pre>
			</section>
			<section aria-label={W.answerLabel} aria-live="polite">
				<div class="dh">{W.answerHead(bytes(small))}</div>
				<pre class="dg-box dg-mono">{JSON.stringify({ data: { items: picked } }, null, 1)}</pre>
			</section>
		</div>
		<p class="dg-out"><strong>{W.restAll(bytes(whole))}</strong> {chosen.length === 3 ? W.noGain : W.saved(Math.round((1 - bytes(small) / bytes(whole)) * 100))}{W.price_}</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>{W.whCaption}</figcaption>
		<div class="two">
			<label class="col">{W.secretLabel}
				<input class="dg-mono" type="text" bind:value={secret} spellcheck="false" autocomplete="off" />
			</label>
			<label class="col">{W.bodyLabel}
				<textarea class="dg-mono" rows="3" bind:value={body} spellcheck="false"></textarea>
			</label>
		</div>
		<label class="chk"><input type="checkbox" bind:checked={tampered} /> {W.tamper}</label>
		<div class="two">
			<section aria-label={W.service}>
				<div class="dh">{W.serviceHead}</div>
				<pre class="dg-box dg-mono">X-Signature: {sig.slice(0, 32)}…</pre>
			</section>
			<section aria-label={W.receiver} aria-live="polite">
				<div class="dh">{W.receiverHead}</div>
				<pre class="dg-box dg-mono">{W.expects}{received.slice(0, 32)}…
{W.arrived}{sig.slice(0, 32)}…</pre>
				<p class="verdict" class:bad={!accepted}><strong>{accepted ? W.okVerdict : W.badVerdict}.</strong> {accepted ? W.okWhy : W.badWhy}</p>
			</section>
		</div>

		<div class="dh spaced">{W.lateHead}</div>
		<div class="dg-ctl">
			<label><input type="checkbox" bind:checked={down} /> {W.lost}</label>
			<label><input type="checkbox" bind:checked={remember} /> {W.remembers}</label>
		</div>
		<ol class="sched dg-box">
			{#each schedule.slice(0, deliveries) as s, i (i)}<li>{W.delivery(s)}{i < deliveries - 1 ? W.processedRetry : down ? W.finallyAnswered : W.answeredAtOnce}</li>{/each}
		</ol>
		<p class="dg-out" aria-live="polite"><strong>{W.ownerGets(owner)}</strong> {remember ? W.deduped : deliveries > 1 ? W.dupes : W.noDupes}</p>
		<p class="note">{W.note}</p>
	</figure>
{/if}

<style>
	.fields {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin: 0 0 var(--space-3);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	legend {
		padding: 0 var(--space-2);
		color: var(--text-secondary);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.dh.spaced {
		margin-top: var(--space-4);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 0.82rem;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.col input,
	.col textarea {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-size: 0.85rem;
	}
	.chk {
		margin-bottom: var(--space-3);
	}
	.verdict {
		margin: var(--space-2) 0 0;
	}
	.verdict.bad {
		color: var(--brass-300);
	}
	.sched {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-6);
	}
	.note {
		margin: var(--space-2) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
</style>
