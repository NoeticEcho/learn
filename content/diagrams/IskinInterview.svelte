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

	type Q = { id: string; ask: string; why: string };
	const qs: Q[] = [
		{ id: 'who', ask: 'Чем вы занимаетесь, одной-двумя фразами?', why: 'Из этого получится заголовок и первый абзац. Без вашей сути Искин напишет лозунг.' },
		{ id: 'forWhom', ask: 'Для кого это? Кто к вам приходит?', why: 'От аудитории зависят слова, порядок разделов и уровень подробностей.' },
		{ id: 'action', ask: 'Что должен сделать посетитель, чтобы сайт сработал?', why: 'Это главное действие: одна кнопка, вокруг которой строится страница.' },
		{ id: 'sections', ask: 'Какие разделы нужны? Перечислите через точку с запятой.', why: 'Разделы станут структурой и меню. Лишних Искин не добавляет.' },
		{ id: 'items', ask: 'Что вы предлагаете: услуги, товары, программы?', why: 'Это содержание карточек. Придумывать предложения за вас нельзя.' },
		{ id: 'proofs', ask: 'Чем вы можете подтвердить сказанное: документы, работы, членство?', why: 'Подтверждения берутся только отсюда. Если их нет, блока не будет.' },
		{ id: 'contacts', ask: 'Как с вами связаться и что нельзя публиковать?', why: 'Контакты и запреты решаете вы. Искин не публикует личное без вашего слова.' },
		{ id: 'tone', ask: 'Каким голосом вы говорите? Приведите две свои фразы.', why: 'Две настоящие фразы точнее любого прилагательного.' }
	];

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
				contacts: 'Телефон и почту не показывать на странице, только форма. Город можно.',
				tone: ''
			};
		} catch {
			/* the example stays */
		}
	});

	const q = $derived(qs[Math.min(step, qs.length - 1)]);
	const unknown = (id: string) => answers[id] === 'не знаю';
	const filled = (id: string) => !!answers[id]?.trim() && !unknown(id);
	const count = $derived(qs.filter((x) => filled(x.id)).length);
	const missing = $derived(qs.filter((x) => !filled(x.id)));
	const sections = $derived((answers.sections ?? '').split(/[;\n]+/).map((s) => s.trim()).filter(Boolean));
	const service = $derived.by(() => {
		const a = (answers.action ?? '').toLowerCase();
		if (/запис|консульт|встреч|приём|прием/.test(a) || kind === 'book') return ['Форма записи с выбором времени', 'Календарь, который не даст записать на занятое', 'Письмо вам о новой записи и письмо посетителю с подтверждением'];
		if (/куп|заказ|оплат|корзин/.test(a) || kind === 'buy') return ['Каталог из ваших предложений', 'Заказ и оплата через готовый платёжный сервис (деньги сами Искин не принимает)', 'Уведомление вам о каждом заказе'];
		if (/звон|позвон/.test(a) || kind === 'call') return ['Кнопка звонка с вашим номером', 'Форма «перезвоните мне» как запасной путь'];
		return ['Форма заявки с согласием на обработку данных', 'Приёмник заявок в российской базе', 'Уведомление вам о новой заявке'];
	});
	const next = () => {
		if (step < qs.length - 1) step += 1;
		else built = true;
	};
	const dontKnow = () => {
		answers[q.id] = 'не знаю';
		next();
	};
</script>

<figure class="dg">
	<figcaption>Искин спрашивает, а не ждёт запроса</figcaption>
	<p class="dg-out"><strong>Это показ работы.</strong> Вопросы написаны заранее, модель не запускается: страница показывает, что интервьюер сделал бы с вашими ответами. Бриф подставлен ваш, его можно править.</p>

	{#if !built}
		<div class="q">
			<p class="n">Вопрос {Math.min(step, qs.length - 1) + 1} из {qs.length}</p>
			<p class="ask"><strong>{q.ask}</strong></p>
			<p class="why">Зачем: {q.why}</p>
			<label>Ваш ответ
				<textarea rows="3" value={unknown(q.id) ? '' : (answers[q.id] ?? '')} oninput={(e) => (answers[q.id] = e.currentTarget.value)}></textarea>
			</label>
			<div class="dg-ctl">
				<button type="button" onclick={next}>{step < qs.length - 1 ? 'Дальше' : 'Собрать сайт и сервис'}</button>
				<button type="button" onclick={dontKnow}>Не знаю</button>
				<button type="button" disabled={step === 0} onclick={() => (step -= 1)}>Назад</button>
			</div>
		</div>
		<p class="dg-out" aria-live="polite">Бриф заполнен на <strong>{count} из {qs.length}</strong>.{#if missing.length} Пока пусто: {missing.map((m) => m.id).join(', ')}.{/if}</p>
	{:else}
		<div class="res" aria-live="polite">
			<div class="dh">Бриф после интервью: {count} из {qs.length} полей</div>
			{#if missing.length}<p>Не заполнено: <strong>{missing.map((m) => m.id).join(', ')}</strong>. Искин ничего не выдумает: на этих местах будут пустые блоки с пометкой для вас, и на странице их не будет.</p>{:else}<p>Все поля заполнены.</p>{/if}
			<div class="dh">Структура сайта</div>
			<ol>{#each sections as s, i (i)}<li>{s}</li>{:else}<li>Разделов нет: Искин спросит ещё раз.</li>{/each}</ol>
			<div class="dh">Сервис для действия «{answers.action || '…'}»</div>
			<ul>{#each service as s, i (i)}<li>{s}</li>{/each}</ul>
			<div class="dh">Что Искин оставляет вам</div>
			<ul>
				<li>Каждое утверждение и цифра: он берёт их только из ответов и подтверждений.</li>
				<li>Политика обработки данных и согласие: текст согласуете вы с юристом.</li>
				<li>Деньги: оплату подключаете вы, через готовый сервис.</li>
				<li>Публикация: решение «выкладывать» принимаете вы после проверки.</li>
			</ul>
		</div>
		<div class="dg-ctl"><button type="button" onclick={() => ((built = false), (step = 0))}>Пройти ещё раз</button></div>
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
