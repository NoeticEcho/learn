<!--
	«Интервью с Искином» (part 16, lesson 7). Искин is the course's name for a builder that does not
	wait for a prompt but asks: one question for each field of the brief, one at a time. The person
	answers (their own brief fills the answers in, to edit, or they say «не знаю»), and the page
	shows what an interviewer would do with the answers: the brief filling up, what is still empty,
	the structure of the site, the parts of the service that the main action needs (a form and a
	receiver, a booking, an order), and what is NOT decided for the person: facts, legal texts,
	payments, publishing. A SCRIPTED demonstration: the questions are written in advance and no
	model runs; the page says so. Everything stays in the browser.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Q = { id: string; ask: string; why: string };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// A SCRIPTED demonstration in both: the questions are written in advance and no model runs.
	const W = pick({
		ru: {
			qs: [
				{ id: 'who', ask: 'Чем вы занимаетесь, одной-двумя фразами?', why: 'Из этого получится заголовок и первый абзац. Без вашей сути Искин напишет лозунг.' },
				{ id: 'forWhom', ask: 'Для кого это? Кто к вам приходит?', why: 'От аудитории зависят слова, порядок разделов и уровень подробностей.' },
				{ id: 'action', ask: 'Что должен сделать посетитель, чтобы сайт сработал?', why: 'Это главное действие: одна кнопка, вокруг которой строится страница.' },
				{ id: 'sections', ask: 'Какие разделы нужны? Перечислите через точку с запятой.', why: 'Разделы станут структурой и меню. Лишних Искин не добавляет.' },
				{ id: 'items', ask: 'Что вы предлагаете: услуги, товары, программы?', why: 'Это содержание карточек. Придумывать предложения за вас нельзя.' },
				{ id: 'proofs', ask: 'Чем вы можете подтвердить сказанное: документы, работы, членство?', why: 'Подтверждения берутся только отсюда. Если их нет, блока не будет.' },
				{ id: 'contacts', ask: 'Как с вами связаться и что нельзя публиковать?', why: 'Контакты и запреты решаете вы. Искин не публикует личное без вашего слова.' },
				{ id: 'tone', ask: 'Каким голосом вы говорите? Приведите две свои фразы.', why: 'Две настоящие фразы точнее любого прилагательного.' }
			] as Q[],
			unknown: 'не знаю',
			contacts: 'Телефон и почту не показывать на странице, только форма. Город можно.',
			book: ['Форма записи с выбором времени', 'Календарь, который не даст записать на занятое', 'Письмо вам о новой записи и письмо посетителю с подтверждением'],
			buy: ['Каталог из ваших предложений', 'Заказ и оплата через готовый платёжный сервис (деньги сами Искин не принимает)', 'Уведомление вам о каждом заказе'],
			call: ['Кнопка звонка с вашим номером', 'Форма «перезвоните мне» как запасной путь'],
			form: ['Форма заявки с согласием на обработку данных', 'Приёмник заявок в российской базе', 'Уведомление вам о новой заявке'],
			bookRe: /запис|консульт|встреч|приём|прием/,
			buyRe: /куп|заказ|оплат|корзин/,
			callRe: /звон|позвон/,
			caption: 'Искин спрашивает, а не ждёт запроса',
			demo: 'Это показ работы.',
			demoText: 'Вопросы написаны заранее, модель не запускается: страница показывает, что интервьюер сделал бы с вашими ответами. Бриф подставлен ваш, его можно править.',
			question: 'Вопрос',
			of: 'из',
			why: 'Зачем:',
			answer: 'Ваш ответ',
			nextBtn: 'Дальше',
			buildBtn: 'Собрать сайт и сервис',
			dontKnow: 'Не знаю',
			back: 'Назад',
			filled: 'Бриф заполнен на',
			empty: ' Пока пусто: ',
			after: 'Бриф после интервью:',
			fields: 'полей',
			missing: 'Не заполнено:',
			missingText: 'Искин ничего не выдумает: на этих местах будут пустые блоки с пометкой для вас, и на странице их не будет.',
			allFilled: 'Все поля заполнены.',
			structure: 'Структура сайта',
			noSections: 'Разделов нет: Искин спросит ещё раз.',
			service: 'Сервис для действия',
			qo: '«',
			qc: '»',
			leaves: 'Что Искин оставляет вам',
			leave: ['Каждое утверждение и цифра: он берёт их только из ответов и подтверждений.', 'Политика обработки данных и согласие: текст согласуете вы с юристом.', 'Деньги: оплату подключаете вы, через готовый сервис.', 'Публикация: решение «выкладывать» принимаете вы после проверки.'],
			again: 'Пройти ещё раз'
		},
		en: {
			qs: [
				{ id: 'who', ask: 'What do you do, in a sentence or two?', why: 'From this come the heading and the first paragraph. Without your substance, Iskin will write a slogan.' },
				{ id: 'forWhom', ask: 'Who is it for? Who comes to you?', why: 'The audience decides the words, the order of the sections and the level of detail.' },
				{ id: 'action', ask: 'What must a visitor do for the site to work?', why: 'This is the main action: one button the page is built around.' },
				{ id: 'sections', ask: 'Which sections are needed? List them separated by semicolons.', why: 'The sections become the structure and the menu. Iskin adds no extra ones.' },
				{ id: 'items', ask: 'What do you offer: services, goods, programs?', why: 'This is the content of the cards. Offers can’t be made up for you.' },
				{ id: 'proofs', ask: 'What can you back it up with: documents, work, memberships?', why: 'Proof is taken only from here. If there is none, there will be no block.' },
				{ id: 'contacts', ask: 'How can people reach you, and what must not be published?', why: 'Contacts and prohibitions are for you to decide. Iskin publishes nothing personal without your word.' },
				{ id: 'tone', ask: 'What is your voice like? Give two sentences of your own.', why: 'Two real sentences are more exact than any adjective.' }
			] as Q[],
			unknown: 'I don’t know',
			contacts: 'Don’t show the phone number and email on the page, only the form. The city is fine.',
			book: ['A booking form with a choice of time', 'A calendar that won’t let a taken slot be booked', 'An email to you about a new booking and a confirmation email to the visitor'],
			buy: ['A catalog of your offers', 'Ordering and payment through a ready-made payment service (Iskin doesn’t take money itself)', 'A notice to you about every order'],
			call: ['A call button with your number', 'A “call me back” form as a fallback'],
			form: ['A request form with a link to the privacy policy and, where consent is the basis, a consent box', 'A receiver of requests in a database in a region you chose', 'A notice to you of a new request'],
			bookRe: /book|appointment|consult|meeting|schedule|reserve|table/,
			buyRe: /buy|order|pay|cart|ticket/,
			callRe: /call|phone/,
			caption: 'Iskin asks, and doesn’t wait for a prompt',
			demo: 'This is a demonstration.',
			demoText: 'The questions are written in advance and no model runs: the page shows what an interviewer would do with your answers. Your own brief is filled in, and you can edit it.',
			question: 'Question',
			of: 'of',
			why: 'Why:',
			answer: 'Your answer',
			nextBtn: 'Next',
			buildBtn: 'Build the site and the service',
			dontKnow: 'I don’t know',
			back: 'Back',
			filled: 'The brief is filled in:',
			empty: ' Still empty: ',
			after: 'The brief after the interview:',
			fields: 'fields',
			missing: 'Not filled in:',
			missingText: 'Iskin won’t make anything up: in these places there will be empty blocks with a note for you, and they will not be on the page.',
			allFilled: 'All the fields are filled in.',
			structure: 'The structure of the site',
			noSections: 'There are no sections: Iskin will ask again.',
			service: 'The service for the action',
			qo: '“',
			qc: '”',
			leaves: 'What Iskin leaves to you',
			leave: ['Every claim and number: it takes them only from your answers and proof.', 'The privacy policy and consent: you agree the text with an attorney.', 'Money: you connect payment, through a ready-made service.', 'Publishing: you make the decision to “go live” after the check.'],
			again: 'Go through it again'
		}
	});

	const qs = W.qs;
	let answers = $state<Record<string, string>>({});
	let step = $state(0);
	let built = $state(false);
	let kind = $state('form');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			kind = p.mainAction?.kind ?? kind;
			answers = {
				who: p.who ?? '',
				forWhom: p.forWhom ?? '',
				action: p.mainAction?.label ?? '',
				sections: (p.sections ?? []).join('; '),
				items: (p.items ?? []).map((i) => i.title).join('; '),
				proofs: (p.proofs ?? []).map((i) => i.title).join('; '),
				contacts: W.contacts,
				tone: ''
			};
		} catch {
			/* the example stays */
		}
	});

	const q = $derived(qs[Math.min(step, qs.length - 1)]);
	const unknown = (id: string) => answers[id] === W.unknown;
	const filled = (id: string) => !!answers[id]?.trim() && !unknown(id);
	const count = $derived(qs.filter((x) => filled(x.id)).length);
	const missing = $derived(qs.filter((x) => !filled(x.id)));
	const sections = $derived((answers.sections ?? '').split(/[;\n]+/).map((s) => s.trim()).filter(Boolean));
	const service = $derived.by(() => {
		const a = (answers.action ?? '').toLowerCase();
		if (W.bookRe.test(a) || kind === 'book') return W.book;
		if (W.buyRe.test(a) || kind === 'buy') return W.buy;
		if (W.callRe.test(a) || kind === 'call') return W.call;
		return W.form;
	});
	const next = () => {
		if (step < qs.length - 1) step += 1;
		else built = true;
	};
	const dontKnow = () => {
		answers[q.id] = W.unknown;
		next();
	};
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out"><strong>{W.demo}</strong> {W.demoText}</p>

	{#if !built}
		<div class="q">
			<p class="n">{W.question} {Math.min(step, qs.length - 1) + 1} {W.of} {qs.length}</p>
			<p class="ask"><strong>{q.ask}</strong></p>
			<p class="why">{W.why} {q.why}</p>
			<label>{W.answer}
				<textarea rows="3" value={unknown(q.id) ? '' : (answers[q.id] ?? '')} oninput={(e) => (answers[q.id] = e.currentTarget.value)}></textarea>
			</label>
			<div class="dg-ctl">
				<button type="button" onclick={next}>{step < qs.length - 1 ? W.nextBtn : W.buildBtn}</button>
				<button type="button" onclick={dontKnow}>{W.dontKnow}</button>
				<button type="button" disabled={step === 0} onclick={() => (step -= 1)}>{W.back}</button>
			</div>
		</div>
		<p class="dg-out" aria-live="polite">{W.filled} <strong>{count} {W.of} {qs.length}</strong>.{#if missing.length}{W.empty}{missing.map((m) => m.id).join(', ')}.{/if}</p>
	{:else}
		<div class="res" aria-live="polite">
			<div class="dh">{W.after} {count} {W.of} {qs.length} {W.fields}</div>
			{#if missing.length}<p>{W.missing} <strong>{missing.map((m) => m.id).join(', ')}</strong>. {W.missingText}</p>{:else}<p>{W.allFilled}</p>{/if}
			<div class="dh">{W.structure}</div>
			<ol>{#each sections as s, i (i)}<li>{s}</li>{:else}<li>{W.noSections}</li>{/each}</ol>
			<div class="dh">{W.service} {W.qo}{answers.action || '…'}{W.qc}</div>
			<ul>{#each service as s, i (i)}<li>{s}</li>{/each}</ul>
			<div class="dh">{W.leaves}</div>
			<ul>
				{#each W.leave as l, i (i)}<li>{l}</li>{/each}
			</ul>
		</div>
		<div class="dg-ctl"><button type="button" onclick={() => ((built = false), (step = 0))}>{W.again}</button></div>
	{/if}
</figure>

<style>
	.q {
		padding: var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		margin-bottom: var(--space-3);
	}
	.q p {
		margin: 0 0 var(--space-2);
	}
	.n,
	.why {
		color: var(--text-secondary);
	}
	label {
		display: grid;
		gap: var(--space-1);
	}
	textarea {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-body);
		color: var(--text-body);
		font: inherit;
	}
	.dh {
		margin: var(--space-3) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.res p,
	.res ul,
	.res ol {
		margin-top: 0;
	}
</style>
