<!--
	«Три слоя сайта» (part 8, lesson 1). Content, template and code, and where each lives at three
	stages: HTML files, a CMS with pages, a CMS with a content model. The person moves a slider and
	sees where each layer lives, who can change it, and what changing one service's price takes. The
	service is the first item of the person's own brief; everything else is the lesson's explanation.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let item = $state('первой услуги');
	onMount(async () => {
		try {
			const t = (await (await import('#lib/learner.ts')).persona()).items?.[0]?.title;
			if (t) item = `услуги «${t}»`;
		} catch {
			/* the example stays */
		}
	});

	type Stage = {
		name: string;
		layers: { name: string; where: 'files' | 'db'; note: string }[];
		who: string;
		steps: string[];
		risk: string;
	};
	const stages = $derived<Stage[]>([
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
	]);
	let at = $state(0);
	const cur = $derived(stages[at]);
</script>

<figure class="dg">
	<figcaption>Три слоя сайта и кто их правит</figcaption>
	<label class="sl">Как устроен сайт: <strong>{cur.name}</strong>
		<input type="range" min="0" max="2" step="1" bind:value={at} aria-valuetext={cur.name} />
	</label>
	<div class="cols" aria-live="polite">
		<div class="col files"><div class="dh">Файлы на диске</div>
			{#each cur.layers.filter((l) => l.where === 'files') as l (l.name)}
				<div class="layer"><strong>{l.name}</strong><span>{l.note}</span></div>
			{/each}
		</div>
		<div class="col db"><div class="dh">База и админка</div>
			{#each cur.layers.filter((l) => l.where === 'db') as l (l.name)}
				<div class="layer on"><strong>{l.name}</strong><span>{l.note}</span></div>
			{:else}
				<p class="dim">пока ничего</p>
			{/each}
		</div>
	</div>
	<p class="dg-out"><strong>Кто может править:</strong> {cur.who}</p>
	<p class="dg-out"><strong>Поменять цену {item}:</strong></p>
	<ol class="steps">
		{#each cur.steps as s, i (i)}<li>{s}</li>{/each}
	</ol>
	<p class="dg-out"><strong>Что может пойти не так:</strong> {cur.risk}</p>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> в сайте из HTML-файлов все три слоя (содержание, шаблон, код) лежат в файлах, и цену приходится править на каждой странице. В CMS со страницами содержание переехало в базу, но цена всё ещё спрятана внутри текста. В CMS с моделью контента цена это поле записи, и одна правка обновляет её везде.</p>
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
