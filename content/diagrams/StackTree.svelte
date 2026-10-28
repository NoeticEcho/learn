<!--
	«Дерево выбора» (part 8, lesson 8). Five questions about a project (who edits, how often, what
	besides pages, budget, languages) and a recommendation: a stack, why, what it costs, where it
	breaks, two options set aside with reasons, and when to reconsider. Buttons load the answers of
	the course's template projects. The rules are the lesson's judgement, kept simple on purpose.
-->
<script lang="ts">
	import './shared.css';
	import { pick as words } from '#lib/i18n/index.ts';

	type Who = 'owner' | 'editor' | 'dev';
	type Freq = 'rare' | 'month' | 'week' | 'day';
	type Extra = 'none' | 'form' | 'shop' | 'account';
	type Budget = 'min' | 'mid' | 'free';
	type Langs = 'one' | 'two' | 'many';
	let who = $state<Who>('owner');
	let freq = $state<Freq>('month');
	let extra = $state<Extra>('form');
	let budget = $state<Budget>('min');
	let langs = $state<Langs>('one');

	type Stack = 'tilda' | 'wp' | 'bitrix' | 'ssg' | 'headless' | 'app';
	type Info = Record<Stack, { name: string; why: string; cost: string; breaks: string; reject: string }>;
	const W = words({
		ru: {
			info: {
				tilda: { name: 'Конструктор (Tilda)', why: 'сайт небольшой, правит сам владелец, а форма заявки встроена', cost: 'подписка каждый год, обслуживания нет', breaks: 'экспорт кода зависит от тарифа, много языков и своя логика тесны', reject: 'тесно, когда сайт растёт: свой код и многоязычие неудобны' },
				wp: { name: 'WordPress', why: 'нужна админка для редактора и много готовых плагинов', cost: 'хостинг, плагины и время на обновления (урок 3)', breaks: 'обновления, конфликты плагинов, защита от взлома', reject: 'обслуживание и защита ложатся на вас, а выгоды не хватает ради этого' },
				bitrix: { name: '1С-Битрикс', why: 'большой каталог, обмен с 1С и команда с разработчиком', cost: 'лицензия, хостинг и разработчик', breaks: 'дорого для малого проекта, нужны специалисты', reject: 'лицензия и разработчик слишком дороги для такого проекта' },
				ssg: { name: 'Генератор статики и Markdown', why: 'содержание меняется редко, правит разработчик, нужно быстро и безопасно', cost: 'почти бесплатный хостинг, работа разработчика', breaks: 'редактору без Git неудобно, динамика только из сервисов', reject: 'редактору без технических знаний неудобно править файлы' },
				headless: { name: 'Headless CMS + генератор', why: 'правят часто и разные люди, а сайт строит разработчик', cost: 'две системы: CMS и сайт, плюс сборка', breaks: 'сложнее в настройке, предпросмотр нужно делать', reject: 'две системы сложнее одной, если правок мало' },
				app: { name: 'Веб-приложение со своей базой', why: 'нужны личные кабинеты и данные, которые меняются на ходу', cost: 'разработка и обслуживание сервера, данные и защита на вас', breaks: 'дольше и дороже всего; нужна команда', reject: 'для сайта-визитки это избыточно' }
			} as Info,
			noteMany: 'Много языков на конструкторе делают копиями страниц: следите, чтобы цена и телефон не разошлись.',
			noteSome: 'Языки: храните тексты полем на каждый язык или переводом записи (урок 1).',
			revisit: {
				tilda: 'Пересмотрю, когда понадобится своя логика, личный кабинет или цена подписки превысит цену хостинга.',
				wp: 'Пересмотрю, если обслуживание станет дороже выгоды или правки почти прекратятся (тогда хватит статики).',
				ssg: 'Пересмотрю, когда содержание начнут править люди без Git.',
				headless: 'Пересмотрю, если правок станет мало: тогда одна система проще.',
				bitrix: 'Пересмотрю, если обмен с 1С перестанет быть нужен.',
				app: 'Пересмотрю, если кабинет окажется ненужным: часть проекта вернётся в статику.'
			} as Record<Stack, string>,
			presets: ['Портфолио', 'Кафе или салон', 'Эксперт на двух языках', 'Небольшой магазин', 'Магазин с 1С', 'Документация для разработчиков', 'Сервис с кабинетом'],
			caption: 'Пять вопросов о вашем проекте',
			intro: 'Простые правила, чтобы увидеть логику выбора. Готовые проекты подставляют типичные ответы.',
			ready: 'Готовые проекты',
			q: ['1. Кто правит содержание', '2. Как часто', '3. Что нужно кроме страниц', '4. Бюджет', '5. Языки'],
			who: ['владелец сам', 'редактор в команде', 'разработчик'],
			freq: ['раз в полгода', 'раз в месяц', 'раз в неделю', 'каждый день'],
			extra: ['ничего', 'форма заявки', 'магазин', 'личный кабинет'],
			budget: ['минимальный', 'умеренный', 'свободный'],
			langs: ['один', 'два', 'много'],
			fits: 'Подходит:',
			why: 'Почему:',
			cost: 'Цена:',
			breaks: 'Где ломается:',
			languages: 'Языки:',
			rejected: 'Отвергнуты:',
			revisitLabel: 'Когда пересмотреть:',
			alt: 'Текстовая альтернатива:',
			altText:
				'по пяти ответам (кто правит, как часто, что нужно кроме страниц, бюджет, число языков) схема предлагает один из вариантов: конструктор, WordPress, Битрикс, генератор статики, headless CMS или веб-приложение. К выбору она называет цену, место, где вариант ломается, два отвергнутых варианта с причинами и условие пересмотра решения.'
		},
		en: {
			info: {
				tilda: { name: 'A website builder (Wix, Squarespace)', why: 'the site is small, the owner edits it, and a contact form is built in', cost: 'a subscription every year, nothing to maintain', breaks: 'code export depends on the plan, and many languages or custom logic are a tight fit', reject: 'it gets cramped as the site grows: custom code and several languages are awkward' },
				wp: { name: 'WordPress', why: 'an editor needs an admin, and many ready-made plugins help', cost: 'hosting, plugins and time for updates (lesson 3)', breaks: 'updates, plugin conflicts, protection from break-ins', reject: 'upkeep and security fall on you, and the gain does not justify them' },
				bitrix: { name: 'A commerce platform (Shopify, Magento)', why: 'a big catalog, syncing with back-office systems, and a team with a developer', cost: 'a plan or license, hosting and a developer', breaks: 'costly for a small project, and it needs specialists', reject: 'the plan and the developer cost too much for a project like this' },
				ssg: { name: 'A static site generator and Markdown', why: 'the content rarely changes, a developer edits it, and speed and safety matter', cost: 'nearly free hosting, plus the developer’s time', breaks: 'awkward for an editor without Git, and anything dynamic comes from services', reject: 'an editor without technical skills will find editing files awkward' },
				headless: { name: 'A headless CMS plus a generator', why: 'edits are frequent and come from different people, while a developer builds the site', cost: 'two systems, the CMS and the site, plus a build', breaks: 'harder to set up, and previews have to be built', reject: 'two systems are harder than one when edits are few' },
				app: { name: 'A web app with its own database', why: 'it needs user accounts and data that changes on the fly', cost: 'development and server upkeep, with data and security on you', breaks: 'the longest and costliest path, and it needs a team', reject: 'overkill for a business-card site' }
			} as Info,
			noteMany: 'On a website builder, many languages mean copies of pages: make sure a price and a phone number do not drift apart.',
			noteSome: 'Languages: store the texts as a field per language or as a translation of the entry (lesson 1).',
			revisit: {
				tilda: 'I’ll reconsider when custom logic or user accounts are needed, or when the subscription costs more than hosting.',
				wp: 'I’ll reconsider if upkeep becomes costlier than the benefit, or if edits nearly stop (then static files are enough).',
				ssg: 'I’ll reconsider when people without Git start editing the content.',
				headless: 'I’ll reconsider if edits become rare: then one system is simpler.',
				bitrix: 'I’ll reconsider if syncing with the back office is no longer needed.',
				app: 'I’ll reconsider if accounts turn out to be unnecessary: part of the project goes back to static.'
			} as Record<Stack, string>,
			presets: ['Portfolio', 'Café or salon', 'Expert in two languages', 'Small shop', 'Shop synced with a back office', 'Documentation for developers', 'A service with accounts'],
			caption: 'Five questions about your project',
			intro: 'Simple rules, to show the logic of choosing. The ready-made projects fill in typical answers.',
			ready: 'Ready-made projects',
			q: ['1. Who edits the content', '2. How often', '3. What is needed besides pages', '4. Budget', '5. Languages'],
			who: ['the owner', 'an editor on a team', 'a developer'],
			freq: ['twice a year', 'once a month', 'once a week', 'every day'],
			extra: ['nothing', 'a contact form', 'a shop', 'user accounts'],
			budget: ['minimal', 'moderate', 'generous'],
			langs: ['one', 'two', 'many'],
			fits: 'A good fit:',
			why: 'Why:',
			cost: 'Cost:',
			breaks: 'Where it breaks:',
			languages: 'Languages:',
			rejected: 'Set aside:',
			revisitLabel: 'When to reconsider:',
			alt: 'Text alternative:',
			altText:
				'from five answers (who edits, how often, what is needed besides pages, the budget, the number of languages) the tree suggests one option: a website builder, WordPress, a commerce platform, a static site generator, a headless CMS or a web app. With the choice it gives the cost, the place where the option breaks, two options set aside with reasons, and the condition for reconsidering.'
		}
	});
	const info = W.info;
	const pick = $derived.by<Stack>(() => {
		if (extra === 'account') return 'app';
		if (extra === 'shop') return budget === 'min' ? (who === 'owner' ? 'tilda' : 'wp') : who === 'dev' && budget === 'free' ? 'headless' : 'bitrix';
		if (who === 'dev') return freq === 'rare' || freq === 'month' ? 'ssg' : 'headless';
		if (who === 'owner') return budget === 'min' && langs !== 'many' ? 'tilda' : 'wp';
		return freq === 'day' && budget === 'free' && langs === 'many' ? 'headless' : 'wp';
	});
	const others = $derived((Object.keys(info) as Stack[]).filter((s) => s !== pick));
	const rejected = $derived(
		[
			(['tilda', 'wp', 'ssg'] as Stack[]).find((s) => s !== pick) as Stack,
			(['bitrix', 'headless', 'app'] as Stack[]).find((s) => s !== pick) as Stack
		]
	);
	const note = $derived(langs === 'many' && pick === 'tilda' ? W.noteMany : langs !== 'one' ? W.noteSome : '');
	const revisit = $derived(W.revisit[pick]);

	const presetAnswers: [Who, Freq, Extra, Budget, Langs][] = [
		['owner', 'month', 'form', 'min', 'one'],
		['owner', 'week', 'form', 'min', 'one'],
		['editor', 'month', 'form', 'mid', 'two'],
		['owner', 'week', 'shop', 'min', 'one'],
		['editor', 'day', 'shop', 'mid', 'one'],
		['dev', 'rare', 'none', 'min', 'one'],
		['dev', 'week', 'account', 'free', 'one']
	];
	const presets = presetAnswers.map((a, i) => ({ name: W.presets[i], a }));
	const load = (a: [Who, Freq, Extra, Budget, Langs]) => ([who, freq, extra, budget, langs] = a);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{W.intro}</p>
	<div class="dg-ctl" role="group" aria-label={W.ready}>
		{#each presets as p (p.name)}<button type="button" onclick={() => load(p.a)}>{p.name}</button>{/each}
	</div>
	<div class="q">
		<fieldset><legend>{W.q[0]}</legend>
			<label><input type="radio" bind:group={who} value="owner" /> {W.who[0]}</label>
			<label><input type="radio" bind:group={who} value="editor" /> {W.who[1]}</label>
			<label><input type="radio" bind:group={who} value="dev" /> {W.who[2]}</label>
		</fieldset>
		<fieldset><legend>{W.q[1]}</legend>
			<label><input type="radio" bind:group={freq} value="rare" /> {W.freq[0]}</label>
			<label><input type="radio" bind:group={freq} value="month" /> {W.freq[1]}</label>
			<label><input type="radio" bind:group={freq} value="week" /> {W.freq[2]}</label>
			<label><input type="radio" bind:group={freq} value="day" /> {W.freq[3]}</label>
		</fieldset>
		<fieldset><legend>{W.q[2]}</legend>
			<label><input type="radio" bind:group={extra} value="none" /> {W.extra[0]}</label>
			<label><input type="radio" bind:group={extra} value="form" /> {W.extra[1]}</label>
			<label><input type="radio" bind:group={extra} value="shop" /> {W.extra[2]}</label>
			<label><input type="radio" bind:group={extra} value="account" /> {W.extra[3]}</label>
		</fieldset>
		<fieldset><legend>{W.q[3]}</legend>
			<label><input type="radio" bind:group={budget} value="min" /> {W.budget[0]}</label>
			<label><input type="radio" bind:group={budget} value="mid" /> {W.budget[1]}</label>
			<label><input type="radio" bind:group={budget} value="free" /> {W.budget[2]}</label>
		</fieldset>
		<fieldset><legend>{W.q[4]}</legend>
			<label><input type="radio" bind:group={langs} value="one" /> {W.langs[0]}</label>
			<label><input type="radio" bind:group={langs} value="two" /> {W.langs[1]}</label>
			<label><input type="radio" bind:group={langs} value="many" /> {W.langs[2]}</label>
		</fieldset>
	</div>
	<div class="res" aria-live="polite">
		<div class="dh">{W.fits} {info[pick].name}</div>
		<p class="dg-out"><strong>{W.why}</strong> {info[pick].why}.</p>
		<p class="dg-out"><strong>{W.cost}</strong> {info[pick].cost}.</p>
		<p class="dg-out"><strong>{W.breaks}</strong> {info[pick].breaks}.</p>
		{#if note}<p class="dg-out"><strong>{W.languages}</strong> {note}</p>{/if}
		<p class="dg-out"><strong>{W.rejected}</strong> {info[rejected[0]].name}: {info[rejected[0]].reject}. {info[rejected[1]].name}: {info[rejected[1]].reject}.</p>
		<p class="dg-out"><strong>{W.revisitLabel}</strong> {revisit}</p>
	</div>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.q {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--space-3);
		margin: var(--space-3) 0;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		display: grid;
		align-content: start;
	}
	legend {
		padding: 0;
		color: var(--text-primary);
	}
	.res {
		padding: var(--space-3);
		border: var(--line) solid var(--accent-measure);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
