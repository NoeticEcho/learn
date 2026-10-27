<!--
	«Дерево выбора» (part 8, lesson 8). Five questions about a project (who edits, how often, what
	besides pages, budget, languages) and a recommendation: a stack, why, what it costs, where it
	breaks, two options set aside with reasons, and when to reconsider. Buttons load the answers of
	the course's template projects. The rules are the lesson's judgement, kept simple on purpose.
-->
<script lang="ts">
	import './shared.css';

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
	const info: Record<Stack, { name: string; why: string; cost: string; breaks: string; reject: string }> = {
		tilda: { name: 'Конструктор (Tilda)', why: 'сайт небольшой, правит сам владелец, а форма заявки встроена', cost: 'подписка каждый год, обслуживания нет', breaks: 'экспорт кода зависит от тарифа, много языков и своя логика тесны', reject: 'тесно, когда сайт растёт: свой код и многоязычие неудобны' },
		wp: { name: 'WordPress', why: 'нужна админка для редактора и много готовых плагинов', cost: 'хостинг, плагины и время на обновления (урок 3)', breaks: 'обновления, конфликты плагинов, защита от взлома', reject: 'обслуживание и защита ложатся на вас, а выгоды не хватает ради этого' },
		bitrix: { name: '1С-Битрикс', why: 'большой каталог, обмен с 1С и команда с разработчиком', cost: 'лицензия, хостинг и разработчик', breaks: 'дорого для малого проекта, нужны специалисты', reject: 'лицензия и разработчик слишком дороги для такого проекта' },
		ssg: { name: 'Генератор статики и Markdown', why: 'содержание меняется редко, правит разработчик, нужно быстро и безопасно', cost: 'почти бесплатный хостинг, работа разработчика', breaks: 'редактору без Git неудобно, динамика только из сервисов', reject: 'редактору без технических знаний неудобно править файлы' },
		headless: { name: 'Headless CMS + генератор', why: 'правят часто и разные люди, а сайт строит разработчик', cost: 'две системы: CMS и сайт, плюс сборка', breaks: 'сложнее в настройке, предпросмотр нужно делать', reject: 'две системы сложнее одной, если правок мало' },
		app: { name: 'Веб-приложение со своей базой', why: 'нужны личные кабинеты и данные, которые меняются на ходу', cost: 'разработка и обслуживание сервера, данные и защита на вас', breaks: 'дольше и дороже всего; нужна команда', reject: 'для сайта-визитки это избыточно' }
	};
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
	const note = $derived(langs === 'many' && pick === 'tilda' ? 'Много языков на конструкторе делают копиями страниц: следите, чтобы цена и телефон не разошлись.' : langs !== 'one' ? 'Языки: храните тексты полем на каждый язык или переводом записи (урок 1).' : '');
	const revisit = $derived(
		pick === 'tilda' ? 'Пересмотрю, когда понадобится своя логика, личный кабинет или цена подписки превысит цену хостинга.' : pick === 'wp' ? 'Пересмотрю, если обслуживание станет дороже выгоды или правки почти прекратятся (тогда хватит статики).' : pick === 'ssg' ? 'Пересмотрю, когда содержание начнут править люди без Git.' : pick === 'headless' ? 'Пересмотрю, если правок станет мало: тогда одна система проще.' : pick === 'bitrix' ? 'Пересмотрю, если обмен с 1С перестанет быть нужен.' : 'Пересмотрю, если кабинет окажется ненужным: часть проекта вернётся в статику.'
	);

	const presets: { name: string; a: [Who, Freq, Extra, Budget, Langs] }[] = [
		{ name: 'Портфолио', a: ['owner', 'month', 'form', 'min', 'one'] },
		{ name: 'Кафе или салон', a: ['owner', 'week', 'form', 'min', 'one'] },
		{ name: 'Эксперт на двух языках', a: ['editor', 'month', 'form', 'mid', 'two'] },
		{ name: 'Небольшой магазин', a: ['owner', 'week', 'shop', 'min', 'one'] },
		{ name: 'Магазин с 1С', a: ['editor', 'day', 'shop', 'mid', 'one'] },
		{ name: 'Документация для разработчиков', a: ['dev', 'rare', 'none', 'min', 'one'] },
		{ name: 'Сервис с кабинетом', a: ['dev', 'week', 'account', 'free', 'one'] }
	];
	const load = (a: [Who, Freq, Extra, Budget, Langs]) => ([who, freq, extra, budget, langs] = a);
