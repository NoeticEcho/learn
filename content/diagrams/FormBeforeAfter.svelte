<!--
	«Форма до и после» (part 10, lesson 4). The same request form twice: with the texts people
	usually leave in it, and rewritten. The person switches the moment (filling, error, sent) and
	taps any text to hear what was wrong with it or what was done. The button in the "after" form
	takes its label from the person's own brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Key = 'title' | 'name' | 'phone' | 'button' | 'consent' | 'error' | 'sent';
	type Phase = 'fill' | 'error' | 'sent';
	type Words = Record<Key, string | ((action: string) => string)>;

	const W = pick({
		ru: {
			defaultAction: 'Записать велосипед на ремонт',
			badPhone: '+7 900',
			before: {
				title: 'Форма обратной связи',
				name: 'ФИО *',
				phone: 'Телефон *',
				button: 'Отправить',
				consent: 'Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности',
				error: 'Ошибка 422: недопустимое значение поля phone',
				sent: 'Форма отправлена'
			} as Words,
			after: {
				title: (action: string) => `${action}: расскажите, что нужно`,
				name: 'Как к вам обращаться',
				phone: 'Телефон, например +7 900 000-00-00',
				button: (action: string) => action,
				consent: 'Согласен на обработку имени и телефона, чтобы со мной связались по заявке. Подробнее в политике',
				error: 'В номере не хватает цифр. Напишите телефон целиком, например +7 900 000-00-00.',
				sent: 'Заявка принята. Позвоним сегодня до 18:00. Не дозвонимся, напишем в мессенджер.'
			} as Words,
			notes: {
				before: {
					title: 'Заголовок называет вид формы, а не то, что человек получит. «Форма» это слово изнутри компании.',
					name: 'ФИО звучит как анкета, а звёздочка без пояснения ничего не говорит. И зачем ФИО целиком, если достаточно имени?',
					phone: 'Не сказано, зачем телефон и в каком виде его писать. Человек гадает, позвонят ли ему.',
					button: '«Отправить» не называет действия. Что именно человек делает: записывается, заказывает, пишет вопрос? К тому же в слове нет того, что будет дальше.',
					consent: 'Согласие вшито в кнопку, и оно не говорит, на что именно человек соглашается. Для закона и для людей это плохо: нужно отдельное, понятное действие.',
					error: 'Код и имя поля видны программисту, но не человеку. Что исправить, из текста не понять.',
					sent: 'Человек не знает, дошла ли заявка, что будет дальше и когда ему ответят.'
				},
				after: {
					title: 'Заголовок называет действие тем же словом, что кнопка и бриф. Человек сразу видит, куда попал.',
					name: 'Подпись как вопрос, на который легко ответить. Она стоит над полем и остаётся видна, когда человек печатает.',
					phone: 'Сразу показан формат. Ниже (в подсказке) нужно объяснить, зачем телефон: «Позвоним, чтобы назвать время».',
					button: 'Кнопка называет то самое действие, которое выбрано в брифе. Читается как продолжение фразы «Я хочу…».',
					consent: 'Согласие отдельная галочка (по умолчанию не отмечена), и сказано, на какие данные и зачем. Полный текст в политике.',
					error: 'Сказано, что не так («не хватает цифр»), что сделать («напишите целиком») и показан пример. Без вины и без кода.',
					sent: 'Заявка принята (значит, дошла), назван срок (сегодня до 18:00) и запасной путь, если не дозвонятся.'
				}
			} as Record<'before' | 'after', Record<Key, string>>,
			caption: 'Одна форма, два набора слов',
			which: 'Какой вариант',
			beforeBtn: 'До',
			afterBtn: 'После',
			moment: 'Какой момент',
			fill: 'Заполняют',
			error: 'Ошибка в телефоне',
			sent: 'Отправлено',
			tap: 'Нажмите на любой текст в форме: услышите, что с ним не так или что в нём сделано.'
		},
		en: {
			defaultAction: 'Book your bike in for repair',
			badPhone: '+1 555',
			before: {
				title: 'Contact form',
				name: 'Full name *',
				phone: 'Phone *',
				button: 'Submit',
				consent: 'By clicking this button you agree to the privacy notice',
				error: 'Error 422: invalid value for field phone',
				sent: 'Form submitted'
			} as Words,
			after: {
				title: (action: string) => `${action}: tell us what you need`,
				name: 'What should we call you',
				phone: 'Phone, for example +1 555 000 0000',
				button: (action: string) => action,
				consent: 'I agree to you using my name and phone number to contact me about this request. More in the privacy notice',
				error: 'The number is missing some digits. Write the whole number, for example +1 555 000 0000.',
				sent: 'Request received. We’ll call you today before 6 p.m. If we can’t reach you, we’ll send a text.'
			} as Words,
			notes: {
				before: {
					title: 'The headline names a kind of form, not what the person gets. “Form” is a word from inside the company.',
					name: '“Full name” sounds like paperwork, and an asterisk with no explanation says nothing. And why the whole name, when a first name would do?',
					phone: 'It doesn’t say why the phone number is wanted or how to write it. The person wonders whether they’ll be called.',
					button: '“Submit” doesn’t name an action. What is the person actually doing: booking, ordering, asking a question? And the word says nothing about what happens next.',
					consent: 'The consent is built into the button, and it doesn’t say what the person is agreeing to. That’s bad for the law and for people: consent should be a separate, clear act.',
					error: 'The code and the field name are visible to a programmer, not to the person. The text doesn’t tell them what to fix.',
					sent: 'The person doesn’t know whether the request arrived, what happens next, or when they’ll hear back.'
				},
				after: {
					title: 'The headline names the action in the same word as the button and the brief. The person sees at once where they are.',
					name: 'The label is a question that’s easy to answer. It stands above the field and stays visible while the person types.',
					phone: 'The format is shown at once. Below (in the hint) you should explain why the phone number is wanted: “We’ll call to give you a time”.',
					button: 'The button names the very action chosen in the brief. It reads as the end of the sentence “I want to…”.',
					consent: 'The consent is a separate checkbox (unchecked by default), and it says which data and why. The full text is in the notice.',
					error: 'It says what’s wrong (“missing some digits”), what to do (“write the whole number”) and shows an example. No blame and no code.',
					sent: 'The request is received (so it arrived), a time is given (today before 6 p.m.) and so is a fallback if they can’t reach the person.'
				}
			} as Record<'before' | 'after', Record<Key, string>>,
			caption: 'One form, two sets of words',
			which: 'Which version',
			beforeBtn: 'Before',
			afterBtn: 'After',
			moment: 'Which moment',
			fill: 'Filling in',
			error: 'Error in the phone',
			sent: 'Sent',
			tap: 'Tap any text in the form: you’ll hear what’s wrong with it or what was done.'
		}
	});

	let action = $state(W.defaultAction);
	onMount(async () => {
		try {
			action = (await (await import('#lib/learner.ts')).persona()).mainAction.label;
		} catch {
			/* the example stays */
		}
	});

	let view = $state<'before' | 'after'>('before');
	let phase = $state<Phase>('fill');
	let key = $state<Key | null>(null);

	const text = $derived(
		Object.fromEntries(Object.entries(W[view]).map(([k, v]) => [k, typeof v === 'function' ? v(action) : v])) as Record<Key, string>
	);
	const notes = W.notes;
	const choose = (k: Key) => (key = key === k ? null : k);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.which}>
		<button type="button" aria-pressed={view === 'before'} onclick={() => ((view = 'before'), (key = null))}>{W.beforeBtn}</button>
		<button type="button" aria-pressed={view === 'after'} onclick={() => ((view = 'after'), (key = null))}>{W.afterBtn}</button>
	</div>
	<div class="dg-ctl" role="group" aria-label={W.moment}>
		<button type="button" aria-pressed={phase === 'fill'} onclick={() => ((phase = 'fill'), (key = null))}>{W.fill}</button>
		<button type="button" aria-pressed={phase === 'error'} onclick={() => ((phase = 'error'), (key = null))}>{W.error}</button>
		<button type="button" aria-pressed={phase === 'sent'} onclick={() => ((phase = 'sent'), (key = null))}>{W.sent}</button>
	</div>

	<div class="form dg-box">
		{#if phase !== 'sent'}
			<button type="button" class="t h" class:on={key === 'title'} onclick={() => choose('title')}>{text.title}</button>
			<button type="button" class="t" class:on={key === 'name'} onclick={() => choose('name')}>{text.name}</button>
			<div class="field">&nbsp;</div>
			<button type="button" class="t" class:on={key === 'phone'} onclick={() => choose('phone')}>{text.phone}</button>
			<div class="field" class:bad={phase === 'error'}>{phase === 'error' ? W.badPhone : ''}&nbsp;</div>
			{#if phase === 'error'}
				<button type="button" class="t err" class:on={key === 'error'} onclick={() => choose('error')}>{text.error}</button>
			{/if}
			<button type="button" class="t small" class:on={key === 'consent'} onclick={() => choose('consent')}>
				{view === 'after' ? '☐ ' : ''}{text.consent}
			</button>
			<button type="button" class="t primary" class:on={key === 'button'} onclick={() => choose('button')}>{text.button}</button>
		{:else}
			<button type="button" class="t" class:on={key === 'sent'} onclick={() => choose('sent')}>{text.sent}</button>
		{/if}
	</div>

	<p class="dg-out" aria-live="polite">
		{#if key}{notes[view][key]}{:else}{W.tap}{/if}
	</p>
</figure>

<style>
	.form {
		display: grid;
		gap: var(--space-2);
		max-width: 28rem;
	}
	.t {
		text-align: left;
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		border: var(--line) dashed var(--border-hairline) !important;
		color: var(--text-body);
		height: auto;
	}
	.t.on {
		border-color: var(--accent-measure) !important;
		border-style: solid !important;
		color: var(--text-primary);
	}
	.h {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
	}
	.small {
		font-size: var(--text-body-sm);
	}
	.primary {
		justify-self: start;
		font-weight: var(--weight-medium);
	}
	.err {
		color: var(--text-primary);
	}
	.field {
		min-height: 2rem;
		border: var(--line) solid var(--border-rule);
		padding: 0 var(--space-3);
	}
	.field.bad {
		border-color: #d9534f;
	}
</style>
