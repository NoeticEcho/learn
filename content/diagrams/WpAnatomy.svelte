<!--
	«Страница WordPress изнутри» (part 8, lesson 2). A schematic page of a classic theme. The person
	picks an area (header, menu, loop, sidebar, footer) and sees which theme file draws it, what the
	editor changes there, and what a plugin can do through hooks. The site's name and the first
	section titles come from the person's brief.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let name = $state('Название сайта');
	let sections = $state(['Раздел 1', 'Раздел 2', 'Раздел 3']);
	let item = $state('Услуга');
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

	type Id = 'header' | 'menu' | 'loop' | 'sidebar' | 'footer';
	const areas: Record<Id, { title: string; file: string; editor: string; plugin: string }> = {
		header: { title: 'Шапка', file: 'header.php', editor: 'Название и слоган сайта: «Настройки → Общие». Логотип: в настройках темы.', plugin: 'Может добавить в head теги для поисковиков (SEO-плагин) или счётчик посетителей.' },
		menu: { title: 'Меню', file: 'header.php (вызов wp_nav_menu)', editor: 'Меню собирается в «Внешний вид → Меню»: страницы и рубрики перетаскиваются в нужном порядке.', plugin: 'Может добавить пункт, например «Корзина», или выпадающие подменю.' },
		loop: { title: 'Цикл записей', file: 'index.php, single.php, page.php', editor: 'Записи и страницы: «Записи → Добавить». Тема решает, как выглядит карточка и страница целиком.', plugin: 'Может вставить форму заявки прямо в текст (шорткод), добавить блок «Похожие записи» или поправить текст перед показом.' },
		sidebar: { title: 'Боковая колонка', file: 'sidebar.php', editor: 'Набор виджетов: «Внешний вид → Виджеты» (поиск, рубрики, свежие записи, текст).', plugin: 'Добавляет свои виджеты: подписка на рассылку, форма, отзывы.' },
		footer: { title: 'Подвал', file: 'footer.php', editor: 'Тексты подвала зависят от темы: часто это виджеты или настройки темы.', plugin: 'Может подгрузить скрипты на конец страницы: чат, аналитика.' }
	};
	let sel = $state<Id>('loop');
	const cur = $derived(areas[sel]);
	const list: Id[] = ['header', 'menu', 'loop', 'sidebar', 'footer'];
</script>

<figure class="dg">
	<figcaption>Страница WordPress: кто за что отвечает</figcaption>
	<div class="page" role="group" aria-label="Области страницы">
		<button type="button" class="hd" aria-pressed={sel === 'header'} onclick={() => (sel = 'header')}>Шапка: {name}</button>
		<button type="button" class="mn" aria-pressed={sel === 'menu'} onclick={() => (sel = 'menu')}>Меню: {sections.join(' · ')}</button>
		<div class="mid">
			<button type="button" class="lp" aria-pressed={sel === 'loop'} onclick={() => (sel = 'loop')}>Цикл записей<br /><span class="dim">{item} и другие</span></button>
			<button type="button" class="sb" aria-pressed={sel === 'sidebar'} onclick={() => (sel = 'sidebar')}>Боковая колонка<br /><span class="dim">виджеты</span></button>
		</div>
		<button type="button" class="ft" aria-pressed={sel === 'footer'} onclick={() => (sel = 'footer')}>Подвал</button>
	</div>
	<div class="info" aria-live="polite">
		<h4>{cur.title}</h4>
		<p class="dg-out"><strong>Рисует файл темы:</strong> <span class="dg-mono">{cur.file}</span></p>
		<p class="dg-out"><strong>Редактор меняет:</strong> {cur.editor}</p>
		<p class="dg-out"><strong>Плагин может:</strong> {cur.plugin}</p>
	</div>
	<p class="dg-out">Плагины вмешиваются через <strong>хуки</strong> («крючки»): тема и ядро в нужных местах говорят «здесь можно что-то добавить или изменить», и плагин цепляется к этому месту.</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> страница WordPress делится на шапку, меню, цикл записей, боковую колонку и подвал. Каждую область рисует свой файл темы (header.php, index.php, sidebar.php, footer.php); редактор меняет содержимое областей в админке, а плагины подцепляются к ним через хуки.</p>
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
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
</style>
