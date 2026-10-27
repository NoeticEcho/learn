<!--
	«Конструктор запроса» (part 16, lesson 3). The person ticks which parts of their own brief go
	into the prompt (who, for whom, the main action, sections, items, people, proofs, languages,
	examples of the tone, what not to do, what «done» means), and the page does two things: it
	assembles the prompt text, and shows what a typical model would make of it. The second part is
	a TEACHING MODEL, not a model: every field switches one feature of the imagined result on or
	off by a written rule (no brief fields, so the stand-in is the most probable page: a slogan, three
	cards, invented numbers). It counts the tells of a template page that are left. The text of the
	brief is the person's own; the page never leaves the browser.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	type P = {
		name: string;
		who: string;
		forWhom: string;
		action: string;
		sections: string[];
		items: string[];
		people: string[];
		proofs: string[];
		languages: string[];
		tone: string;
	};
	let p = $state<P>({ name: 'Проект', who: 'Что делает проект', forWhom: 'Для кого', action: 'Оставить заявку', sections: ['О проекте', 'Услуги', 'Контакты'], items: ['Услуга'], people: [], proofs: [], languages: ['ru'], tone: 'calm' });
	onMount(async () => {
		try {
			const x = await (await import('#lib/learner.ts')).persona();
			p = {
				name: x.name || p.name,
				who: x.who || p.who,
				forWhom: x.forWhom || p.forWhom,
				action: x.mainAction?.label || p.action,
				sections: x.sections?.length ? x.sections : p.sections,
				items: (x.items ?? []).map((i) => i.title),
				people: (x.people ?? []).map((i) => i.name),
				proofs: (x.proofs ?? []).map((i) => i.title),
				languages: x.languages ?? p.languages,
				tone: x.tone ?? p.tone
			};
		} catch {
			/* the example stays */
		}
	});

	const sample: Record<string, string[]> = {
		formal: ['Консультация проводится после оформления договора.', 'Заключение составляется в письменной форме.'],
		warm: ['Расскажите, что случилось, и мы разберёмся вместе.', 'Спросить можно о чём угодно, это не отнимет у вас ничего.'],
		bold: ['Спор о границе не должен длиться годами.', 'Мы начинаем с документов, а не с обещаний.'],
		calm: ['Сначала разберём документы, потом решим, что делать.', 'Ответим на вопросы по порядку, без спешки.']
	};

	const fields = [
		{ id: 'who', label: 'Кто и чем занимается' },
		{ id: 'forWhom', label: 'Для кого' },
		{ id: 'action', label: 'Главное действие посетителя' },
		{ id: 'sections', label: 'Разделы' },
		{ id: 'items', label: 'Что предлагаем' },
		{ id: 'people', label: 'Люди' },
		{ id: 'proofs', label: 'Подтверждения (только из брифа)' },
		{ id: 'languages', label: 'Языки' },
		{ id: 'tone', label: 'Тон на двух примерах' },
		{ id: 'donts', label: 'Чего не делать' },
		{ id: 'done', label: 'Как понять, что готово' }
	];
	let on = $state<Record<string, boolean>>({});
	const set = (id: string, v: boolean) => (on[id] = v);

	const prompt = $derived.by(() => {
		const l: string[] = [`Сделай одностраничный сайт проекта «${p.name}».`];
		if (on.who) l.push(`Кто и чем занимается: ${p.who}.`);
		if (on.forWhom) l.push(`Для кого: ${p.forWhom}.`);
		if (on.action) l.push(`Главное действие посетителя: «${p.action}».`);
		if (on.sections) l.push(`Разделы: ${p.sections.join('; ')}.`);
		if (on.items && p.items.length) l.push(`Что предлагаем: ${p.items.join('; ')}.`);
		if (on.people && p.people.length) l.push(`Люди: ${p.people.join('; ')}.`);
		if (on.proofs) l.push(p.proofs.length ? `Подтверждения (только эти, ничего не выдумывать): ${p.proofs.join('; ')}.` : 'Подтверждений в брифе нет: блок с подтверждениями не делай и цифр не придумывай.');
		if (on.languages) l.push(`Языки: ${p.languages.join(', ')} (атрибут lang и hreflang).`);
		if (on.tone) l.push(`Тон, на примерах: «${sample[p.tone][0]}» «${sample[p.tone][1]}»`);
		if (on.donts) l.push('Чего не делать: не придумывать достижения, отзывы и цифры; не подключать сторонние скрипты; не писать кнопки по-английски.');
		if (on.done) l.push('Готово, когда: один заголовок первого уровня; у каждой картинки есть alt; контраст текста не ниже 4,5 к 1; страница читается без стилей.');
		return l.join('\n');
	});

	type Line = { text: string; tell: boolean };
	const result = $derived.by<Line[]>(() => {
		const out: Line[] = [];
		out.push(on.who ? { text: `Заголовок: «${p.name}: ${p.who}»`, tell: false } : { text: 'Заголовок: «Инновационные решения для вашего бизнеса»', tell: true });
		out.push(on.forWhom ? { text: `Подзаголовок говорит, для кого: ${p.forWhom}`, tell: false } : { text: 'Подзаголовок: «Индивидуальный подход к каждому клиенту»', tell: true });
		out.push(on.action ? { text: `Кнопка: «${p.action}»`, tell: false } : { text: 'Кнопка: «Get Started»', tell: true });
		out.push(on.sections ? { text: `Разделы: ${p.sections.join(', ')}`, tell: false } : { text: 'Разделы: О нас, Услуги, Отзывы, Тарифы, Блог', tell: true });
		out.push(on.items && p.items.length ? { text: `Карточки: ${p.items.join(', ')}`, tell: false } : { text: 'Карточки: «Качество», «Скорость», «Инновации» со значками', tell: true });
		out.push(on.proofs ? { text: p.proofs.length ? `Подтверждения: ${p.proofs.join(', ')}` : 'Блока подтверждений нет: в брифе их нет', tell: false } : { text: 'Подтверждения: «10 000+ клиентов, 99,9 % довольных» (выдумано)', tell: true });
		out.push(on.tone ? { text: `Тон: как в ваших примерах («${sample[p.tone][0]}»)`, tell: false } : { text: 'Тон: бодрый рекламный по умолчанию, восклицательные знаки', tell: true });
		out.push(on.donts ? { text: 'Оформление: без градиента и чужих скриптов', tell: false } : { text: 'Оформление: фиолетовый градиент, тень у всего, внешний скрипт', tell: true });
		out.push(on.done ? { text: 'Самопроверка: один h1, alt у картинок, контраст не ниже 4,5', tell: false } : { text: 'Самопроверки нет: alt у части картинок пропущен', tell: true });
		return out;
	});
	const tells = $derived(result.filter((r) => r.tell).length);
	const used = $derived(fields.filter((f) => on[f.id]).length);
