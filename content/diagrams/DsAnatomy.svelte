<!--
	«Анатомия дизайн-системы» (part 4, lesson 6). Nine layers a design system can have. Choose how
	big the team is and see which layers it needs; open a layer to see the question it answers,
	what it contains, who looks after it, and where a real public system keeps it. Every real
	example is taken from that system's own public site (links in the lesson's sources).
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

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

	const base: Layer[] = [
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

	// The English edition's words for each layer (docs/content-plan/README.md, «English edition»);
	// which layer a team needs (`need`) is shared. Every real example was read on that system's own site.
	const EN: Record<string, Partial<Layer>> = {
		principles: {
			name: 'Principles',
			ask: 'What do we believe in when we settle a dispute?',
			has: 'Three to five short rules, for example “clarity first, beauty second”.',
			who: 'Whoever is responsible for the product and the design',
			real: 'GOV.UK’s design system follows the open Government Design Principles.',
			mini: 'Three rules on your project’s passport page.'
		},
		foundations: {
			name: 'Foundations',
			ask: 'What is the look made of?',
			has: 'Color, typography, spacing, grid, icons, motion, themes.',
			who: 'The designer',
			real: 'In Carbon the foundations are the 2x Grid, accessibility, color, content, icons, motion, spacing, themes and typography.',
			mini: 'The palette, type scale and spacing step from the earlier lessons.'
		},
		tokens: {
			name: 'Tokens',
			ask: 'How do we name values so that design and code speak the same way?',
			has: 'Named values: color.text.primary, space.200, radius.medium.',
			who: 'The designer and the developer together',
			real: 'Atlassian’s tokens have names such as color.text.accent.red and elevation.surface.hovered; GitHub’s Primer calls its design tokens “primitives”.',
			mini: 'A tokens file and CSS variables (the lessons below).'
		},
		components: {
			name: 'Components',
			ask: 'What ready-made parts do we build pages from?',
			has: 'A button, a field, a card, a menu: each with variants and states.',
			who: 'The designer and the developer',
			real: 'GOV.UK separates “components” (buttons, fields, tables) from “patterns” (how to ask for a name and an address properly).',
			mini: 'Five components: button, link, field, card, header.'
		},
		patterns: {
			name: 'Patterns',
			ask: 'How do we solve common tasks that take several components?',
			has: 'A sign-in form, search, a confirmation, empty states.',
			who: 'The designer and the researcher',
			real: 'Carbon and GOV.UK have separate sections for patterns: dialogs, forms, sign-in, search.',
			mini: 'One feedback form built by the rules for forms.'
		},
		content: {
			name: 'Words',
			ask: 'How does the system speak?',
			has: 'Tone of voice, rules for buttons and errors, terms.',
			who: 'An editor or a writer',
			real: 'Carbon’s foundations include a section called “Content”, devoted to the words in an interface.',
			mini: 'A few rules from the part on writing.'
		},
		code: {
			name: 'Code',
			ask: 'Where do the ready-made components live as code?',
			has: 'A package library, examples, tests, a showcase (Storybook).',
			who: 'The developer',
			real: 'GOV.UK Frontend, Carbon and Primer are open on GitHub and install as packages; so do the Russian Gravity UI, VKUI and Taiga UI.',
			mini: 'A single styles.css file with tokens and components.'
		},
		docs: {
			name: 'Documentation',
			ask: 'How does a person learn what to take and when?',
			has: 'A description, when to use it and when not, “do” and “don’t” examples, accessibility.',
			who: 'Everyone who builds components',
			real: 'The component pages in GOV.UK explain when a component fits and when it does not.',
			mini: 'A reference page, “My system”, on your site.'
		},
		governance: {
			name: 'Governance',
			ask: 'Who decides how the system changes?',
			has: 'An owner, a way to propose changes, versions, retirement, support.',
			who: 'The system’s team',
			real: 'Carbon and GOV.UK publish how to contribute and how the community works.',
			mini: 'One line: who decides and how changes are recorded.'
		}
	};
	const over = pick({ ru: {} as Record<string, Partial<Layer>>, en: EN });
	const layers: Layer[] = base.map((l) => ({ ...l, ...over[l.id] }));
	const W = pick({
		ru: {
			scales: ['Один человек, один сайт', 'Команда, несколько страниц', 'Компания, несколько продуктов'],
			label: { need: 'нужен', maybe: 'по желанию', skip: 'можно не делать' } as Record<Need, string>,
			caption: 'Девять слоёв дизайн-системы и сколько из них нужно вам',
			size: 'Размер проекта',
			layers: 'Слои',
			asks: 'Отвечает на вопрос:',
			inside: 'Что внутри.',
			who: 'Кто отвечает.',
			real: 'В реальных системах.',
			mini: 'В маленьком проекте.'
		},
		en: {
			scales: ['One person, one site', 'A team, a few pages', 'A company, several products'],
			label: { need: 'needed', maybe: 'optional', skip: 'can skip' } as Record<Need, string>,
			caption: 'The nine layers of a design system, and how many you need',
			size: 'Size of the project',
			layers: 'Layers',
			asks: 'It answers the question:',
			inside: 'What is inside.',
			who: 'Who is responsible.',
			real: 'In real systems.',
			mini: 'In a small project.'
		}
	});

	const scales = W.scales;
	let scale = $state(0);
	let open = $state('principles');
	const cur = $derived(layers.find((l) => l.id === open)!);
	const label = W.label;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.size}>
		{#each scales as s, k (s)}
			<button type="button" aria-pressed={scale === k} onclick={() => (scale = k)}>{s}</button>
		{/each}
	</div>
	<div class="layers" role="group" aria-label={W.layers}>
		{#each layers as l (l.id)}
			<button type="button" class="layer {l.need[scale]}" aria-pressed={open === l.id} onclick={() => (open = l.id)}>
				<strong>{l.name}</strong>
				<span>{label[l.need[scale]]}</span>
			</button>
		{/each}
	</div>
	<div class="dg-box detail" aria-live="polite">
		<p><strong>{cur.name}.</strong> {W.asks} {cur.ask}</p>
		<p><strong>{W.inside}</strong> {cur.has}</p>
		<p><strong>{W.who}</strong> {cur.who}.</p>
		<p><strong>{W.real}</strong> {cur.real}</p>
		<p><strong>{W.mini}</strong> {cur.mini}</p>
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
	/* Not faded with opacity: that took the text below AA. A dashed edge says «skippable». */
	.layer.skip {
		border-style: dashed;
	}
	.layer.need {
		border-color: var(--border-brass) !important;
	}
	.detail p {
		margin: 0 0 var(--space-2);
	}
</style>
