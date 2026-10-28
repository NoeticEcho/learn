<!--
	«Страница 1996 года» (part 2, lesson 2). A table-built page in a frame with no scripts and no
	network: the person can draw the invisible grid of the layout table, narrow the window to a
	phone's width and see why a 600-pixel table breaks, and read the cells in source order, which is
	how a screen reader meets them. The words come from the person's own brief, if they have one.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			name: 'Название проекта',
			sections: ['Обо мне', 'Услуги', 'Контакты'],
			items: ['Первая услуга', 'Вторая услуга'],
			caption: 'Невидимая сетка страницы 1996 года',
			grid: 'Показать сетку таблицы',
			width: 'Ширина окна:',
			widthLabel: 'Ширина окна в пикселях',
			phone: 'Как на телефоне (360)',
			frame: 'Страница, сделанная таблицей',
			narrow:
				'Окно уже таблицы: она задана шириной в 600 пикселей и не сжимается, поэтому появилась горизонтальная прокрутка. Так выглядели сайты на экранах 640 × 480, и так же они выглядят на телефоне сегодня.',
			wide: 'Окно достаточно широкое, и страница выглядит как задумано. Сузьте окно: таблица задана шириной в 600 пикселей и сжиматься не умеет.',
			heard: 'Что «слышит» программа чтения с экрана',
			cells: ['Шапка: на всю ширину, colspan="2"', 'Меню: узкая левая ячейка', 'Содержимое: широкая правая ячейка'],
			after:
				'Ячейки читаются в том порядке, в каком они стоят в файле: ряд за рядом. Ни заголовка страницы, ни «меню», ни «основного содержимого» диктор не объявит: для него это просто три ячейки.'
		},
		en: {
			name: 'Project name',
			sections: ['About me', 'Services', 'Contact'],
			items: ['First service', 'Second service'],
			caption: 'The invisible grid of a 1996 page',
			grid: 'Show the table grid',
			width: 'Window width:',
			widthLabel: 'Window width in pixels',
			phone: 'Like a phone (360)',
			frame: 'A page built with a table',
			narrow:
				'The window is narrower than the table. It is fixed at 600 pixels and does not shrink, so a horizontal scrollbar appears. Sites looked like this on 640 × 480 screens, and they look like this on a phone today.',
			wide: 'The window is wide enough, and the page looks as intended. Narrow the window: the table is fixed at 600 pixels wide and cannot shrink.',
			heard: 'What a screen reader “hears”',
			cells: ['Header: full width, colspan="2"', 'Menu: the narrow left cell', 'Content: the wide right cell'],
			after:
				'The cells are read in the order they stand in the file, row by row. The screen reader never announces a page title, a “menu” or “main content”. To it, these are just three cells.'
		}
	});

	let name = $state(W.name);
	let sections = $state(W.sections);
	let items = $state(W.items);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			name = p.name || name;
			if (p.sections?.length) sections = p.sections.slice(0, 5);
			if (p.items?.length) items = p.items.slice(0, 3).map((i) => i.title);
		} catch {
			/* the example stays */
		}
	});

	let grid = $state(false);
	let width = $state(620);
	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	const srcdoc = $derived(
		`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">` +
			`<style>${grid ? 'table{outline:3px solid #2255cc} td{outline:2px dashed #cc3322}' : ''}</style>` +
			`<body bgcolor="#ffffcc" text="#000033"><table width="600" cellpadding="8" cellspacing="0">` +
			`<tr><td colspan="2" bgcolor="#003366"><font face="Times New Roman" size="5" color="#ffffff"><b>${esc(name)}</b></font></td></tr>` +
			`<tr><td width="150" valign="top" bgcolor="#cccccc"><font size="2">${sections.map((s) => `<a href="#">${esc(s)}</a><br>`).join('')}</font></td>` +
			`<td valign="top"><font size="3">${items.map((i) => `<p><b>${esc(i)}</b></p>`).join('')}</font></td></tr></table></body>`
	);
	const reading = $derived([name, sections.join(', '), items.join(', ')]);
	const cells = W.cells;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={grid} /> {W.grid}</label>
		<label>
			{W.width} <strong>{width} px</strong>
			<input type="range" min="320" max="900" step="10" bind:value={width} aria-label={W.widthLabel} />
		</label>
		<button type="button" onclick={() => (width = 360)}>{W.phone}</button>
	</div>
	<div class="stage" style="width: min(100%, {width}px)">
		<iframe title={W.frame} sandbox="" {srcdoc}></iframe>
	</div>
	<p class="dg-out">
		{#if width < 620}
			{W.narrow}
		{:else}
			{W.wide}
		{/if}
	</p>
	<div class="dh">{W.heard}</div>
	<ol class="dg-box read">
		{#each reading as r, i (i)}
			<li><strong>{cells[i]}.</strong> {r}</li>
		{/each}
	</ol>
	<p class="dg-out">{W.after}</p>
</figure>

<style>
	.stage {
		overflow: auto;
		border: var(--line) solid var(--border-hairline);
		background: #fff;
	}
	iframe {
		display: block;
		width: 100%;
		height: 15rem;
		border: 0;
	}
	.dh {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.read {
		margin: 0;
		padding-left: var(--space-6) !important;
	}
	.read li {
		margin: var(--space-1) 0;
	}
</style>