</script>

<figure class="dg">
	<figcaption>Что вы кладёте в запрос и что от этого зависит</figcaption>
	<p class="dg-out"><strong>Это учебная модель.</strong> Справа не ответ настоящей модели, а то, что получилось бы по написанным для урока правилам: чего в запросе нет, то модель заполнит самым вероятным, то есть шаблоном.</p>
	<div class="grid">
		<div>
			<fieldset>
				<legend>Что передать в запрос</legend>
				{#each fields as f (f.id)}
					<label class="row"><input type="checkbox" checked={!!on[f.id]} onchange={(e) => set(f.id, e.currentTarget.checked)} /> {f.label}</label>
				{/each}
			</fieldset>
			<div class="dg-ctl">
				<button type="button" onclick={() => fields.forEach((f) => set(f.id, false))}>Короткая просьба</button>
				<button type="button" onclick={() => fields.forEach((f) => set(f.id, true))}>Полный бриф</button>
			</div>
		</div>
		<div>
			<div class="dh">Запрос</div>
			<pre class="dg-box dg-mono">{prompt}</pre>
		</div>
	</div>
	<div class="dh">Что получится (модель)</div>
	<ul class="res" aria-live="polite">
		{#each result as r, i (i)}<li class:tell={r.tell}>{r.text}{r.tell ? ' (примета шаблона)' : ''}</li>{/each}
	</ul>
	<p class="dg-out" aria-live="polite">Передано частей брифа: <strong>{used} из {fields.length}</strong>. Примет шаблонной страницы осталось: <strong>{tells} из {result.length}</strong>.</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--space-4);
	}
	fieldset {
		border: var(--line) solid var(--border-hairline);
		margin: 0 0 var(--space-3);
	}
	.row {
		display: flex;
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		min-height: 8rem;
	}
	.dh {
		margin: var(--space-3) 0 var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.res {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
	.res li {
		padding: var(--space-1) var(--space-3);
		border-left: 4px solid var(--accent-measure);
		background: var(--surface-canvas);
	}
	.res li.tell {
		border-left-color: var(--text-primary);
		font-style: italic;
	}
</style>
