<!--
	«Пока ждём ответ» (part 5, lesson 4). A request that takes three seconds, with a counter the
	person can keep pressing while it is in flight. In the normal mode the page stays alive; in the
	blocking mode the counter is frozen, to show what waiting without asynchronicity would feel
	like. The promise moves from pending to fulfilled or rejected, and the three outcomes
	(success, a 404 the server answered, a network failure) show why `response.ok` must be checked.
	No request is made: the timer stands in for the network.
-->
<script lang="ts">
	import './shared.css';
	import { onDestroy } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// The words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			vOk: 'Промис выполнен, response.ok равен true. Код после await читает данные и показывает их.',
			vNotFound: 'Промис всё равно выполнен: сервер ответил, пусть и кодом 404. Только проверка response.ok поймает беду, и дальше нужен throw, чтобы сработал catch.',
			vOffline: 'Промис отклонён: до сервера не достучались. Управление сразу уходит в блок catch.',
			caption: 'Пока идёт запрос, страница жива',
			endsWith: 'Чем закончится запрос',
			ok: 'успех, код 200',
			notfound: 'сервер ответил 404',
			offline: 'обрыв связи',
			blocking: '«блокирующий» режим (как без асинхронности)',
			send: 'Отправить запрос: ответ идёт 3 секунды',
			again: 'Сначала',
			page: 'Страница (основной поток)',
			press: 'Нажми меня',
			frozen: 'Страница не отвечает: скрипт ждёт ответа и ничего больше не делает.',
			free: 'Запрос ушёл. Страница свободна, нажимайте сколько хотите.',
			idle: 'Скрипт может заниматься своими делами.',
			network: 'Сеть и сервер',
			silence: 'тишина',
			waiting: (n: number) => `ждём ответа… ${n} из 3 с`,
			lost: 'связь оборвалась',
			r404: 'ответ 404',
			r200: 'ответ 200',
			promise: 'Промис',
			notYet: 'ещё не создан',
			choose: 'Выберите исход и отправьте запрос.'
		},
		en: {
			vOk: 'The promise is fulfilled and response.ok is true. The code after await reads the data and shows it.',
			vNotFound: 'The promise is fulfilled all the same: the server answered, even if with a 404. Only checking response.ok catches the trouble, and then you need a throw so that catch runs.',
			vOffline: 'The promise is rejected: the server could not be reached. Control goes straight to the catch block.',
			caption: 'While a request is under way, the page is alive',
			endsWith: 'How the request ends',
			ok: 'success, code 200',
			notfound: 'the server answered 404',
			offline: 'the connection dropped',
			blocking: 'blocking mode (as if there were no asynchrony)',
			send: 'Send the request: the answer takes 3 seconds',
			again: 'Start over',
			page: 'The page (main thread)',
			press: 'Press me',
			frozen: 'The page is not responding: the script is waiting for the answer and doing nothing else.',
			free: 'The request has gone. The page is free, press as much as you like.',
			idle: 'The script can get on with its own business.',
			network: 'Network and server',
			silence: 'silence',
			waiting: (n: number) => `waiting for the answer… ${n} of 3 s`,
			lost: 'the connection dropped',
			r404: 'answer 404',
			r200: 'answer 200',
			promise: 'Promise',
			notYet: 'not created yet',
			choose: 'Choose an outcome and send the request.'
		}
	});

	type Outcome = 'ok' | 'notfound' | 'offline';
	let outcome = $state<Outcome>('ok');
	let blocking = $state(false);
	let phase = $state<'idle' | 'pending' | 'done'>('idle');
	let clicks = $state(0);
	let seconds = $state(0);
	let timer: ReturnType<typeof setInterval> | undefined;
	let finished = $state<Outcome>('ok');

	const send = () => {
		if (phase === 'pending') return;
		phase = 'pending';
		seconds = 0;
		finished = outcome;
		clearInterval(timer);
		timer = setInterval(() => {
			seconds += 1;
			if (seconds >= 3) {
				clearInterval(timer);
				phase = 'done';
			}
		}, 1000);
	};
	const reset = () => {
		clearInterval(timer);
		phase = 'idle';
		clicks = 0;
		seconds = 0;
	};
	onDestroy(() => clearInterval(timer));

	const promise = $derived(phase === 'idle' ? '' : phase === 'pending' ? 'pending' : finished === 'offline' ? 'rejected' : 'fulfilled');
	const frozen = $derived(blocking && phase === 'pending');
	const verdict = $derived(
		phase !== 'done'
			? ''
			: finished === 'ok'
				? W.vOk
				: finished === 'notfound'
					? W.vNotFound
					: W.vOffline
	);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>{W.endsWith}
			<select bind:value={outcome} disabled={phase === 'pending'}>
				<option value="ok">{W.ok}</option>
				<option value="notfound">{W.notfound}</option>
				<option value="offline">{W.offline}</option>
			</select>
		</label>
		<label><input type="checkbox" bind:checked={blocking} disabled={phase === 'pending'} /> {W.blocking}</label>
	</div>
	<div class="dg-ctl">
		<button type="button" onclick={send} disabled={phase === 'pending'}>{W.send}</button>
		<button type="button" onclick={reset}>{W.again}</button>
	</div>

	<div class="lanes">
		<div class="dg-box">
			<div class="dh">{W.page}</div>
			<p>
				<button type="button" onclick={() => (clicks += 1)} disabled={frozen}>{W.press}: {clicks}</button>
			</p>
			<p class="hint" aria-live="polite">
				{#if frozen}{W.frozen}
				{:else if phase === 'pending'}{W.free}
				{:else}{W.idle}{/if}
			</p>
		</div>
		<div class="dg-box">
			<div class="dh">{W.network}</div>
			<p class="dg-mono">{phase === 'idle' ? W.silence : phase === 'pending' ? W.waiting(seconds) : finished === 'offline' ? W.lost : finished === 'notfound' ? W.r404 : W.r200}</p>
		</div>
		<div class="dg-box">
			<div class="dh">{W.promise}</div>
			<p class="dg-mono pill {promise}">{promise || W.notYet}</p>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">{verdict || W.choose}</p>
</figure>

<style>
	.lanes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--space-3);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	p {
		margin: 0 0 var(--space-2);
	}
	.hint {
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.pill {
		display: inline-block;
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
	}
	.pill.fulfilled {
		border-color: var(--accent-state-text);
		color: var(--accent-state-text);
	}
	.pill.rejected {
		border-color: var(--brass-300);
		color: var(--brass-300);
	}
</style>
