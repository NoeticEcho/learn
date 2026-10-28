<!--
	«Что выходит из конструктора» (part 16, lesson 1). One brief, three kinds of AI builder, and a
	table of what came out. The three pages are written for this lesson from the habits of the
	kinds (a code generator, a block builder, a generator of a whole application with a back end):
	they are NOT the output of any real product, and the page says so. The numbers beside them are
	not made up: they are counted from the generated HTML by the browser itself (headings,
	landmarks, images without alt, controls that are not buttons, form fields without a label,
	scripts, nodes, bytes, third-party hosts), so the person can see how to measure a page they
	receive from a real tool. The brief's name, who, sections, items and main action fill the pages.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Brief = { name: string; who: string; sections: string[]; items: { title: string; text: string }[]; action: string };
	type Kind = { id: string; name: string; like: string; cost: string; leave: string; html: (x: Brief) => string };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The pages are written for the lesson from the habits of three kinds of AI builder; in English the
	// generic tells are an English-speaking page's own (a stock “Get Started” button, empty marketing lines).
	const W = pick({
		ru: {
			fallback: {
				name: 'Мой проект',
				who: 'Что делает проект',
				sections: ['О проекте', 'Услуги', 'Контакты'],
				items: [{ title: 'Первая услуга', text: 'Что это.' }, { title: 'Вторая услуга', text: 'Что это.' }],
				action: 'Оставить заявку'
			} as Brief,
			lang: 'ru',
			sectionsLabel: 'Разделы',
			nameField: 'Имя',
			phoneField: 'Телефон',
			login: 'Войти',
			kinds: [
				{
					id: 'code',
					name: 'Тип А: код по запросу',
					like: 'так обычно устроены генераторы кода по описанию',
					cost: 'платите за вычисления: каждая правка тратит кредиты, итоговая цена заранее неизвестна',
					leave: 'код можно забрать в репозиторий и держать где угодно'
				},
				{
					id: 'blocks',
					name: 'Тип Б: блоки и шаблоны',
					like: 'так обычно устроены блочные конструкторы с ИИ',
					cost: 'платите тариф за сайт; ИИ входит в тариф или в лимиты, цена предсказуема',
					leave: 'часто только на дорогом тарифе, а формы и корзина могут остаться привязаны к платформе'
				},
				{
					id: 'app',
					name: 'Тип В: приложение с серверной частью',
					like: 'так обычно устроены генераторы целого приложения с базой и входом',
					cost: 'платите за генератор и отдельно за базу и хостинг, которые он подключает',
					leave: 'код забрать можно, но база и вход остаются у стороннего сервиса, который нужно перенести'
				}
			],
			codeTitle: (n: string) => `${n}: инновационные решения`,
			cta: 'Get Started',
			cards: [['Качество', 'Надёжный партнёр для вашего бизнеса'], ['Скорость', 'Индивидуальный подход к каждому'], ['Инновации', 'Нам доверяют 10 000+ клиентов']],
			caption: 'Один бриф, три вида конструкторов',
			important: 'Важно.',
			disclaimer: 'Эти три страницы написаны для урока по типичным приметам трёх видов инструментов. Это не выдача какого-либо настоящего сервиса: настоящие выдачи другие и меняются каждый месяц. Но числа в таблице посчитаны по-настоящему, и так же можно измерить любую страницу, которую вы получите.',
			kindLabel: 'Вид конструктора',
			price: 'Цена:',
			exit: 'Выход:',
			markup: 'Разметка страницы',
			counted: 'Что посчитано по разметке',
			feature: 'Признак',
			bad: ' (плохо)',
			cols: ['Заголовок первого уровня (h1)', 'Смысловые части страницы (header, nav, main, footer), из четырёх', 'Картинки без alt', 'Кнопки, сделанные из div и span', 'Поля формы без подписи', 'Скриптов', 'Чужих серверов (где лежат скрипты и картинки)', 'Элементов на странице', 'Размер разметки, байт'],
			verdict: 'Вывод стоит сделать самому: ни один вид не победил по всем строкам. Блочный конструктор чище по разметке, но менее свободен. Код по запросу свободен, но приносит чужие скрипты и «кнопки» из div. Приложение мощнее всех и тянет за собой базу, о которой надо думать отдельно.'
		},
		en: {
			fallback: {
				name: 'My project',
				who: 'What the project does',
				sections: ['About', 'Services', 'Contact'],
				items: [{ title: 'First service', text: 'What it is.' }, { title: 'Second service', text: 'What it is.' }],
				action: 'Get in touch'
			} as Brief,
			lang: 'en',
			sectionsLabel: 'Sections',
			nameField: 'Name',
			phoneField: 'Phone',
			login: 'Sign in',
			kinds: [
				{
					id: 'code',
					name: 'Type A: code on request',
					like: 'this is how code generators that work from a description are usually built',
					cost: 'you pay for computing: every edit spends credits, and the final price is unknown in advance',
					leave: 'the code can be taken into a repository and kept anywhere'
				},
				{
					id: 'blocks',
					name: 'Type B: blocks and templates',
					like: 'this is how block builders with AI are usually built',
					cost: 'you pay a plan for the site; the AI is in the plan or in its limits, and the price is predictable',
					leave: 'often only on an expensive plan, and forms and the cart may stay tied to the platform'
				},
				{
					id: 'app',
					name: 'Type C: an application with a back end',
					like: 'this is how generators of a whole application with a database and sign-in are usually built',
					cost: 'you pay for the generator, and separately for the database and hosting it connects',
					leave: 'the code can be taken, but the database and sign-in stay with a third-party service that has to be moved'
				}
			],
			codeTitle: (n: string) => `${n}: innovative solutions`,
			cta: 'Get Started',
			cards: [['Quality', 'A reliable partner for your business'], ['Speed', 'A personal approach to every client'], ['Innovation', 'Trusted by 10,000+ customers']],
			caption: 'One brief, three kinds of builder',
			important: 'Note.',
			disclaimer: 'These three pages were written for the lesson from the typical habits of three kinds of tool. They are not the output of any real service: real outputs differ and change every month. But the numbers in the table are really counted, and you can measure any page you get the same way.',
			kindLabel: 'Kind of builder',
			price: 'Price:',
			exit: 'Way out:',
			markup: 'The page’s markup',
			counted: 'What was counted from the markup',
			feature: 'Feature',
			bad: ' (bad)',
			cols: ['First-level heading (h1)', 'Meaningful parts of the page (header, nav, main, footer), out of four', 'Images without alt', 'Buttons made of div and span', 'Form fields without a label', 'Scripts', 'Third-party servers (where scripts and images lie)', 'Elements on the page', 'Size of the markup, bytes'],
			verdict: 'It is worth drawing the conclusion yourself: no kind won on every row. A block builder is cleaner in its markup but less free. Code on request is free but brings other people’s scripts and “buttons” made of div. An application is the most powerful and drags in a database that has to be thought about separately.'
		}
	});

	let b = $state<Brief>(W.fallback);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			b = {
				name: p.name || b.name,
				who: p.who || b.who,
				sections: p.sections?.length ? p.sections.slice(0, 4) : b.sections,
				items: p.items?.length ? p.items.slice(0, 3).map((i) => ({ title: i.title, text: i.text })) : b.items,
				action: p.mainAction?.label || b.action
			};
		} catch {
			/* the example stays */
		}
	});
	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	const html: Record<string, (x: Brief) => string> = {
		code: (x) => `<div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
  <div class="container mx-auto px-6 py-24 text-center">
    <h1 class="text-6xl font-bold">${esc(W.codeTitle(x.name))}</h1>
    <p class="mt-6 text-xl">${esc(x.who)}</p>
    <div class="mt-10 rounded-full bg-white px-8 py-4 text-indigo-700 shadow-2xl" onclick="start()">${W.cta}</div>
  </div>
  <div class="grid grid-cols-3 gap-8 px-6 pb-24">
    <div class="rounded-2xl bg-white/10 p-8 shadow-xl"><span>🚀</span><h3>${W.cards[0][0]}</h3><p>${W.cards[0][1]}</p></div>
    <div class="rounded-2xl bg-white/10 p-8 shadow-xl"><span>⚡</span><h3>${W.cards[1][0]}</h3><p>${W.cards[1][1]}</p></div>
    <div class="rounded-2xl bg-white/10 p-8 shadow-xl"><span>💎</span><h3>${W.cards[2][0]}</h3><p>${W.cards[2][1]}</p></div>
  </div>
  <img src="https://images.example-stock.com/team.jpg">
  <script src="https://cdn.example-cdn.com/tailwind.js"><\/script>
  <script>function start(){location.href='#contact'}<\/script>
</div>`,
		blocks: (x) => `<header><nav aria-label="${W.sectionsLabel}">${x.sections.map((s) => `<a href="#${esc(s)}">${esc(s)}</a>`).join('')}</nav></header>
<main>
  <section class="cover"><h1>${esc(x.name)}</h1><p>${esc(x.who)}</p><a class="btn" href="#form">${esc(x.action)}</a></section>
  ${x.items.map((i) => `<section><h2>${esc(i.title)}</h2><p>${esc(i.text)}</p></section>`).join('\n  ')}
  <section id="form"><h2>${esc(x.action)}</h2><form action="/send" method="post"><label>${W.nameField} <input name="name"></label><label>${W.phoneField} <input name="phone"></label><button>${esc(x.action)}</button></form></section>
</main>
<footer>${esc(x.name)}</footer>
<script src="/platform/runtime.js"><\/script>`,
		app: (x) => `<div id="root">
  <div class="app">
    <div class="topbar"><span class="logo">${esc(x.name)}</span><span onclick="login()">${W.login}</span></div>
    <h1>${esc(x.who)}</h1>
    <div class="list">${x.items.map((i) => `<div class="card" onclick="open('${esc(i.title)}')"><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div>`).join('')}</div>
    <form id="f"><input placeholder="${W.nameField}"><input placeholder="${W.phoneField}"><div class="btn" onclick="submit()">${esc(x.action)}</div></form>
  </div>
</div>
<script src="https://cdn.example-cdn.com/react.js"><\/script>
<script src="https://cdn.example-cdn.com/supabase.js"><\/script>
<script>const url='https://project.example-db.com'; const key='public-anon-key'; function submit(){ /* … */ }<\/script>
<script src="/bundle.js"><\/script>`
	};
	const kinds: Kind[] = W.kinds.map((k) => ({ ...k, html: html[k.id] }));

	let sel = $state('code');
	const k = $derived(kinds.find((x) => x.id === sel)!);

	function measure(html: string) {
		const d = new DOMParser().parseFromString(html, 'text/html');
		const q = (s: string) => d.querySelectorAll(s).length;
		const hosts = new Set<string>();
		d.querySelectorAll('[src],[href]').forEach((e) => {
			const u = e.getAttribute('src') ?? e.getAttribute('href') ?? '';
			const m = u.match(/^https?:\/\/([^/]+)/);
			if (m) hosts.add(m[1]);
		});
		const fields = d.querySelectorAll('input:not([type=hidden]),textarea,select');
		let unlabelled = 0;
		fields.forEach((f) => {
			const id = f.getAttribute('id');
			if (!f.closest('label') && !f.getAttribute('aria-label') && !(id && d.querySelector(`label[for="${id}"]`))) unlabelled++;
		});
		return {
			h1: q('h1'),
			headings: q('h1,h2,h3,h4'),
			landmarks: ['header', 'nav', 'main', 'footer'].filter((t) => q(t)).length,
			noAlt: q('img:not([alt])'),
			fakeButtons: q('div[onclick],span[onclick]'),
			unlabelled,
			scripts: q('script'),
			thirdParty: hosts.size,
			nodes: d.body.querySelectorAll('*').length,
			bytes: new TextEncoder().encode(html).length
		};
	}
	// DOMParser exists only in the browser, so the numbers are counted after mount (not while the page is prerendered)
	let rows = $state<{ k: (typeof kinds)[number]; m: ReturnType<typeof measure> }[]>([]);
	$effect(() => {
		rows = kinds.map((x) => ({ k: x, m: measure(x.html(b)) }));
	});
	const shown = $derived(k.html(b));
	const cols: [string, (m: ReturnType<typeof measure>) => string, (m: ReturnType<typeof measure>) => boolean][] = [
		[W.cols[0], (m) => String(m.h1), (m) => m.h1 === 1],
		[W.cols[1], (m) => String(m.landmarks), (m) => m.landmarks >= 3],
		[W.cols[2], (m) => String(m.noAlt), (m) => m.noAlt === 0],
		[W.cols[3], (m) => String(m.fakeButtons), (m) => m.fakeButtons === 0],
		[W.cols[4], (m) => String(m.unlabelled), (m) => m.unlabelled === 0],
		[W.cols[5], (m) => String(m.scripts), (m) => m.scripts <= 1],
		[W.cols[6], (m) => String(m.thirdParty), (m) => m.thirdParty === 0],
		[W.cols[7], (m) => String(m.nodes), () => true],
		[W.cols[8], (m) => String(m.bytes), () => true]
	];
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out"><strong>{W.important}</strong> {W.disclaimer}</p>
	<div class="dg-ctl" role="group" aria-label={W.kindLabel}>
		{#each kinds as x (x.id)}<button type="button" aria-pressed={sel === x.id} onclick={() => (sel = x.id)}>{x.name}</button>{/each}
	</div>
	<p class="dg-out">{k.like}. <strong>{W.price}</strong> {k.cost}. <strong>{W.exit}</strong> {k.leave}.</p>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
	<pre class="dg-box dg-mono code" tabindex="0" aria-label={W.markup}>{shown}</pre>

	<table>
		<caption>{W.counted}</caption>
		<thead><tr><th scope="col">{W.feature}</th>{#each kinds as x (x.id)}<th scope="col">{x.name.split(':')[0]}</th>{/each}</tr></thead>
		<tbody>
			{#each cols as c, i (i)}
				<tr><th scope="row">{c[0]}</th>{#each rows as r (r.k.id)}<td class:bad={!c[2](r.m)}>{c[1](r.m)}{c[2](r.m) ? '' : W.bad}</td>{/each}</tr>
			{/each}
		</tbody>
	</table>
	<p class="dg-out">{W.verdict}</p>
</figure>

<style>
	.code {
		max-height: 18rem;
		overflow: auto;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 0.8em;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: var(--space-3);
	}
	caption {
		text-align: left;
		color: var(--text-secondary);
		padding-bottom: var(--space-2);
	}
	th,
	td {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-2);
		text-align: left;
		vertical-align: top;
	}
	td.bad {
		border-left: 4px solid var(--text-primary);
	}
</style>
