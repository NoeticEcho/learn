<!--
	«Ошибка в форме: два способа» (part 4, lesson 8). The same two-field form, sent empty. In one
	version an error only turns a border red (it gives the person nothing to act on and nothing for
	a screen reader to say). In the other the form follows the pattern the GOV.UK Design System
	documents: a summary at the top that takes focus and links to each field, and a message beside
	each field that starts with the word «Ошибка».
-->
<script lang="ts">
	import './shared.css';

	let mode = $state<'gov' | 'colour'>('gov');
	let sent = $state(false);
	let summary = $state<HTMLElement | null>(null);

	async function submit(e: Event) {
		e.preventDefault();
		sent = true;
		if (mode === 'gov') {
			await Promise.resolve();
			setTimeout(() => summary?.focus(), 0);
		}
	}
	function reset() {
		sent = false;
	}
	function go(id: string, e: Event) {
		e.preventDefault();
		document.getElementById(id)?.focus();
	}
</script>

<figure class="dg">
	<figcaption>Отправьте форму пустой и сравните два способа показать ошибку</figcaption>
	<div class="dg-ctl" role="group" aria-label="Способ показа ошибки">
		<button type="button" aria-pressed={mode === 'gov'} onclick={() => ((mode = 'gov'), reset())}>Сводка и сообщения (как у GOV.UK)</button>
		<button type="button" aria-pressed={mode === 'colour'} onclick={() => ((mode = 'colour'), reset())}>Только красная рамка</button>
	</div>

	<form class="form" novalidate onsubmit={submit} aria-label="Пример формы">
		{#if sent && mode === 'gov'}
			<div class="summary" role="alert" tabindex="-1" bind:this={summary}>
				<h4>Есть ошибки</h4>
				<ul>
					<li><a href="#fp-name" onclick={(e) => go('fp-name', e)}>Укажите, как к вам обращаться</a></li>
					<li><a href="#fp-mail" onclick={(e) => go('fp-mail', e)}>Введите адрес почты, например name@example.ru</a></li>
				</ul>
			</div>
		{/if}
		<div class="field">
			<label for="fp-name">Как к вам обращаться</label>
			<p class="hint" id="fp-name-hint">Достаточно имени</p>
			{#if sent && mode === 'gov'}<p class="err" id="fp-name-err">Ошибка: укажите, как к вам обращаться</p>{/if}
			<input id="fp-name" class:bad={sent} autocomplete="name" aria-describedby={sent && mode === 'gov' ? 'fp-name-hint fp-name-err' : 'fp-name-hint'} />
		</div>
		<div class="field">
			<label for="fp-mail">Адрес почты</label>
			{#if sent && mode === 'gov'}<p class="err" id="fp-mail-err">Ошибка: введите адрес почты, например name@example.ru</p>{/if}
			<input id="fp-mail" type="email" class:bad={sent} autocomplete="email" aria-describedby={sent && mode === 'gov' ? 'fp-mail-err' : undefined} />
		</div>
		<div class="dg-ctl" style="margin:0">
			<button type="submit">Отправить</button>
			<button type="button" onclick={reset}>Очистить</button>
		</div>
	</form>

	<p class="dg-out" aria-live="polite">
		{#if !sent}
			Нажмите «Отправить» с пустыми полями.
		{:else if mode === 'gov'}
			Фокус перешёл на сводку, а ссылки в ней ведут к полям. Рядом с каждым полем сообщение со словом «Ошибка», так что смысл не держится на цвете.
		{:else}
			Поля покраснели, а больше ничего не изменилось: человек не знает, что именно не так, а экранный диктор вообще не заметил ошибки. Это самый частый способ
			показать ошибку, и самый плохой.
		{/if}
	</p>
</figure>

<style>
	.form {
		display: grid;
		gap: var(--space-4);
		max-width: 28rem;
		padding: var(--space-4);
		background: #faf9f7;
		color: #1c1b19;
		font-family: system-ui, sans-serif;
	}
	label {
		font-weight: 600;
	}
	.hint {
		margin: 2px 0 6px;
		color: #4a4742;
		font-size: 0.9rem;
	}
	.err {
		margin: 2px 0 6px;
		color: #a31515;
		font-weight: 600;
	}
	input {
		display: block;
		width: 100%;
		min-height: 2.75rem;
		padding: 0 0.6rem;
		border: 2px solid #1c1b19;
		background: #fff;
		color: #1c1b19;
		font: inherit;
		box-sizing: border-box;
	}
	input:focus {
		outline: 3px solid #ffdd00;
		outline-offset: 0;
	}
	input.bad {
		border-color: #a31515;
	}
	.summary {
		padding: var(--space-3);
		border: 4px solid #a31515;
	}
	.summary h4 {
		margin: 0 0 var(--space-2);
		color: #a31515;
	}
	.summary ul {
		margin: 0;
		padding-left: 1.2rem !important;
	}
	.summary a {
		color: #a31515;
		font-weight: 600;
	}
	.summary:focus {
		outline: 3px solid #ffdd00;
	}
	.form button {
		background: #0b5cad;
		color: #fff;
		border: 0;
		min-height: 2.75rem;
		padding: 0 1.2rem;
		font-weight: 600;
		cursor: pointer;
	}
	.form button[type='button'] {
		background: transparent;
		color: #1c1b19;
		border: 2px solid #1c1b19;
	}
</style>
