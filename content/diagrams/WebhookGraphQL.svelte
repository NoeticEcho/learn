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

	let { mode = 'graphql' }: { mode?: 'graphql' | 'webhook' } = $props();

	// ----- GraphQL
	type Item = { title: string; text: string; price: string };
	let items = $state<Item[]>([
		{ title: 'Первое предложение', text: 'Описание первого предложения.', price: '0 000 ₽' },
		{ title: 'Второе предложение', text: 'Описание второго предложения.', price: '' }
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
	let body = $state('{"id":"evt_1","type":"request.created","name":"Анна","phone":"+7 000 000-00-00"}');
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
	const schedule = ['сразу', 'через 1 минуту', 'через 5 минут', 'через 30 минут'];
	const deliveries = $derived(down ? 4 : 1);
	// when the receiver is slow rather than down, the same event arrives more than once
	const owner = $derived(remember ? 1 : deliveries > 1 ? deliveries : 1);
</script>

{#if mode === 'graphql'}
	<figure class="dg">
		<figcaption>Клиент выбирает поля сам</figcaption>
		<fieldset class="fields">
			<legend>Какие поля нужны странице</legend>
			{#each all as f (f)}<label class="dg-mono"><input type="checkbox" bind:checked={want[f]} /> {f}</label>{/each}
		</fieldset>
		<div class="two">
			<section aria-label="Запрос GraphQL">
				<div class="dh">POST /graphql: запрос</div>
				<pre class="dg-box dg-mono">{query}</pre>
			</section>
			<section aria-label="Ответ GraphQL" aria-live="polite">
				<div class="dh">Ответ: только выбранное ({bytes(small)} байт)</div>
				<pre class="dg-box dg-mono">{JSON.stringify({ data: { items: picked } }, null, 1)}</pre>
			</section>
		</div>
		<p class="dg-out"><strong>REST по адресу GET /items отдал бы всё: {bytes(whole)} байт.</strong> {chosen.length === 3 ? 'Вы выбрали все поля, и выигрыша нет.' : `GraphQL сэкономил ${Math.round((1 - bytes(small) / bytes(whole)) * 100)}% ответа: странице не нужны остальные поля.`} Цена GraphQL: отдельный слой на сервере, сложнее кэширование и защита от слишком тяжёлых запросов.</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>Подпись вебхука и повторная доставка</figcaption>
		<div class="two">
			<label class="col">Общий секрет (знают только сервис и вы)
				<input class="dg-mono" type="text" bind:value={secret} spellcheck="false" autocomplete="off" />
			</label>
			<label class="col">Тело запроса (заявка, вымышленная)
				<textarea class="dg-mono" rows="3" bind:value={body} spellcheck="false"></textarea>
			</label>
		</div>
		<label class="chk"><input type="checkbox" bind:checked={tampered} /> по дороге в тело дописали один символ</label>
		<div class="two">
			<section aria-label="Сервис">
				<div class="dh">Сервис подписывает тело</div>
				<pre class="dg-box dg-mono">X-Signature: {sig.slice(0, 32)}…</pre>
			</section>
			<section aria-label="Приёмник" aria-live="polite">
				<div class="dh">Приёмник считает подпись по тому, что получил</div>
				<pre class="dg-box dg-mono">ожидает:  {received.slice(0, 32)}…
пришло:   {sig.slice(0, 32)}…</pre>
				<p class="verdict" class:bad={!accepted}><strong>{accepted ? '200: принято' : '401: отклонено, подпись не сошлась'}.</strong> {accepted ? 'Тело дошло без изменений, и отправитель знает секрет.' : 'Либо тело изменили, либо запрос прислал тот, кто секрета не знает.'}</p>
			</section>
		</div>

		<div class="dh spaced">А если ответ не дошёл вовремя</div>
		<div class="dg-ctl">
			<label><input type="checkbox" bind:checked={down} /> приёмник обработал событие, но ответ не дошёл вовремя</label>
			<label><input type="checkbox" bind:checked={remember} /> обработчик запоминает id событий</label>
		</div>
		<ol class="sched dg-box">
			{#each schedule.slice(0, deliveries) as s, i (i)}<li>Доставка {s}{i < deliveries - 1 ? ': событие обработано, но ответа сервис не дождался и повторит' : down ? ': наконец ответ получен' : ': ответ получен сразу'}</li>{/each}
		</ol>
		<p class="dg-out" aria-live="polite"><strong>Владелец получит сообщений: {owner}.</strong> {remember ? 'Повторы того же события опознаются по id и игнорируются.' : deliveries > 1 ? 'Без запоминания id каждая повторная доставка станет отдельной заявкой, а то и отдельным списанием денег.' : 'Пока всё доходит с первого раза, различия не видно, а дублей нет.'}</p>
		<p class="note">Расписание повторов условное: у каждого сервиса своё, обычно с нарастающими паузами на часы и сутки.</p>
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
