<!--
	«Пять форм согласия» (part 15, lesson 8). Five ways to write the consent line under a request
	form, shown as working form fragments. For each the person reads a verdict against the
	requirements of article 9 of 152-FZ as taught in lessons 7 and 8 (a conscious, unambiguous act
	by the person; separate from other documents since 1 September 2025; a stated purpose) and, for
	the good ones, the record the site must keep to prove it. A teaching reading as of 28.10.2026,
	not legal advice.
-->
<script lang="ts">
	import './shared.css';
	import { pick as pickLocale } from '#lib/i18n/index.ts';
	/** One string per edition (docs/content-plan/README.md, English edition): the Russian stays as written. */
	const t = (ru: string, en: string) => pickLocale({ ru, en });
	import { onMount } from 'svelte';

	let action = $state(t('Записаться', 'Book a consultation'));
	let operator = $state(t('Ксения Ольховская', 'Kate Alder'));
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.mainAction?.label) action = p.mainAction.label;
			if (p.name) operator = p.name;
		} catch {
			/* the example stays */
		}
	});

	type V = { id: string; title: string; ok: boolean; checked: boolean; text: string; second?: string; verdict: string; flaws: string[]; keep?: boolean };
	const variants = $derived<V[]>([
		{
			id: 'pre', title: t('Галочка уже стоит и объединяет согласие с офертой', 'A box that is already ticked and bundles consent with the terms'), ok: false, checked: true,
			text: t('Я согласен на обработку данных и с условиями оферты', 'I agree to the processing of my data and to the terms of sale'),
			verdict: t('Не годится.', 'Does not work.'),
			flaws: [t('Галочка отмечена заранее: человек не совершал действия.', 'The box is ticked in advance: the person took no action.'), t('Согласие слито с офертой: с 1 сентября 2025 года оно оформляется отдельно.', 'The consent is merged with the terms: it has to be presented apart from other matters (Article 7(2)).'), t('Не названы цель, оператор и данные.', 'The purpose, the controller and the data are not named.')]
		},
		{
			id: 'press', title: t('Без галочки: «нажимая кнопку, вы соглашаетесь»', 'No box: “by pressing the button you agree”'), ok: false, checked: false,
			text: '',
			verdict: t('Не годится.', 'Does not work.'),
			flaws: [t('Нет отдельного действия человека: кнопка отправляет форму, а не выражает согласие.', 'There is no separate action by the person: the button sends the form, it doesn’t express consent.'), t('Нельзя доказать, что человек прочёл и согласился.', 'You cannot show that the person read it and agreed.')]
		},
		{
			id: 'bundled', title: t('Пустая галочка, но одна на оферту и данные', 'An empty box, but one for the terms and the data together'), ok: false, checked: false,
			text: t('Я принимаю условия оферты и согласен на обработку персональных данных', 'I accept the terms of sale and agree to the processing of my personal data'),
			verdict: t('Не годится.', 'Does not work.'),
			flaws: [t('Согласие смешано с другим документом (офертой): нужна своя галочка и свой текст.', 'The consent is mixed with another document (the terms): it needs a checkbox and a text of its own.'), t('Нет цели: «для чего» не сказано.', 'There is no purpose: the “what for” isn’t said.')]
		},
		{
			id: 'good', title: t('Отдельная пустая галочка с целью и ссылкой на политику', 'A separate empty box with a purpose and a link to the notice'), ok: true, checked: false, keep: true,
			text: t(`Согласен, что ${operator} обработает моё имя и телефон, чтобы ответить на заявку «${action}». Политика обработки`, `I agree that ${operator} will process my name and phone number in order to reply to my inquiry “${action}”. Privacy notice`),
			verdict: t('Годится.', 'Works.'),
			flaws: [t('Пуста: человек отмечает сам.', 'Empty: the person ticks it themselves.'), t('Отдельная галочка и свой текст.', 'A separate box and a text of its own.'), t('Названы оператор, данные и цель; есть ссылка на политику.', 'The controller, the data and the purpose are named, and there is a link to the notice.')]
		},
		{
			id: 'best', title: t('То же и ещё отдельная необязательная галочка на рассылку', 'The same, plus a separate optional box for the newsletter'), ok: true, checked: false, keep: true,
			text: t(`Согласен, что ${operator} обработает моё имя и телефон, чтобы ответить на заявку «${action}». Политика обработки`, `I agree that ${operator} will process my name and phone number in order to reply to my inquiry “${action}”. Privacy notice`),
			second: t('Хочу получать новости на почту (можно отказаться в любой момент)', 'I would like to receive news by email (I can unsubscribe at any time)'),
			verdict: t('Годится и ещё лучше.', 'Works, and is even better.'),
			flaws: [t('Рассылка отдельная цель и отдельное согласие (закон «О рекламе», ст. 18).', 'A newsletter is a separate purpose with its own consent (PECR and the GDPR in the UK and EU).'), t('Вторая галочка необязательна и тоже пуста.', 'The second box is optional and also empty.'), t('Отказ от рассылки не блокирует заявку.', 'Declining the newsletter doesn’t block the inquiry.')]
		}
	]);

	let cur = $state('good');
	const v = $derived(variants.find((x) => x.id === cur)!);
