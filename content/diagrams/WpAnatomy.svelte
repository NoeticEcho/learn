<!--
	«Страница WordPress изнутри» (part 8, lesson 2). A schematic page of a classic theme. The person
	picks an area (header, menu, loop, sidebar, footer) and sees which theme file draws it, what the
	editor changes there, and what a plugin can do through hooks. The site's name and the first
	section titles come from the person's brief.

	Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	type Id = 'header' | 'menu' | 'loop' | 'sidebar' | 'footer';
	type Area = { title: string; file: string; editor: string; plugin: string };
	const W = pick({
		ru: {
			name: 'Название сайта',
			sections: ['Раздел 1', 'Раздел 2', 'Раздел 3'],
			item: 'Услуга',
			caption: 'Страница WordPress: кто за что отвечает',
			group: 'Области страницы',
			header: 'Шапка:',
			menu: 'Меню:',
			loop: 'Цикл записей',
			andOthers: 'и другие',
			sidebar: 'Боковая колонка',
			widgets: 'виджеты',
			footer: 'Подвал',
			drawn: 'Рисует файл темы:',
			editorChanges: 'Редактор меняет:',
			pluginCan: 'Плагин может:',
			hooksPre: 'Плагины вмешиваются через ',
			hooks: 'хуки',
			hooksPost: ' («крючки»): тема и ядро в нужных местах говорят «здесь можно что-то добавить или изменить», и плагин цепляется к этому месту.',
			alt: 'Текстовая альтернатива:',
			altText: 'страница WordPress делится на шапку, меню, цикл записей, боковую колонку и подвал. Каждую область рисует свой файл темы (header.php, index.php, sidebar.php, footer.php); редактор меняет содержимое областей в админке, а плагины подцепляются к ним через хуки.',
			areas: {
				header: { title: 'Шапка', file: 'header.php', editor: 'Название и слоган сайта: «Настройки → Общие». Логотип: в настройках темы.', plugin: 'Может добавить в head теги для поисковиков (SEO-плагин) или счётчик посетителей.' },
				menu: { title: 'Меню', file: 'header.php (вызов wp_nav_menu)', editor: 'Меню собирается в «Внешний вид → Меню»: страницы и рубрики перетаскиваются в нужном порядке.', plugin: 'Может добавить пункт, например «Корзина», или выпадающие подменю.' },
				loop: { title: 'Цикл записей', file: 'index.php, single.php, page.php', editor: 'Записи и страницы: «Записи → Добавить». Тема решает, как выглядит карточка и страница целиком.', plugin: 'Может вставить форму заявки прямо в текст (шорткод), добавить блок «Похожие записи» или поправить текст перед показом.' },
				sidebar: { title: 'Боковая колонка', file: 'sidebar.php', editor: 'Набор виджетов: «Внешний вид → Виджеты» (поиск, рубрики, свежие записи, текст).', plugin: 'Добавляет свои виджеты: подписка на рассылку, форма, отзывы.' },
				footer: { title: 'Подвал', file: 'footer.php', editor: 'Тексты подвала зависят от темы: часто это виджеты или настройки темы.', plugin: 'Может подгрузить скрипты на конец страницы: чат, аналитика.' }
			} as Record<Id, Area>
		},
		en: {
			name: 'Site name',
			sections: ['Section 1', 'Section 2', 'Section 3'],
			item: 'Service',
			caption: 'A WordPress page: who is responsible for what',
			group: 'Areas of the page',
			header: 'Header:',
			menu: 'Menu:',
			loop: 'The loop',
			andOthers: 'and others',
			sidebar: 'Sidebar',
			widgets: 'widgets',
			footer: 'Footer',
			drawn: 'Drawn by the theme file:',
			editorChanges: 'The editor changes:',
			pluginCan: 'A plugin can:',
			hooksPre: 'Plugins step in through ',
			hooks: 'hooks',
			hooksPost: ': at the right places the theme and the core say “something can be added or changed here”, and a plugin attaches to that place.',
			alt: 'Text alternative:',
			altText: 'a WordPress page divides into a header, a menu, the loop of posts, a sidebar and a footer. Each area is drawn by its own theme file (header.php, index.php, sidebar.php, footer.php); the editor changes what the areas hold in the admin screen, and plugins attach to them through hooks.',
			areas: {
				header: { title: 'Header', file: 'header.php', editor: 'The site title and tagline: “Settings → General”. The logo: in the theme’s settings.', plugin: 'It can add tags for search engines to the head (an SEO plugin) or a visitor counter.' },
				menu: { title: 'Menu', file: 'header.php (it calls wp_nav_menu)', editor: 'The menu is built in “Appearance → Menus”: pages and categories are dragged into the order you want.', plugin: 'It can add an item such as “Cart”, or drop-down submenus.' },
				loop: { title: 'The loop', file: 'index.php, single.php, page.php', editor: 'Posts and pages: “Posts → Add New”. The theme decides how a card and a whole page look.', plugin: 'It can place an inquiry form right in the text (a shortcode), add a “Related posts” block or adjust the text before it is shown.' },
				sidebar: { title: 'Sidebar', file: 'sidebar.php', editor: 'The set of widgets: “Appearance → Widgets” (search, categories, recent posts, text).', plugin: 'It adds widgets of its own: a newsletter signup, a form, reviews.' },
				footer: { title: 'Footer', file: 'footer.php', editor: 'The footer’s text depends on the theme: often it is widgets or theme settings.', plugin: 'It can load scripts at the end of the page: chat, analytics.' }
			} as Record<Id, Area>
		}
	});

	let name = $state(W.name);
	let sections = $state(W.sections);
	let item = $state(W.item);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.name) name = p.name;
			if (p.sections?.length) sections = p.sections.slice(0, 3);
			if (p.items?.[0]?.title) item = p.items[0].title;
		} catch {
			/* the example stays */
		}
	});

	const areas = W.areas;
	let sel = $state<Id>('loop');
	const cur = $derived(areas[sel]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="page" role="group" aria-label={W.group}>
		<button type="button" class="hd" aria-pressed={sel === 'header'} onclick={() => (sel = 'header')}>{W.header} {name}</button>
		<button type="button" class="mn" aria-pressed={sel === 'menu'} onclick={() => (sel = 'menu')}>{W.menu} {sections.join(' · ')}</button>
		<div class="mid">
			<button type="button" class="lp" aria-pressed={sel === 'loop'} onclick={() => (sel = 'loop')}>{W.loop}<br /><span class="dim">{item} {W.andOthers}</span></button>
			<button type="button" class="sb" aria-pressed={sel === 'sidebar'} onclick={() => (sel = 'sidebar')}>{W.sidebar}<br /><span class="dim">{W.widgets}</span></button>
		</div>
		<button type="button" class="ft" aria-pressed={sel === 'footer'} onclick={() => (sel = 'footer')}>{W.footer}</button>
	</div>
	<div class="info" aria-live="polite">
		<div class="dh">{cur.title}</div>
		<p class="dg-out"><strong>{W.drawn}</strong> <span class="dg-mono">{cur.file}</span></p>
		<p class="dg-out"><strong>{W.editorChanges}</strong> {cur.editor}</p>
		<p class="dg-out"><strong>{W.pluginCan}</strong> {cur.plugin}</p>
	</div>
	<p class="dg-out">{W.hooksPre}<strong>{W.hooks}</strong>{W.hooksPost}</p>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.page {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		max-width: 34rem;
	}
	.mid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--space-2);
	}
	.page button {
		min-height: 3.2rem;
		text-align: left;
		padding: var(--space-2) var(--space-3);
	}
	.lp {
		min-height: 7rem !important;
	}
	.dim {
		color: var(--text-secondary);
	}
	.info {
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
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
