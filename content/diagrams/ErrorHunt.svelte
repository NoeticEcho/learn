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
	import { pick } from '#lib/i18n/index.ts';

	type El = { code: string; bad: boolean; why: string; fix: string };

	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»).
	// The constructed page is an English one in the English edition: its tells and its law are its own.
	const W = pick({
		ru: {
			fallback: { name: 'Проект', who: 'Что делает проект', action: 'Оставить заявку' },
			els: (name: string, who: string, action: string): El[] => [
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
			],
			caption: 'Страница, которую «написал ИИ»: найдите, что в ней не так',
			intro: 'Отметьте строки, которые считаете ошибкой. Потом нажмите «Показать итоги». Среди строк есть и правильные: отметка без причины тоже ошибка.',
			foundL: 'Найдено.', missedL: 'Пропущено.', falseL: 'Ложная тревога.', rightL: 'Верно, не трогали.',
			fixL: ' Исправление: ',
			showBtn: 'Показать итоги',
			again: 'Сначала',
			found: 'Найдено ошибок:',
			of: 'из',
			missed: 'Пропущено:',
			falseAlarm: 'Ложных тревог:'
		},
		en: {
			fallback: { name: 'Project', who: 'What the project does', action: 'Get in touch' },
			els: (name: string, who: string, action: string): El[] => [
				{ code: `<h1>${name}: innovative solutions for your business</h1>`, bad: true, why: 'A slogan instead of substance: it fits anyone and promises nothing.', fix: `Say what you do and for whom: “${who}”.` },
				{ code: '<p class="claim">More than 15 years of experience, 1,200+ satisfied clients, 99.9% of cases won</p>', bad: true, why: 'The numbers are invented: the brief has none. It is a false claim about you, and in advertising it can break the rules on misleading claims.', fix: 'Replace with proof from the brief (documents, memberships) or remove.' },
				{ code: '<blockquote>“The best specialist I’ve ever met!” John, director</blockquote>', bad: true, why: 'A made-up review with no surname and no company. Fake reviews mislead, and the FTC’s rule on reviews bans them, AI-generated ones included.', fix: 'Delete it. A real review: only with the author’s consent and with details that can be checked.' },
				{ code: '<img src="https://images.example-stock.com/team.jpg" width="320" height="200">', bad: true, why: 'There is no alt, and the picture comes from another server: the license is unknown, and the visitor sends a request to a third party.', fix: 'Your own photo, or remove it; a meaningful image gets alt, a decorative one alt="".' },
				{ code: `<div class="btn" onclick="go()">Get Started</div>`, bad: true, why: 'A button made of a div: Tab can’t reach it, and it isn’t read as a button. A stock label that names no action.', fix: `<a class="button" href="#form">${action}</a>` },
				{ code: 'const API_KEY = "sk-live-9f2c7a41e5b84d3aa1c0";', bad: true, why: 'A secret key in the page’s code: anyone who opens the source will see it. The key counts as leaked.', fix: 'Delete it and issue a new key; make requests to the service from a server or a function where the key is in the settings.' },
				{ code: '<form action="http://api.example.com/leads" method="get">', bad: true, why: 'The data goes over http (it can be read on the way) and by GET (it ends up in the address, the history and the logs).', fix: '<form action="https://…" method="post">' },
				{ code: '<input name="phone" placeholder="Phone">', bad: true, why: 'A field with no label: a placeholder disappears when you type and is no substitute for a label; a screen reader won’t name the field.', fix: '<label for="f-phone">Phone</label> and the field gets id="f-phone".' },
				{ code: '<button type="submit">Send</button>', bad: true, why: 'Beside it there is neither a notice on how personal data is used nor a link to the privacy policy: the form collects data without telling people what happens to it, which privacy laws such as the GDPR and California’s CCPA require.', fix: 'Add a link to the privacy policy and, where consent is your basis, a required consent checkbox.' },
				{ code: '<html><head><title>Home</title></head>', bad: true, why: 'The html element has no lang attribute and the page has no description: screen readers will guess the language, and the title “Home” is the same on thousands of sites.', fix: '<html lang="en"> and a title with your name and what you do.' },
				{ code: '<header><nav aria-label="Sections"><a href="#sec-1">…</a></nav></header>', bad: false, why: 'Meaningful markup with a labeled navigation.', fix: '' },
				{ code: `<main><h2>${action}</h2><label for="f-name">Name</label><input id="f-name" name="name" required></main>`, bad: false, why: 'A field with a label and the required attribute: right.', fix: '' },
				{ code: '<footer><a href="/privacy/">Privacy policy</a></footer>', bad: false, why: 'A link to the policy in the footer: right.', fix: '' },
				{ code: '<img src="/images/portrait.jpg" alt="Portrait of the specialist" width="320" height="240">', bad: false, why: 'Your own file, a meaningful alt, the size set: right.', fix: '' }
			],
			caption: 'A page an AI “wrote”: find what is wrong with it',
			intro: 'Mark the lines you think are mistakes. Then press “Show the results”. Some lines are right: marking one without a reason is a mistake too.',
			foundL: 'Found.', missedL: 'Missed.', falseL: 'A false alarm.', rightL: 'Right, left alone.',
			fixL: ' The fix: ',
			showBtn: 'Show the results',
			again: 'Start over',
			found: 'Mistakes found:',
			of: 'of',
			missed: 'Missed:',
			falseAlarm: 'False alarms:'
		}
	});

	let name = $state(W.fallback.name);
	let who = $state(W.fallback.who);
	let action = $state(W.fallback.action);
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

	const els = $derived<El[]>(W.els(name, who, action));

	let marked = $state<Record<number, boolean>>({});
	let shown = $state(false);
	const bad = $derived(els.map((e, i) => (e.bad ? i : -1)).filter((i) => i >= 0));
	const found = $derived(bad.filter((i) => marked[i]).length);
	const missed = $derived(bad.length - found);
	const falseAlarm = $derived(els.filter((e, i) => !e.bad && marked[i]).length);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>
	<ol class="list">
		{#each els as e, i (i)}
			<li class:bad={shown && e.bad} class:good={shown && !e.bad}>
				<label>
					<input type="checkbox" checked={!!marked[i]} disabled={shown} onchange={(ev) => (marked[i] = ev.currentTarget.checked)} />
					<code class="dg-mono">{e.code}</code>
				</label>
				{#if shown}
					<p class="why"><strong>{e.bad ? (marked[i] ? W.foundL : W.missedL) : marked[i] ? W.falseL : W.rightL}</strong> {e.why}{e.fix ? `${W.fixL}${e.fix}` : ''}</p>
				{/if}
			</li>
		{/each}
	</ol>
	<div class="dg-ctl">
		<button type="button" disabled={shown} onclick={() => (shown = true)}>{W.showBtn}</button>
		<button type="button" onclick={() => ((marked = {}), (shown = false))}>{W.again}</button>
	</div>
	{#if shown}
		<p class="dg-out" aria-live="polite">{W.found} <strong>{found} {W.of} {bad.length}</strong>. {W.missed} <strong>{missed}</strong>. {W.falseAlarm} <strong>{falseAlarm}</strong>.</p>
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
