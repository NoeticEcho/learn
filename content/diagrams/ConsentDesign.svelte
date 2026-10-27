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
	import { onMount } from 'svelte';

	let action = $state('Записаться');
	let operator = $state('Ксения Ольховская');
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
			id: 'pre', title: 'Галочка уже стоит и объединяет согласие с офертой', ok: false, checked: true,
			text: 'Я согласен на обработку данных и с условиями оферты',
			verdict: 'Не годится.',
			flaws: ['Галочка отмечена заранее: человек не совершал действия.', 'Согласие слито с офертой: с 1 сентября 2025 года оно оформляется отдельно.', 'Не названы цель, оператор и данные.']
		},
		{
			id: 'press', title: 'Без галочки: «нажимая кнопку, вы соглашаетесь»', ok: false, checked: false,
			text: '',
			verdict: 'Не годится.',
			flaws: ['Нет отдельного действия человека: кнопка отправляет форму, а не выражает согласие.', 'Нельзя доказать, что человек прочёл и согласился.']
		},
		{
			id: 'bundled', title: 'Пустая галочка, но одна на оферту и данные', ok: false, checked: false,
			text: 'Я принимаю условия оферты и согласен на обработку персональных данных',
			verdict: 'Не годится.',
			flaws: ['Согласие смешано с другим документом (офертой): нужна своя галочка и свой текст.', 'Нет цели: «для чего» не сказано.']
		},
		{
			id: 'good', title: 'Отдельная пустая галочка с целью и ссылкой на политику', ok: true, checked: false, keep: true,
			text: `Согласен, что ${operator} обработает моё имя и телефон, чтобы ответить на заявку «${action}». Политика обработки`,
			verdict: 'Годится.',
			flaws: ['Пуста: человек отмечает сам.', 'Отдельная галочка и свой текст.', 'Названы оператор, данные и цель; есть ссылка на политику.']
		},
		{
			id: 'best', title: 'То же и ещё отдельная необязательная галочка на рассылку', ok: true, checked: false, keep: true,
			text: `Согласен, что ${operator} обработает моё имя и телефон, чтобы ответить на заявку «${action}». Политика обработки`,
			second: 'Хочу получать новости на почту (можно отказаться в любой момент)',
			verdict: 'Годится и ещё лучше.',
			flaws: ['Рассылка отдельная цель и отдельное согласие (закон «О рекламе», ст. 18).', 'Вторая галочка необязательна и тоже пуста.', 'Отказ от рассылки не блокирует заявку.']
		}
	]);

	let cur = $state('good');
	const v = $derived(variants.find((x) => x.id === cur)!);
</script>

<figure class="dg">
	<figcaption>Пять способов спросить согласие</figcaption>
	<p class="dg-out">Выберите вариант строки под формой. Ниже виден сам фрагмент формы и вывод. Учебное прочтение требований на 28 октября 2026 года, не консультация.</p>

	<div class="dg-ctl" role="radiogroup" aria-label="Вариант согласия">
		{#each variants as x, i (x.id)}
			<button type="button" role="radio" aria-checked={cur === x.id} class:on={cur === x.id} onclick={() => (cur = x.id)}>Вариант {i + 1}</button>
		{/each}
	</div>
	<p class="dg-out"><strong>{v.title}</strong></p>

	<form class="frag" onsubmit={(e) => e.preventDefault()}>
		<p class="fake">Имя и телефон: поля формы</p>
		{#if v.text}
			<label><input type="checkbox" checked={v.checked} disabled /> <span>{v.text}</span></label>
		{:else}
			<p class="dim">Под формой только мелкий текст: «Нажимая кнопку, вы соглашаетесь на обработку данных».</p>
		{/if}
		{#if v.second}<label><input type="checkbox" disabled /> <span>{v.second}</span></label>{/if}
		<button type="button" disabled>{action}</button>
	</form>

	<p class="dg-out verdict" class:ok={v.ok}><strong>{v.verdict}</strong></p>
	<ul class="flaws">
		{#each v.flaws as f (f)}<li>{f}</li>{/each}
	</ul>
	{#if v.keep}
		<p class="dg-out"><strong>Что вы сохраняете как доказательство:</strong></p>
		<pre class="dg-box dg-mono rec" tabindex="0" aria-label="Запись о согласии">consents(request_id, given_at, text_version, purpose)
→ 4821, 2026-10-28 12:41, «v3», «ответить на заявку»</pre>
	{/if}
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> пять вариантов строки согласия под формой. Не годятся: заранее отмеченная галочка, слитая с офертой; отсутствие галочки с фразой «нажимая кнопку»; пустая галочка, объединяющая оферту и данные. Годятся: отдельная пустая галочка с названием оператора, данных и цели и ссылкой на политику, а также она же с отдельной необязательной галочкой на рассылку. Для годных вариантов сохраняют запись с датой, версией текста и целью.</p>
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