</script>

<figure class="dg">
	<figcaption>Пять вопросов о вашем проекте</figcaption>
	<p class="dg-out">Простые правила, чтобы увидеть логику выбора. Готовые проекты подставляют типичные ответы.</p>
	<div class="dg-ctl" role="group" aria-label="Готовые проекты">
		{#each presets as p (p.name)}<button type="button" onclick={() => load(p.a)}>{p.name}</button>{/each}
	</div>
	<div class="q">
		<fieldset><legend>1. Кто правит содержание</legend>
			<label><input type="radio" bind:group={who} value="owner" /> владелец сам</label>
			<label><input type="radio" bind:group={who} value="editor" /> редактор в команде</label>
			<label><input type="radio" bind:group={who} value="dev" /> разработчик</label>
		</fieldset>
		<fieldset><legend>2. Как часто</legend>
			<label><input type="radio" bind:group={freq} value="rare" /> раз в полгода</label>
			<label><input type="radio" bind:group={freq} value="month" /> раз в месяц</label>
			<label><input type="radio" bind:group={freq} value="week" /> раз в неделю</label>
			<label><input type="radio" bind:group={freq} value="day" /> каждый день</label>
		</fieldset>
		<fieldset><legend>3. Что нужно кроме страниц</legend>
			<label><input type="radio" bind:group={extra} value="none" /> ничего</label>
			<label><input type="radio" bind:group={extra} value="form" /> форма заявки</label>
			<label><input type="radio" bind:group={extra} value="shop" /> магазин</label>
			<label><input type="radio" bind:group={extra} value="account" /> личный кабинет</label>
		</fieldset>
		<fieldset><legend>4. Бюджет</legend>
			<label><input type="radio" bind:group={budget} value="min" /> минимальный</label>
			<label><input type="radio" bind:group={budget} value="mid" /> умеренный</label>
			<label><input type="radio" bind:group={budget} value="free" /> свободный</label>
		</fieldset>
		<fieldset><legend>5. Языки</legend>
			<label><input type="radio" bind:group={langs} value="one" /> один</label>
			<label><input type="radio" bind:group={langs} value="two" /> два</label>
			<label><input type="radio" bind:group={langs} value="many" /> много</label>
		</fieldset>
	</div>
	<div class="res" aria-live="polite">
		<div class="dh">Подходит: {info[pick].name}</div>
		<p class="dg-out"><strong>Почему:</strong> {info[pick].why}.</p>
		<p class="dg-out"><strong>Цена:</strong> {info[pick].cost}.</p>
		<p class="dg-out"><strong>Где ломается:</strong> {info[pick].breaks}.</p>
		{#if note}<p class="dg-out"><strong>Языки:</strong> {note}</p>{/if}
		<p class="dg-out"><strong>Отвергнуты:</strong> {info[rejected[0]].name}: {info[rejected[0]].reject}. {info[rejected[1]].name}: {info[rejected[1]].reject}.</p>
		<p class="dg-out"><strong>Когда пересмотреть:</strong> {revisit}</p>
	</div>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> по пяти ответам (кто правит, как часто, что нужно кроме страниц, бюджет, число языков) схема предлагает один из вариантов: конструктор, WordPress, Битрикс, генератор статики, headless CMS или веб-приложение. К выбору она называет цену, место, где вариант ломается, два отвергнутых варианта с причинами и условие пересмотра решения.</p>
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
