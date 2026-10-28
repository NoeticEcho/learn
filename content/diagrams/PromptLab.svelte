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
	import { pick } from '#lib/i18n/index.ts';

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
	type Line = { text: string; tell: boolean };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// A TEACHING MODEL in both: the stand-in page for a short request is the most probable page of its language.
	const W = pick({
		ru: {
			fallback: { name: 'Проект', who: 'Что делает проект', forWhom: 'Для кого', action: 'Оставить заявку', sections: ['О проекте', 'Услуги', 'Контакты'], items: ['Услуга'], people: [], proofs: [], languages: ['ru'], tone: 'calm' } as P,
			sample: {
				formal: ['Консультация проводится после оформления договора.', 'Заключение составляется в письменной форме.'],
				warm: ['Расскажите, что случилось, и мы разберёмся вместе.', 'Спросить можно о чём угодно, это не отнимет у вас ничего.'],
				bold: ['Спор о границе не должен длиться годами.', 'Мы начинаем с документов, а не с обещаний.'],
				calm: ['Сначала разберём документы, потом решим, что делать.', 'Ответим на вопросы по порядку, без спешки.']
			} as Record<string, string[]>,
			fields: ['Кто и чем занимается', 'Для кого', 'Главное действие посетителя', 'Разделы', 'Что предлагаем', 'Люди', 'Подтверждения (только из брифа)', 'Языки', 'Тон на двух примерах', 'Чего не делать', 'Как понять, что готово'],
			make: (n: string) => `Сделай одностраничный сайт проекта «${n}».`,
			who: (x: string) => `Кто и чем занимается: ${x}.`,
			forWhom: (x: string) => `Для кого: ${x}.`,
			action: (x: string) => `Главное действие посетителя: «${x}».`,
			sections: (x: string) => `Разделы: ${x}.`,
			items: (x: string) => `Что предлагаем: ${x}.`,
			people: (x: string) => `Люди: ${x}.`,
			proofs: (x: string) => `Подтверждения (только эти, ничего не выдумывать): ${x}.`,
			noProofs: 'Подтверждений в брифе нет: блок с подтверждениями не делай и цифр не придумывай.',
			languages: (x: string) => `Языки: ${x} (атрибут lang и hreflang).`,
			tone: (a: string, b: string) => `Тон, на примерах: «${a}» «${b}»`,
			donts: 'Чего не делать: не придумывать достижения, отзывы и цифры; не подключать сторонние скрипты; не писать кнопки по-английски.',
			done: 'Готово, когда: один заголовок первого уровня; у каждой картинки есть alt; контраст текста не ниже 4,5 к 1; страница читается без стилей.',
			r: {
				title: (n: string, w: string) => `Заголовок: «${n}: ${w}»`,
				titleTell: 'Заголовок: «Инновационные решения для вашего бизнеса»',
				sub: (x: string) => `Подзаголовок говорит, для кого: ${x}`,
				subTell: 'Подзаголовок: «Индивидуальный подход к каждому клиенту»',
				btn: (x: string) => `Кнопка: «${x}»`,
				btnTell: 'Кнопка: «Get Started»',
				secs: (x: string) => `Разделы: ${x}`,
				secsTell: 'Разделы: О нас, Услуги, Отзывы, Тарифы, Блог',
				cards: (x: string) => `Карточки: ${x}`,
				cardsTell: 'Карточки: «Качество», «Скорость», «Инновации» со значками',
				proofs: (x: string) => `Подтверждения: ${x}`,
				noProofs: 'Блока подтверждений нет: в брифе их нет',
				proofsTell: 'Подтверждения: «10 000+ клиентов, 99,9 % довольных» (выдумано)',
				tone: (x: string) => `Тон: как в ваших примерах («${x}»)`,
				toneTell: 'Тон: бодрый рекламный по умолчанию, восклицательные знаки',
				style: 'Оформление: без градиента и чужих скриптов',
				styleTell: 'Оформление: фиолетовый градиент, тень у всего, внешний скрипт',
				self: 'Самопроверка: один h1, alt у картинок, контраст не ниже 4,5',
				selfTell: 'Самопроверки нет: alt у части картинок пропущен'
			},
			caption: 'Что вы кладёте в запрос и что от этого зависит',
			model: 'Это учебная модель.',
			modelText: 'Справа не ответ настоящей модели, а то, что получилось бы по написанным для урока правилам: чего в запросе нет, то модель заполнит самым вероятным, то есть шаблоном.',
			legend: 'Что передать в запрос',
			shortBtn: 'Короткая просьба',
			fullBtn: 'Полный бриф',
			request: 'Запрос',
			result: 'Что получится (модель)',
			tellMark: ' (примета шаблона)',
			passed: 'Передано частей брифа:',
			of: 'из',
			left: 'Примет шаблонной страницы осталось:'
		},
		en: {
			fallback: { name: 'Project', who: 'What the project does', forWhom: 'For whom', action: 'Get in touch', sections: ['About', 'Services', 'Contact'], items: ['Service'], people: [], proofs: [], languages: ['en'], tone: 'calm' } as P,
			sample: {
				formal: ['A survey is carried out after the agreement is signed.', 'The findings are issued in writing.'],
				warm: ['Tell us what happened, and we’ll work it out together.', 'You can ask us anything, and it won’t cost you a thing.'],
				bold: ['A boundary dispute shouldn’t drag on for years.', 'We start with the documents, not with promises.'],
				calm: ['First we’ll go through the documents, then decide what to do.', 'We’ll answer your questions in order, without hurry.']
			} as Record<string, string[]>,
			fields: ['Who they are and what they do', 'For whom', 'The visitor’s main action', 'Sections', 'What we offer', 'People', 'Proof (only from the brief)', 'Languages', 'Tone, by two examples', 'What not to do', 'How to tell it is done'],
			make: (n: string) => `Make a one-page site for the project “${n}”.`,
			who: (x: string) => `Who they are and what they do: ${x}.`,
			forWhom: (x: string) => `For whom: ${x}.`,
			action: (x: string) => `The visitor’s main action: “${x}”.`,
			sections: (x: string) => `Sections: ${x}.`,
			items: (x: string) => `What we offer: ${x}.`,
			people: (x: string) => `People: ${x}.`,
			proofs: (x: string) => `Proof (only these, invent nothing): ${x}.`,
			noProofs: 'The brief has no proof: don’t make a block of proof and don’t invent numbers.',
			languages: (x: string) => `Languages: ${x} (the lang and hreflang attributes).`,
			tone: (a: string, b: string) => `Tone, by example: “${a}” “${b}”`,
			donts: 'What not to do: don’t invent achievements, reviews or numbers; don’t add third-party scripts; don’t use a stock button such as “Get Started”.',
			done: 'Done when: one first-level heading; every image has alt; text contrast of at least 4.5 to 1; the page reads without styles.',
			r: {
				title: (n: string, w: string) => `Heading: “${n}: ${w}”`,
				titleTell: 'Heading: “Innovative solutions for your business”',
				sub: (x: string) => `The subheading says who it is for: ${x}`,
				subTell: 'Subheading: “A personal approach to every client”',
				btn: (x: string) => `Button: “${x}”`,
				btnTell: 'Button: “Get Started”',
				secs: (x: string) => `Sections: ${x}`,
				secsTell: 'Sections: About us, Services, Testimonials, Pricing, Blog',
				cards: (x: string) => `Cards: ${x}`,
				cardsTell: 'Cards: “Quality”, “Speed”, “Innovation” with icons',
				proofs: (x: string) => `Proof: ${x}`,
				noProofs: 'There is no block of proof: the brief has none',
				proofsTell: 'Proof: “10,000+ customers, 99.9% satisfied” (invented)',
				tone: (x: string) => `Tone: as in your examples (“${x}”)`,
				toneTell: 'Tone: upbeat advertising by default, exclamation marks',
				style: 'Styling: no gradient and no outside scripts',
				styleTell: 'Styling: a purple gradient, a shadow on everything, an outside script',
				self: 'Self-check: one h1, alt on images, contrast of at least 4.5',
				selfTell: 'There is no self-check: some images lack alt'
			},
			caption: 'What you put in a prompt, and what depends on it',
			model: 'This is a teaching model.',
			modelText: 'On the right is not a real model’s answer but what would come out by rules written for the lesson: whatever the prompt lacks, the model fills with the most probable thing, that is, a template.',
			legend: 'What to put in the prompt',
			shortBtn: 'A short request',
			fullBtn: 'The full brief',
			request: 'The prompt',
			result: 'What comes out (the model)',
			tellMark: ' (a template tell)',
			passed: 'Parts of the brief passed:',
			of: 'of',
			left: 'Tells of a template page left:'
		}
	});

	let p = $state<P>(W.fallback);
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

	const sample = W.sample;
	const ids = ['who', 'forWhom', 'action', 'sections', 'items', 'people', 'proofs', 'languages', 'tone', 'donts', 'done'];
	const fields = ids.map((id, k) => ({ id, label: W.fields[k] }));
	let on = $state<Record<string, boolean>>({});
	const set = (id: string, v: boolean) => (on[id] = v);

	const prompt = $derived.by(() => {
		const l: string[] = [W.make(p.name)];
		if (on.who) l.push(W.who(p.who));
		if (on.forWhom) l.push(W.forWhom(p.forWhom));
		if (on.action) l.push(W.action(p.action));
		if (on.sections) l.push(W.sections(p.sections.join('; ')));
		if (on.items && p.items.length) l.push(W.items(p.items.join('; ')));
		if (on.people && p.people.length) l.push(W.people(p.people.join('; ')));
		if (on.proofs) l.push(p.proofs.length ? W.proofs(p.proofs.join('; ')) : W.noProofs);
		if (on.languages) l.push(W.languages(p.languages.join(', ')));
		if (on.tone) l.push(W.tone(sample[p.tone][0], sample[p.tone][1]));
		if (on.donts) l.push(W.donts);
		if (on.done) l.push(W.done);
		return l.join('\n');
	});

	const result = $derived.by<Line[]>(() => {
		const R = W.r;
		const out: Line[] = [];
		out.push(on.who ? { text: R.title(p.name, p.who), tell: false } : { text: R.titleTell, tell: true });
		out.push(on.forWhom ? { text: R.sub(p.forWhom), tell: false } : { text: R.subTell, tell: true });
		out.push(on.action ? { text: R.btn(p.action), tell: false } : { text: R.btnTell, tell: true });
		out.push(on.sections ? { text: R.secs(p.sections.join(', ')), tell: false } : { text: R.secsTell, tell: true });
		out.push(on.items && p.items.length ? { text: R.cards(p.items.join(', ')), tell: false } : { text: R.cardsTell, tell: true });
		out.push(on.proofs ? { text: p.proofs.length ? R.proofs(p.proofs.join(', ')) : R.noProofs, tell: false } : { text: R.proofsTell, tell: true });
		out.push(on.tone ? { text: R.tone(sample[p.tone][0]), tell: false } : { text: R.toneTell, tell: true });
		out.push(on.donts ? { text: R.style, tell: false } : { text: R.styleTell, tell: true });
		out.push(on.done ? { text: R.self, tell: false } : { text: R.selfTell, tell: true });
		return out;
	});
	const tells = $derived(result.filter((r) => r.tell).length);
	const used = $derived(fields.filter((f) => on[f.id]).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out"><strong>{W.model}</strong> {W.modelText}</p>
	<div class="grid">
		<div>
			<fieldset>
				<legend>{W.legend}</legend>
				{#each fields as f (f.id)}
					<label class="row"><input type="checkbox" checked={!!on[f.id]} onchange={(e) => set(f.id, e.currentTarget.checked)} /> {f.label}</label>
				{/each}
			</fieldset>
			<div class="dg-ctl">
				<button type="button" onclick={() => fields.forEach((f) => set(f.id, false))}>{W.shortBtn}</button>
				<button type="button" onclick={() => fields.forEach((f) => set(f.id, true))}>{W.fullBtn}</button>
			</div>
		</div>
		<div>
			<div class="dh">{W.request}</div>
			<pre class="dg-box dg-mono">{prompt}</pre>
		</div>
	</div>
	<div class="dh">{W.result}</div>
	<ul class="res" aria-live="polite">
		{#each result as r, i (i)}<li class:tell={r.tell}>{r.text}{r.tell ? W.tellMark : ''}</li>{/each}
	</ul>
	<p class="dg-out" aria-live="polite">{W.passed} <strong>{used} {W.of} {fields.length}</strong>. {W.left} <strong>{tells} {W.of} {result.length}</strong>.</p>
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