</script>

<figure class="dg">
	<figcaption>{t('Пять способов спросить согласие', 'Five ways to ask for consent')}</figcaption>
	<p class="dg-out">{t('Выберите вариант строки под формой. Ниже виден сам фрагмент формы и вывод. Учебное прочтение требований на 28 октября 2026 года, не консультация.', 'Choose a variant of the line under the form. Below you see the form fragment itself and the verdict. A teaching reading of the requirements as of 30 October 2026, not legal advice.')}</p>

	<div class="dg-ctl" role="radiogroup" aria-label={t('Вариант согласия', 'Consent variant')}>
		{#each variants as x, i (x.id)}
			<button type="button" role="radio" aria-checked={cur === x.id} class:on={cur === x.id} onclick={() => (cur = x.id)}>{t('Вариант', 'Variant')} {i + 1}</button>
		{/each}
	</div>
	<p class="dg-out"><strong>{v.title}</strong></p>

	<form class="frag" onsubmit={(e) => e.preventDefault()}>
		<p class="fake">{t('Имя и телефон: поля формы', 'Name and phone: form fields')}</p>
		{#if v.text}
			<label><input type="checkbox" checked={v.checked} disabled /> <span>{v.text}</span></label>
		{:else}
			<p class="dim">{t('Под формой только мелкий текст: «Нажимая кнопку, вы соглашаетесь на обработку данных».', 'Under the form there is only small print: “By pressing the button you agree to the processing of your data.”')}</p>
		{/if}
		{#if v.second}<label><input type="checkbox" disabled /> <span>{v.second}</span></label>{/if}
		<button type="button" disabled>{action}</button>
	</form>

	<p class="dg-out verdict" class:ok={v.ok}><strong>{v.verdict}</strong></p>
	<ul class="flaws">
		{#each v.flaws as f (f)}<li>{f}</li>{/each}
	</ul>
	{#if v.keep}
		<p class="dg-out"><strong>{t('Что вы сохраняете как доказательство:', 'What you keep as proof:')}</strong></p>
		<pre class="dg-box dg-mono rec">consents(request_id, given_at, text_version, purpose)
→ 4821, 2026-10-28 12:41, «v3», «ответить на заявку»</pre>
	{/if}
	<p class="dg-out alt"><strong>{t('Текстовая альтернатива:', 'Text alternative:')}</strong> {t('пять вариантов строки согласия под формой. Не годятся: заранее отмеченная галочка, слитая с офертой; отсутствие галочки с фразой «нажимая кнопку»; пустая галочка, объединяющая оферту и данные. Годятся: отдельная пустая галочка с названием оператора, данных и цели и ссылкой на политику, а также она же с отдельной необязательной галочкой на рассылку. Для годных вариантов сохраняют запись с датой, версией текста и целью.', 'five variants of the consent line under a form. These don’t work: a box ticked in advance and merged with the terms; no box and a phrase “by pressing the button”; an empty box that joins the terms and the data. These work: a separate empty box naming the controller, the data and the purpose and linking to the notice, and the same with a separate optional box for the newsletter. For the variants that work you keep a record with a date, the version of the text and the purpose.')}</p>
</figure>

<style>
	.frag {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-4);
		border: var(--line) solid var(--border-rule);
		max-width: 38rem;
	}
	.frag label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		align-items: start;
	}
	.fake,
	.dim {
		margin: 0;
		color: var(--text-secondary);
	}
	.verdict.ok {
		color: var(--text-primary);
	}
	.flaws {
		margin: 0;
		padding-left: var(--space-5) !important;
	}
	.rec {
		overflow-x: auto;
		white-space: pre-wrap;
	}
</style>
