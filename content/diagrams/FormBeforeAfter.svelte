<!--
	«Форма до и после» (part 10, lesson 4). The same request form twice: with the texts people
	usually leave in it, and rewritten. The person switches the moment (filling, error, sent) and
	taps any text to hear what was wrong with it or what was done. The button in the "after" form
	takes its label from the person's own brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type Key = 'title' | 'name' | 'phone' | 'button' | 'consent' | 'error' | 'sent';
	type Phase = 'fill' | 'error' | 'sent';

	let action = $state('Записать велосипед на ремонт');
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

	const text = $derived({
		before: {
			title: 'Форма обратной связи',
			name: 'ФИО *',
			phone: 'Телефон *',
			button: 'Отправить',
			consent: 'Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности',
			error: 'Ошибка 422: недопустимое значение поля phone',
			sent: 'Форма отправлена'
		},
		after: {
			title: `${action}: расскажите, что нужно`,
			name: 'Как к вам обращаться',
			phone: 'Телефон, например +7 900 000-00-00',
			button: action,
			consent: 'Согласен на обработку имени и телефона, чтобы со мной связались по заявке. Подробнее в политике',
			error: 'В номере не хватает цифр. Напишите телефон целиком, например +7 900 000-00-00.',
			sent: 'Заявка принята. Позвоним сегодня до 18:00. Не дозвонимся, напишем в мессенджер.'
		}
	}[view]);

	const notes: Record<'before' | 'after', Record<Key, string>> = {
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
	};
	const pick = (k: Key) => (key = key === k ? null : k);
</script>

<figure class="dg">
	<figcaption>Одна форма, два набора слов</figcaption>
	<div class="dg-ctl" role="group" aria-label="Какой вариант">
		<button type="button" aria-pressed={view === 'before'} onclick={() => ((view = 'before'), (key = null))}>До</button>
		<button type="button" aria-pressed={view === 'after'} onclick={() => ((view = 'after'), (key = null))}>После</button>
	</div>
	<div class="dg-ctl" role="group" aria-label="Какой момент">
		<button type="button" aria-pressed={phase === 'fill'} onclick={() => ((phase = 'fill'), (key = null))}>Заполняют</button>
		<button type="button" aria-pressed={phase === 'error'} onclick={() => ((phase = 'error'), (key = null))}>Ошибка в телефоне</button>
		<button type="button" aria-pressed={phase === 'sent'} onclick={() => ((phase = 'sent'), (key = null))}>Отправлено</button>
	</div>

	<div class="form dg-box">
		{#if phase !== 'sent'}
			<button type="button" class="t h" class:on={key === 'title'} onclick={() => pick('title')}>{text.title}</button>
			<button type="button" class="t" class:on={key === 'name'} onclick={() => pick('name')}>{text.name}</button>
			<div class="field">&nbsp;</div>
			<button type="button" class="t" class:on={key === 'phone'} onclick={() => pick('phone')}>{text.phone}</button>
			<div class="field" class:bad={phase === 'error'}>{phase === 'error' ? '+7 900' : ''}&nbsp;</div>
			{#if phase === 'error'}
				<button type="button" class="t err" class:on={key === 'error'} onclick={() => pick('error')}>{text.error}</button>
			{/if}
			<button type="button" class="t small" class:on={key === 'consent'} onclick={() => pick('consent')}>
				{view === 'after' ? '☐ ' : ''}{text.consent}
			</button>
			<button type="button" class="t primary" class:on={key === 'button'} onclick={() => pick('button')}>{text.button}</button>
		{:else}
			<button type="button" class="t" class:on={key === 'sent'} onclick={() => pick('sent')}>{text.sent}</button>
		{/if}
	</div>

	<p class="dg-out" aria-live="polite">
		{#if key}{notes[view][key]}{:else}Нажмите на любой текст в форме: услышите, что с ним не так или что в нём сделано.{/if}
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
