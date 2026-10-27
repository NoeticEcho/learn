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
				? 'Промис выполнен, response.ok равен true. Код после await читает данные и показывает их.'
				: finished === 'notfound'
					? 'Промис всё равно выполнен: сервер ответил, пусть и кодом 404. Только проверка response.ok поймает беду, и дальше нужен throw, чтобы сработал catch.'
					: 'Промис отклонён: до сервера не достучались. Управление сразу уходит в блок catch.'
	);
</script>

<figure class="dg">
	<figcaption>Пока идёт запрос, страница жива</figcaption>
	<div class="dg-ctl">
		<label>Чем закончится запрос
			<select bind:value={outcome} disabled={phase === 'pending'}>
				<option value="ok">успех, код 200</option>
				<option value="notfound">сервер ответил 404</option>
				<option value="offline">обрыв связи</option>
			</select>
		</label>
		<label><input type="checkbox" bind:checked={blocking} disabled={phase === 'pending'} /> «блокирующий» режим (как без асинхронности)</label>
	</div>
	<div class="dg-ctl">
		<button type="button" onclick={send} disabled={phase === 'pending'}>Отправить запрос: ответ идёт 3 секунды</button>
		<button type="button" onclick={reset}>Сначала</button>
	</div>

	<div class="lanes">
		<div class="dg-box">
			<h4>Страница (основной поток)</h4>
			<p>
				<button type="button" onclick={() => (clicks += 1)} disabled={frozen}>Нажми меня: {clicks}</button>
			</p>
			<p class="hint" aria-live="polite">
				{#if frozen}Страница не отвечает: скрипт ждёт ответа и ничего больше не делает.
				{:else if phase === 'pending'}Запрос ушёл. Страница свободна, нажимайте сколько хотите.
				{:else}Скрипт может заниматься своими делами.{/if}
			</p>
		</div>
		<div class="dg-box">
			<h4>Сеть и сервер</h4>
			<p class="dg-mono">{phase === 'idle' ? 'тишина' : phase === 'pending' ? `ждём ответа… ${seconds} из 3 с` : finished === 'offline' ? 'связь оборвалась' : finished === 'notfound' ? 'ответ 404' : 'ответ 200'}</p>
		</div>
		<div class="dg-box">
			<h4>Промис</h4>
			<p class="dg-mono pill {promise}">{promise || 'ещё не создан'}</p>
		</div>
	</div>
	<p class="dg-out" aria-live="polite">{verdict || 'Выберите исход и отправьте запрос.'}</p>
</figure>

<style>
	.lanes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--space-3);
	}
	h4 {
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
