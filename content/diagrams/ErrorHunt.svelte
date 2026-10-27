<!--
	«Найдите ошибки» (part 16, lesson 4). A page that an AI «wrote» is shown as a list of its
	elements, a dozen of them wrong in the ways AI pages usually are (an invented claim, an
	invented review, an image without alt, a control made of a div, a key in the code, a form that
	sends by http and by GET, fields without labels, no consent, an English button, a slogan, a stock
	picture from a third-party host) and a few that are right. The person marks what they think is
	wrong; the page then counts what they found, what they missed and what they flagged without
	cause, and says for each error why it is one and how it is fixed. Honest limits: the page is a
	constructed example, not the output of a real tool. Elements are keyed by index.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let name = $state('Проект');
	let who = $state('Что делает проект');
	let action = $state('Оставить заявку');
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			name = p.name || name;
			who = p.who || who;
			action = p.mainAction?.label || action;
		} catch {
			/* the example stays */
		}
	});

	type El = { code: string; bad: boolean; why: string; fix: string };
	const els = $derived<El[]>([
		{ code: `<h1>${name}: инновационные решения для вашего бизнеса</h1>`, bad: true, why: 'Лозунг вместо сути: подходит любому и ничего не обещает.', fix: `Назвать, что вы делаете и для кого: «${who}».` },
		{ code: '<p class="claim">Более 15 лет опыта, 1200+ довольных клиентов, 99,9 % успешных дел</p>', bad: true, why: 'Цифры выдуманы: в брифе их нет. Это ложное утверждение о вас, а в профессиях с рекламными ограничениями ещё и нарушение.', fix: 'Заменить подтверждениями из брифа (документы, членство) или убрать.' },
		{ code: '<blockquote>«Лучший специалист, которого я встречал!» Иван, директор</blockquote>', bad: true, why: 'Вымышленный отзыв без фамилии и компании. Выдуманные отзывы вводят в заблуждение.', fix: 'Удалить. Настоящий отзыв: только с согласия автора и с проверяемыми данными.' },
		{ code: '<img src="https://images.example-stock.com/team.jpg" width="320" height="200">', bad: true, why: 'Нет alt, а картинка с чужого сервера: лицензия неизвестна, посетитель отправляет запрос третьему лицу.', fix: 'Своя фотография или убрать; у содержательной картинки alt, у декоративной alt="".' },
		{ code: `<div class="btn" onclick="go()">Get Started</div>`, bad: true, why: 'Кнопка из div: не берётся клавишей Tab, не читается как кнопка. Подпись по-английски на русской странице.', fix: `<a class="button" href="#form">${action}</a>` },
		{ code: 'const API_KEY = "sk-live-9f2c7a41e5b84d3aa1c0";', bad: true, why: 'Секретный ключ в коде страницы: его увидит любой, кто откроет исходный код. Ключ считается утёкшим.', fix: 'Удалить, выпустить новый ключ; запросы к сервису делать с сервера или через функцию, где ключ в настройках.' },
		{ code: '<form action="http://api.example.ru/leads" method="get">', bad: true, why: 'Данные уходят по http (их можно прочитать по дороге) и методом GET (попадают в адрес, историю и журналы).', fix: '<form action="https://…" method="post">' },
		{ code: '<input name="phone" placeholder="Телефон">', bad: true, why: 'Поле без подписи: placeholder исчезает при вводе и не заменяет label; программа чтения с экрана не назовёт поле.', fix: '<label for="f-phone">Телефон</label> и у поля id="f-phone".' },
		{ code: '<button type="submit">Отправить</button>', bad: true, why: 'Рядом нет ни согласия на обработку персональных данных, ни ссылки на политику: форма собирает данные без оснований по 152-ФЗ.', fix: 'Добавить флажок согласия (required) и ссылку на политику.' },
		{ code: '<html><head><title>Главная</title></head>', bad: true, why: 'Нет атрибута lang у html и нет описания страницы: программы чтения с экрана выберут язык наугад, а название «Главная» одинаково у тысяч сайтов.', fix: '<html lang="ru"> и название с именем и сутью.' },
		{ code: '<header><nav aria-label="Разделы"><a href="#sec-1">…</a></nav></header>', bad: false, why: 'Смысловая разметка с подписанной навигацией.', fix: '' },
		{ code: `<main><h2>${action}</h2><label for="f-name">Имя</label><input id="f-name" name="name" required></main>`, bad: false, why: 'Поле с подписью и атрибутом required: верно.', fix: '' },
		{ code: '<footer><a href="/politika/">Политика обработки данных</a></footer>', bad: false, why: 'Ссылка на политику в подвале: верно.', fix: '' },
		{ code: '<img src="/images/portrait.jpg" alt="Портрет специалиста" width="320" height="240">', bad: false, why: 'Свой файл, содержательное alt, размеры заданы: верно.', fix: '' }
	]);

	let marked = $state<Record<number, boolean>>({});
	let shown = $state(false);
	const bad = $derived(els.map((e, i) => (e.bad ? i : -1)).filter((i) => i >= 0));
	const found = $derived(bad.filter((i) => marked[i]).length);
	const missed = $derived(bad.length - found);
	const falseAlarm = $derived(els.filter((e, i) => !e.bad && marked[i]).length);
</script>

<figure class="dg">
	<figcaption>Страница, которую «написал ИИ»: найдите, что в ней не так</figcaption>
	<p class="dg-out">Отметьте строки, которые считаете ошибкой. Потом нажмите «Показать итоги». Среди строк есть и правильные: отметка без причины тоже ошибка.</p>
	<ol class="list">
		{#each els as e, i (i)}
			<li class:bad={shown && e.bad} class:good={shown && !e.bad}>
				<label>
					<input type="checkbox" checked={!!marked[i]} disabled={shown} onchange={(ev) => (marked[i] = ev.currentTarget.checked)} />
					<code class="dg-mono">{e.code}</code>
				</label>
				{#if shown}
					<p class="why"><strong>{e.bad ? (marked[i] ? 'Найдено.' : 'Пропущено.') : marked[i] ? 'Ложная тревога.' : 'Верно, не трогали.'}</strong> {e.why}{e.fix ? ` Исправление: ${e.fix}` : ''}</p>
				{/if}
			</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" disabled={shown} onclick={() => (shown = true)}>Показать итоги</button>
		<button type="button" onclick={() => ((marked = {}), (shown = false))}>Сначала</button>
	</div>
	{#if shown}
		<p class="dg-out" aria-live="polite">Найдено ошибок: <strong>{found} из {bad.length}</strong>. Пропущено: <strong>{missed}</strong>. Ложных тревог: <strong>{falseAlarm}</strong>.</p>
	{/if}
</figure>

<style>
	.list {
		padding-left: var(--space-5);
		display: grid;
		gap: var(--space-2);
	}
	.list li {
		padding: var(--space-2);
		border-left: 4px solid var(--border-rule);
		background: var(--surface-canvas);
	}
	.list li.bad {
		border-left-color: var(--text-primary);
	}
	.list li.good {
		border-left-color: var(--accent-measure);
	}
	label {
		align-items: flex-start;
	}
	code {
		overflow-wrap: anywhere;
	}
	.why {
		margin: var(--space-2) 0 0;
		color: var(--text-secondary);
	}
</style>
