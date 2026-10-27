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

	type Brief = { name: string; who: string; sections: string[]; items: { title: string; text: string }[]; action: string };
	let b = $state<Brief>({
		name: 'Мой проект',
		who: 'Что делает проект',
		sections: ['О проекте', 'Услуги', 'Контакты'],
		items: [{ title: 'Первая услуга', text: 'Что это.' }, { title: 'Вторая услуга', text: 'Что это.' }],
		action: 'Оставить заявку'
	});
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

	const kinds = [
		{
			id: 'code',
			name: 'Тип А: код по запросу',
			like: 'так обычно устроены генераторы кода по описанию',
			cost: 'платите за вычисления: каждая правка тратит кредиты, итоговая цена заранее неизвестна',
			leave: 'код можно забрать в репозиторий и держать где угодно',
			html: (x: Brief) => `<div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
  <div class="container mx-auto px-6 py-24 text-center">
    <h1 class="text-6xl font-bold">${esc(x.name)}: инновационные решения</h1>
    <p class="mt-6 text-xl">${esc(x.who)}</p>
    <div class="mt-10 rounded-full bg-white px-8 py-4 text-indigo-700 shadow-2xl" onclick="start()">Get Started</div>
  </div>
  <div class="grid grid-cols-3 gap-8 px-6 pb-24">
    <div class="rounded-2xl bg-white/10 p-8 shadow-xl"><span>🚀</span><h3>Качество</h3><p>Надёжный партнёр для вашего бизнеса</p></div>
    <div class="rounded-2xl bg-white/10 p-8 shadow-xl"><span>⚡</span><h3>Скорость</h3><p>Индивидуальный подход к каждому</p></div>
    <div class="rounded-2xl bg-white/10 p-8 shadow-xl"><span>💎</span><h3>Инновации</h3><p>Нам доверяют 10 000+ клиентов</p></div>
  </div>
  <img src="https://images.example-stock.com/team.jpg">
  <script src="https://cdn.example-cdn.com/tailwind.js"><\/script>
  <script>function start(){location.href='#contact'}<\/script>
</div>`
		},
		{
			id: 'blocks',
			name: 'Тип Б: блоки и шаблоны',
			like: 'так обычно устроены блочные конструкторы с ИИ',
			cost: 'платите тариф за сайт; ИИ входит в тариф или в лимиты, цена предсказуема',
			leave: 'часто только на дорогом тарифе, а формы и корзина могут остаться привязаны к платформе',
			html: (x: Brief) => `<header><nav aria-label="Разделы">${x.sections.map((s) => `<a href="#${esc(s)}">${esc(s)}</a>`).join('')}</nav></header>
<main>
  <section class="cover"><h1>${esc(x.name)}</h1><p>${esc(x.who)}</p><a class="btn" href="#form">${esc(x.action)}</a></section>
  ${x.items.map((i) => `<section><h2>${esc(i.title)}</h2><p>${esc(i.text)}</p></section>`).join('\n  ')}
  <section id="form"><h2>${esc(x.action)}</h2><form action="/send" method="post"><label>Имя <input name="name"></label><label>Телефон <input name="phone"></label><button>${esc(x.action)}</button></form></section>
</main>
<footer>${esc(x.name)}</footer>
<script src="/platform/runtime.js"><\/script>`
		},
		{
			id: 'app',
			name: 'Тип В: приложение с серверной частью',
			like: 'так обычно устроены генераторы целого приложения с базой и входом',
			cost: 'платите за генератор и отдельно за базу и хостинг, которые он подключает',
			leave: 'код забрать можно, но база и вход остаются у стороннего сервиса, который нужно перенести',
			html: (x: Brief) => `<div id="root">
  <div class="app">
    <div class="topbar"><span class="logo">${esc(x.name)}</span><span onclick="login()">Войти</span></div>
    <h1>${esc(x.who)}</h1>
    <div class="list">${x.items.map((i) => `<div class="card" onclick="open('${esc(i.title)}')"><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div>`).join('')}</div>
    <form id="f"><input placeholder="Имя"><input placeholder="Телефон"><div class="btn" onclick="submit()">${esc(x.action)}</div></form>
  </div>
</div>
<script src="https://cdn.example-cdn.com/react.js"><\/script>
<script src="https://cdn.example-cdn.com/supabase.js"><\/script>
<script>const url='https://project.example-db.com'; const key='public-anon-key'; function submit(){ /* … */ }<\/script>
<script src="/bundle.js"><\/script>`
		}
	];

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
		['Заголовок первого уровня (h1)', (m) => String(m.h1), (m) => m.h1 === 1],
		['Смысловые части страницы (header, nav, main, footer), из четырёх', (m) => String(m.landmarks), (m) => m.landmarks >= 3],
		['Картинки без alt', (m) => String(m.noAlt), (m) => m.noAlt === 0],
		['Кнопки, сделанные из div и span', (m) => String(m.fakeButtons), (m) => m.fakeButtons === 0],
		['Поля формы без подписи', (m) => String(m.unlabelled), (m) => m.unlabelled === 0],
		['Скриптов', (m) => String(m.scripts), (m) => m.scripts <= 1],
		['Чужих серверов (где лежат скрипты и картинки)', (m) => String(m.thirdParty), (m) => m.thirdParty === 0],
		['Элементов на странице', (m) => String(m.nodes), () => true],
		['Размер разметки, байт', (m) => String(m.bytes), () => true]
	];
</script>

<figure class="dg">
	<figcaption>Один бриф, три вида конструкторов</figcaption>
	<p class="dg-out"><strong>Важно.</strong> Эти три страницы написаны для урока по типичным приметам трёх видов инструментов. Это не выдача какого-либо настоящего сервиса: настоящие выдачи другие и меняются каждый месяц. Но числа в таблице посчитаны по-настоящему, и так же можно измерить любую страницу, которую вы получите.</p>
	<div class="dg-ctl" role="group" aria-label="Вид конструктора">
		{#each kinds as x (x.id)}<button type="button" aria-pressed={sel === x.id} onclick={() => (sel = x.id)}>{x.name}</button>{/each}
	</div>
	<p class="dg-out">{k.like}. <strong>Цена:</strong> {k.cost}. <strong>Выход:</strong> {k.leave}.</p>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex: a scrollable region must be reachable by keyboard -->
	<pre class="dg-box dg-mono code" tabindex="0" aria-label="Разметка страницы">{shown}</pre>

	<table>
		<caption>Что посчитано по разметке</caption>
		<thead><tr><th scope="col">Признак</th>{#each kinds as x (x.id)}<th scope="col">{x.name.split(':')[0]}</th>{/each}</tr></thead>
		<tbody>
			{#each cols as c, i (i)}
				<tr><th scope="row">{c[0]}</th>{#each rows as r (r.k.id)}<td class:bad={!c[2](r.m)}>{c[1](r.m)}{c[2](r.m) ? '' : ' (плохо)'}</td>{/each}</tr>
			{/each}
		</tbody>
	</table>
	<p class="dg-out">Вывод стоит сделать самому: ни один вид не победил по всем строкам. Блочный конструктор чище по разметке, но менее свободен. Код по запросу свободен, но приносит чужие скрипты и «кнопки» из div. Приложение мощнее всех и тянет за собой базу, о которой надо думать отдельно.</p>
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
