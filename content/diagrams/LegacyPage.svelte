<!--
	«Страница 1996 года» (part 2, lesson 2). A table-built page in a frame with no scripts and no
	network: the person can draw the invisible grid of the layout table, narrow the window to a
	phone's width and see why a 600-pixel table breaks, and read the cells in source order, which is
	how a screen reader meets them. The words come from the person's own brief, if they have one.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let name = $state('Название проекта');
	let sections = $state(['Обо мне', 'Услуги', 'Контакты']);
	let items = $state(['Первая услуга', 'Вторая услуга']);
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
	const cells = ['Шапка: на всю ширину, colspan="2"', 'Меню: узкая левая ячейка', 'Содержимое: широкая правая ячейка'];
</script>

<figure class="dg">
	<figcaption>Невидимая сетка страницы 1996 года</figcaption>
	<div class="dg-ctl">
		<label><input type="checkbox" bind:checked={grid} /> Показать сетку таблицы</label>
		<label>
			Ширина окна: <strong>{width} px</strong>
			<input type="range" min="320" max="900" step="10" bind:value={width} aria-label="Ширина окна в пикселях" />
		</label>
		<button type="button" onclick={() => (width = 360)}>Как на телефоне (360)</button>
	</div>
	<div class="stage" style="width: min(100%, {width}px)">
		<iframe title="Страница, сделанная таблицей" sandbox="" {srcdoc}></iframe>
	</div>
	<p class="dg-out">
		{#if width < 620}
			Окно уже таблицы: она задана шириной в 600 пикселей и не сжимается, поэтому появилась горизонтальная прокрутка. Так выглядели сайты на экранах 640 × 480, и так же они выглядят на телефоне сегодня.
		{:else}
			Окно достаточно широкое, и страница выглядит как задумано. Сузьте окно: таблица задана шириной в 600 пикселей и сжиматься не умеет.
		{/if}
	</p>
	<h4>Что «слышит» программа чтения с экрана</h4>
	<ol class="dg-box read">
		{#each reading as r, i (i)}
			<li><strong>{cells[i]}.</strong> {r}</li>
		{/each}
	</ol>
	<p class="dg-out">Ячейки читаются в том порядке, в каком они стоят в файле: ряд за рядом. Ни заголовка страницы, ни «меню», ни «основного содержимого» диктор не объявит: для него это просто три ячейки.</p>
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
	h4 {
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
