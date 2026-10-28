<!--
	«Три слоя сайта» (part 8, lesson 1). Content, template and code, and where each lives at three
	stages: HTML files, a CMS with pages, a CMS with a content model. The person moves a slider and
	sees where each layer lives, who can change it, and what changing one service's price takes. The
	service is the first item of the person's own brief; everything else is the lesson's explanation.

	Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			item: 'первой услуги',
			named: (t: string) => `услуги «${t}»`,
			caption: 'Три слоя сайта и кто их правит',
			slider: 'Как устроен сайт:',
			files: 'Файлы на диске',
			db: 'База и админка',
			nothing: 'пока ничего',
			who: 'Кто может править:',
			change: (item: string) => `Поменять цену ${item}:`,
			risk: 'Что может пойти не так:',
			alt: 'Текстовая альтернатива:',
			altText: 'в сайте из HTML-файлов все три слоя (содержание, шаблон, код) лежат в файлах, и цену приходится править на каждой странице. В CMS со страницами содержание переехало в базу, но цена всё ещё спрятана внутри текста. В CMS с моделью контента цена это поле записи, и одна правка обновляет её везде.',
			stages: (item: string) => [
				{
					name: 'Сайт из HTML-файлов',
					layers: [
						{ name: 'Содержание', where: 'files', note: 'тексты и цены прямо в HTML' },
						{ name: 'Шаблон', where: 'files', note: 'шапка и подвал скопированы в каждый файл' },
						{ name: 'Код', where: 'files', note: 'нет: всё готовое' }
					],
					who: 'Тот, кто умеет править HTML и выкладывать файлы по FTP: обычно разработчик.',
					steps: [`Найти все страницы, где упоминается цена ${item}`, 'Открыть каждую и поправить вручную', 'Выложить исправленные файлы на сервер'],
					risk: 'Одну страницу забыли, и на сайте две цены.'
				},
				{
					name: 'CMS со страницами',
					layers: [
						{ name: 'Содержание', where: 'db', note: 'страницы целиком лежат в базе, правятся в редакторе' },
						{ name: 'Шаблон', where: 'files', note: 'тема: общая шапка и подвал в одном месте' },
						{ name: 'Код', where: 'files', note: 'ядро CMS и плагины' }
					],
					who: 'Редактор в админке: он правит текст страницы, но разработчик не нужен.',
					steps: [`Открыть страницу, где указана цена ${item}`, 'Поправить текст в редакторе', 'Нажать «Обновить»'],
					risk: 'Цена написана внутри текста нескольких страниц, и править всё равно придётся в каждой.'
				},
				{
					name: 'CMS с моделью контента',
					layers: [
						{ name: 'Содержание', where: 'db', note: 'услуга это запись с полями: название, текст, цена' },
						{ name: 'Шаблон', where: 'files', note: 'тема выводит поля там, где нужно: карточка, страница, список' },
						{ name: 'Код', where: 'files', note: 'ядро CMS; код сайта не меняется при правке' }
					],
					who: 'Владелец или редактор: он меняет одно поле «цена» в форме записи.',
					steps: [`Открыть запись ${item}`, 'Изменить поле «цена»', 'Сохранить: цена обновилась везде, где выводится услуга'],
					risk: 'Нужна работа в начале: придумать типы и поля. Это и есть модель контента.'
				}
			]
		},
		en: {
			item: 'the first service',
			named: (t: string) => `the service “${t}”`,
			caption: 'The three layers of a site, and who can change them',
			slider: 'How the site is built:',
			files: 'Files on disk',
			db: 'Database and admin screen',
			nothing: 'nothing yet',
			who: 'Who can change it:',
			change: (item: string) => `Changing the price of ${item}:`,
			risk: 'What can go wrong:',
			alt: 'Text alternative:',
			altText: 'in a site of HTML files all three layers (content, template, code) live in files, and the price has to be edited on every page. In a CMS with pages the content has moved into the database, but the price is still buried inside text. In a CMS with a content model the price is a field of a record, and one edit updates it everywhere.',
			stages: (item: string) => [
				{
					name: 'A site of HTML files',
					layers: [
						{ name: 'Content', where: 'files', note: 'text and prices right in the HTML' },
						{ name: 'Template', where: 'files', note: 'the header and footer copied into every file' },
						{ name: 'Code', where: 'files', note: 'none: everything is ready-made' }
					],
					who: 'Whoever can edit HTML and upload files by FTP: usually a developer.',
					steps: [`Find every page that mentions the price of ${item}`, 'Open each one and fix it by hand', 'Upload the fixed files to the server'],
					risk: 'One page is forgotten, and the site shows two prices.'
				},
				{
					name: 'A CMS with pages',
					layers: [
						{ name: 'Content', where: 'db', note: 'whole pages sit in the database and are edited in an editor' },
						{ name: 'Template', where: 'files', note: 'the theme: one shared header and footer' },
						{ name: 'Code', where: 'files', note: 'the CMS core and plugins' }
					],
					who: 'An editor in the admin screen: they change a page’s text, and no developer is needed.',
					steps: [`Open the page that states the price of ${item}`, 'Fix the text in the editor', 'Press “Update”'],
					risk: 'The price is written inside the text of several pages, so it still has to be fixed on each.'
				},
				{
					name: 'A CMS with a content model',
					layers: [
						{ name: 'Content', where: 'db', note: 'a service is a record with fields: name, text, price' },
						{ name: 'Template', where: 'files', note: 'the theme prints the fields where needed: card, page, list' },
						{ name: 'Code', where: 'files', note: 'the CMS core; the site’s code does not change when you edit' }
					],
					who: 'The owner or an editor: they change one “price” field in the record’s form.',
					steps: [`Open the record of ${item}`, 'Change the “price” field', 'Save: the price is updated everywhere the service is shown'],
					risk: 'It takes work at the start: designing the types and fields. That is the content model.'
				}
			]
		}
	});

	let item = $state(W.item);
	onMount(async () => {
		try {
			const t = (await (await import('#lib/learner.ts')).persona()).items?.[0]?.title;
			if (t) item = W.named(t);
		} catch {
			/* the example stays */
		}
	});

	type Stage = {
		name: string;
		layers: { name: string; where: string; note: string }[];
		who: string;
		steps: string[];
		risk: string;
	};
	const stages = $derived<Stage[]>(W.stages(item));
	let at = $state(0);
	const cur = $derived(stages[at]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<label class="sl">{W.slider} <strong>{cur.name}</strong>
		<input type="range" min="0" max="2" step="1" bind:value={at} aria-valuetext={cur.name} />
	</label>
	<div class="cols" aria-live="polite">
		<div class="col files"><div class="dh">{W.files}</div>
			{#each cur.layers.filter((l) => l.where === 'files') as l (l.name)}
				<div class="layer"><strong>{l.name}</strong><span>{l.note}</span></div>
			{/each}
		</div>
		<div class="col db"><div class="dh">{W.db}</div>
			{#each cur.layers.filter((l) => l.where === 'db') as l (l.name)}
				<div class="layer on"><strong>{l.name}</strong><span>{l.note}</span></div>
			{:else}
				<p class="dim">{W.nothing}</p>
			{/each}
		</div>
	</div>
	<p class="dg-out"><strong>{W.who}</strong> {cur.who}</p>
	<p class="dg-out"><strong>{W.change(item)}</strong></p>
	<ol class="steps">
		{#each cur.steps as s, i (i)}<li>{s}</li>{/each}
	</ol>
	<p class="dg-out"><strong>{W.risk}</strong> {cur.risk}</p>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
</figure>

<style>
	.sl {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.col {
		min-height: 8rem;
		padding: var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
	}
	.col .dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		font-size: var(--text-body);
		color: var(--text-primary);
	}
	.layer {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
		padding: var(--space-2);
		border: var(--line) solid var(--border-rule);
	}
	.layer.on {
		border-color: var(--accent-measure);
	}
	.dim {
		color: var(--text-secondary);
		margin: 0;
	}
	.steps {
		margin: 0 0 var(--space-3);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 36rem) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
