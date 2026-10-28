<!--
	«Ошибка в форме: два способа» (part 4, lesson 8). The same two-field form, sent empty. In one
	version an error only turns a border red (it gives the person nothing to act on and nothing for
	a screen reader to say). In the other the form follows the pattern the GOV.UK Design System
	documents: a summary at the top that takes focus and links to each field, and a message beside
	each field that starts with the word «Ошибка».
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			caption: 'Отправьте форму пустой и сравните два способа показать ошибку',
			modes: 'Способ показа ошибки',
			gov: 'Сводка и сообщения (как у GOV.UK)',
			border: 'Только красная рамка',
			form: 'Пример формы',
			problem: 'Есть ошибки',
			sumName: 'Укажите, как к вам обращаться',
			sumMail: 'Введите адрес почты, например name@example.ru',
			name: 'Как к вам обращаться',
			nameHint: 'Достаточно имени',
			nameErr: 'Ошибка: укажите, как к вам обращаться',
			mail: 'Адрес почты',
			mailErr: 'Ошибка: введите адрес почты, например name@example.ru',
			send: 'Отправить',
			clear: 'Очистить',
			start: 'Нажмите «Отправить» с пустыми полями.',
			govOut: 'Фокус перешёл на сводку, а ссылки в ней ведут к полям. Рядом с каждым полем сообщение со словом «Ошибка», так что смысл не держится на цвете.',
			borderOut: 'Поля покраснели, а больше ничего не изменилось: человек не знает, что именно не так, а экранный диктор вообще не заметил ошибки. Это самый частый способ показать ошибку, и самый плохой.'
		},
		en: {
			caption: 'Send the form empty and compare two ways of showing an error',
			modes: 'How the error is shown',
			gov: 'A summary and messages (as in GOV.UK)',
			border: 'A red border only',
			form: 'An example form',
			problem: 'There is a problem',
			sumName: 'Enter your name',
			sumMail: 'Enter your email address, for example name@example.com',
			name: 'Your name',
			nameHint: 'A first name is enough',
			nameErr: 'Error: enter your name',
			mail: 'Email address',
			mailErr: 'Error: enter your email address, for example name@example.com',
			send: 'Send',
			clear: 'Clear',
			start: 'Press “Send” with the fields empty.',
			govOut: 'Focus moved to the summary, and its links lead to the fields. Beside each field is a message with the word “Error”, so the meaning doesn’t rest on color.',
			borderOut: 'The fields turned red and nothing else changed: the person doesn’t know what exactly is wrong, and a screen reader didn’t notice the error at all. This is the most common way to show an error, and the worst.'
		}
	});

	let mode = $state<'gov' | 'border'>('gov');
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
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.modes}>
		<button type="button" aria-pressed={mode === 'gov'} onclick={() => ((mode = 'gov'), reset())}>{W.gov}</button>
		<button type="button" aria-pressed={mode === 'border'} onclick={() => ((mode = 'border'), reset())}>{W.border}</button>
	</div>

	<form class="form" novalidate onsubmit={submit} aria-label={W.form}>
		{#if sent && mode === 'gov'}
			<div class="summary" role="alert" tabindex="-1" bind:this={summary}>
				<div class="dh">{W.problem}</div>
				<ul>
					<li><a href="#fp-name" onclick={(e) => go('fp-name', e)}>{W.sumName}</a></li>
					<li><a href="#fp-mail" onclick={(e) => go('fp-mail', e)}>{W.sumMail}</a></li>
				</ul>
			</div>
		{/if}
		<div class="field">
			<label for="fp-name">{W.name}</label>
			<p class="hint" id="fp-name-hint">{W.nameHint}</p>
			{#if sent && mode === 'gov'}<p class="err" id="fp-name-err">{W.nameErr}</p>{/if}
			<input id="fp-name" class:bad={sent} autocomplete="name" aria-describedby={sent && mode === 'gov' ? 'fp-name-hint fp-name-err' : 'fp-name-hint'} />
		</div>
		<div class="field">
			<label for="fp-mail">{W.mail}</label>
			{#if sent && mode === 'gov'}<p class="err" id="fp-mail-err">{W.mailErr}</p>{/if}
			<input id="fp-mail" type="email" class:bad={sent} autocomplete="email" aria-describedby={sent && mode === 'gov' ? 'fp-mail-err' : undefined} />
		</div>
		<div class="dg-ctl" style="margin:0">
			<button type="submit">{W.send}</button>
			<button type="button" onclick={reset}>{W.clear}</button>
		</div>
	</form>

	<p class="dg-out" aria-live="polite">
		{#if !sent}
			{W.start}
		{:else if mode === 'gov'}
			{W.govOut}
		{:else}
			{W.borderOut}
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
	.summary .dh {
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
