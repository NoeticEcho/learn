<!--
	«Анатомия дизайн-системы» (part 4, lesson 6). Nine layers a design system can have. Choose how
	big the team is and see which layers it needs; open a layer to see the question it answers,
	what it contains, who looks after it, and where a real public system keeps it. Every real
	example is taken from that system's own public site (links in the lesson's sources).
-->
<script lang="ts">
	import './shared.css';

	type Need = 'need' | 'maybe' | 'skip';
	type Layer = {
		id: string;
		name: string;
		ask: string;
		has: string;
		who: string;
		real: string;
		mini: string;
		need: [Need, Need, Need];
	};

	const layers: Layer[] = [
		{ id: 'principles', name: 'Принципы', ask: 'Во что мы верим, когда решаем спорный вопрос?', has: 'Три-пять коротких правил, например «сначала понятность, потом красота».', who: 'Тот, кто отвечает за продукт и дизайн', real: 'У GOV.UK система опирается на открытые государственные принципы дизайна (Government Design Principles).', mini: 'Три правила на странице паспорта проекта.', need: ['need', 'need', 'need'] },
		{ id: 'foundations', name: 'Основы', ask: 'Из чего сделан вид?', has: 'Цвет, типографика, отступы, сетка, значки, движение, тема.', who: 'Дизайнер', real: 'В Carbon основы это «2x Grid», типографика, цвет, отступы, значки, движение, темы и доступность.', mini: 'Палитра, шкала шрифтов и шаг отступов из прошлых уроков.', need: ['need', 'need', 'need'] },
		{ id: 'tokens', name: 'Токены', ask: 'Как назвать значения, чтобы дизайн и код говорили одинаково?', has: 'Именованные значения: color.text.primary, space.200, radius.medium.', who: 'Дизайнер и разработчик вместе', real: 'У Atlassian токены носят имена вроде color.text.accent.red и elevation.surface.hovered; у GitHub Primer они называются «примитивами» (primitives).', mini: 'Файл токенов и CSS-переменные (уроки ниже).', need: ['need', 'need', 'need'] },
		{ id: 'components', name: 'Компоненты', ask: 'Какие готовые детали мы собираем страницу?', has: 'Кнопка, поле, карточка, меню: у каждого варианты и состояния.', who: 'Дизайнер и разработчик', real: 'GOV.UK разделяет «компоненты» (кнопка, поля, таблицы) и «паттерны» (как правильно спросить имя и адрес).', mini: 'Пять компонентов: кнопка, ссылка, поле, карточка, шапка.', need: ['maybe', 'need', 'need'] },
		{ id: 'patterns', name: 'Паттерны', ask: 'Как решаем типовые задачи из нескольких компонентов?', has: 'Форма входа, поиск, подтверждение, пустые состояния.', who: 'Дизайнер и исследователь', real: 'В Carbon и GOV.UK есть отдельные разделы паттернов: диалоги, формы, вход, поиск.', mini: 'Одна форма обратной связи по правилам формы.', need: ['skip', 'maybe', 'need'] },
		{ id: 'content', name: 'Слова', ask: 'Как система говорит?', has: 'Тон голоса, правила для кнопок и ошибок, термины.', who: 'Редактор или автор', real: 'В основах Carbon есть отдельный раздел «Content», посвящённый словам в интерфейсе.', mini: 'Несколько правил из части про тексты.', need: ['maybe', 'need', 'need'] },
		{ id: 'code', name: 'Код', ask: 'Где лежат готовые компоненты в виде кода?', has: 'Библиотека пакетов, примеры, тесты, витрина (Storybook).', who: 'Разработчик', real: 'Gravity UI от Яндекса, VKUI от VK и Taiga UI открыты на GitHub и ставятся пакетом.', mini: 'Один файл styles.css с токенами и компонентами.', need: ['skip', 'need', 'need'] },
		{ id: 'docs', name: 'Документация', ask: 'Как человек узнает, что и когда брать?', has: 'Описание, когда использовать и когда нет, примеры «можно» и «нельзя», доступность.', who: 'Все, кто создаёт компоненты', real: 'Страницы компонентов в GOV.UK объясняют, когда компонент уместен и когда нет.', mini: 'Страница-справочник «Моя система» на вашем сайте.', need: ['maybe', 'need', 'need'] },
		{ id: 'governance', name: 'Управление', ask: 'Кто решает, как меняется система?', has: 'Владелец, порядок предложений, версии, устаревание, поддержка.', who: 'Команда системы', real: 'Carbon и GOV.UK публикуют, как внести вклад и как идёт работа сообщества.', mini: 'Одна строка: кто решает и как фиксируются изменения.', need: ['skip', 'maybe', 'need'] }
	];

	const scales = ['Один человек, один сайт', 'Команда, несколько страниц', 'Компания, несколько продуктов'];
	let scale = $state(0);
	let open = $state('principles');
	const cur = $derived(layers.find((l) => l.id === open)!);
	const label: Record<Need, string> = { need: 'нужен', maybe: 'по желанию', skip: 'можно не делать' };
</script>

<figure class="dg">
	<figcaption>Девять слоёв дизайн-системы и сколько из них нужно вам</figcaption>
	<div class="dg-ctl" role="group" aria-label="Размер проекта">
		{#each scales as s, k (s)}
			<button type="button" aria-pressed={scale === k} onclick={() => (scale = k)}>{s}</button>
		{/each}
	</div>
	<div class="layers" role="group" aria-label="Слои">
		{#each layers as l (l.id)}
			<button type="button" class="layer {l.need[scale]}" aria-pressed={open === l.id} onclick={() => (open = l.id)}>
				<strong>{l.name}</strong>
				<span>{label[l.need[scale]]}</span>
			</button>
		{/each}
	</div>
	<div class="dg-box detail" aria-live="polite">
		<p><strong>{cur.name}.</strong> Отвечает на вопрос: {cur.ask}</p>
		<p><strong>Что внутри.</strong> {cur.has}</p>
		<p><strong>Кто отвечает.</strong> {cur.who}.</p>
		<p><strong>В реальных системах.</strong> {cur.real}</p>
		<p><strong>В маленьком проекте.</strong> {cur.mini}</p>
	</div>
</figure>

<style>
	.layers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.layer {
		display: grid;
		gap: 2px;
		text-align: left;
		padding: var(--space-2) var(--space-3) !important;
		min-height: 3.2rem;
	}
	.layer span {
		font-size: 0.78rem;
		color: var(--text-secondary);
	}
	.layer.skip {
		opacity: 0.55;
	}
	.layer.need {
		border-color: var(--border-brass) !important;
	}
	.detail p {
		margin: 0 0 var(--space-2);
	}
</style>
