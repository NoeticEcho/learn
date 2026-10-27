<!--
	«Конвейер генератора» (part 8, lesson 5). A Markdown page with front matter, a layout and the
	person's own services (the data) go through a teaching generator (`ssgmini.ts`, not Jekyll or
	Hugo) and come out as HTML, rebuilt on every edit. The person can switch the layout, change the
	Markdown, and see the same loop written the way five real tools write it. Prices are invented.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { buildPage } from './ssgmini.ts';

	let site = $state({ title: 'Мой сайт', lang: 'ru' });
	let items = $state([
		{ title: 'Первая услуга', price: 'от 3000 ₽' },
		{ title: 'Вторая услуга', price: 'от 5000 ₽' },
		{ title: 'Третья услуга', price: 'по смете' }
	]);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.name) site.title = p.name;
			const it = p.items?.filter((i) => i.title).map((i) => ({ title: i.title, price: i.price ?? '' }));
			if (it?.length) items = it.slice(0, 5);
		} catch {
			/* the example stays */
		}
	});

	let md = $state(`---
title: Каталог
description: Что мы делаем и сколько это стоит
---
# Каталог

Все услуги выводятся из данных, а не набраны руками:

{% for item in items %}- **{{ item.title | escape }}**, {{ item.price | escape }}
{% endfor %}`);

	const layouts = {
		simple: `<!doctype html>
<html lang="{{ site.lang | escape }}">
<head><meta charset="utf-8"><title>{{ page.title | escape }}</title></head>
<body>
<main>{{ content | strip }}</main>
</body>
</html>`,
		full: `<!doctype html>
<html lang="{{ site.lang | escape }}">
<head><meta charset="utf-8"><title>{{ page.title | escape }} | {{ site.title | escape }}</title></head>
<body>
<header><strong>{{ site.title | escape }}</strong>
<nav>{% for p in pages %}<a href="{{ p.path | escape }}">{{ p.title | escape }}</a> {% endfor %}</nav></header>
<main>{{ content | strip }}</main>
<footer>{{ site.title | escape }}, все права защищены</footer>
</body>
</html>`
	};
	let which = $state<'simple' | 'full'>('full');
	const pages = [
		{ title: 'Главная', path: 'index.html' },
		{ title: 'Каталог', path: 'catalog.html' }
	];
	const html = $derived.by(() => {
		try {
			return buildPage(layouts[which], site, md, pages, { items });
		} catch (e) {
			return `<!-- ошибка: ${(e as Error).message} -->`;
		}
	});

	const syntaxes = [
		{ name: 'Jekyll (Liquid)', code: '{% for item in site.items %}\n  <li>{{ item.title }}</li>\n{% endfor %}' },
		{ name: 'Eleventy (Nunjucks)', code: '{% for item in collections.items %}\n  <li>{{ item.data.title }}</li>\n{% endfor %}' },
		{ name: 'Hugo (шаблоны Go)', code: '{{ range .Site.Data.items }}\n  <li>{{ .title }}</li>\n{{ end }}' },
		{ name: 'Astro', code: '{items.map((item) => (\n  <li>{item.title}</li>\n))}' },
		{ name: 'SvelteKit', code: '{#each items as item}\n  <li>{item.title}</li>\n{/each}' }
	];
	let syn = $state(0);
</script>

<figure class="dg">
	<figcaption>Как страница собирается из Markdown, данных и шаблона</figcaption>
	<p class="dg-out">Это <strong>учебный генератор</strong>, а не Jekyll или Hugo: он делает то же самое в миниатюре. Правьте Markdown слева, и страница пересобирается. Услуги берутся из вашего брифа, цены придуманы.</p>
	<div class="dg-ctl" role="group" aria-label="Шаблон страницы">
		<button type="button" aria-pressed={which === 'simple'} onclick={() => (which = 'simple')}>Шаблон простой</button>
		<button type="button" aria-pressed={which === 'full'} onclick={() => (which = 'full')}>Шаблон с шапкой, меню и подвалом</button>
	</div>
	<div class="grid">
		<div>
			<label for="ssg-md"><strong>catalog.md</strong> (Markdown с front matter)</label>
			<textarea id="ssg-md" class="dg-mono" rows="13" bind:value={md} spellcheck="false"></textarea>
		</div>
		<div>
			<strong>Готовая страница</strong>
			<iframe title="Готовая страница" sandbox="" srcdoc={html}></iframe>
		</div>
	</div>
	<details>
		<summary>Показать HTML, который получился</summary>
		<pre class="dg-box dg-mono">{html}</pre>
	</details>
	<h4>Тот же цикл в разных инструментах</h4>
	<div class="dg-ctl" role="group" aria-label="Инструмент">
		{#each syntaxes as s, i (i)}<button type="button" aria-pressed={syn === i} onclick={() => (syn = i)}>{s.name}</button>{/each}
	</div>
	<pre class="dg-box dg-mono">{syntaxes[syn].code}</pre>
	<p class="dg-out alt"><strong>Текстовая альтернатива:</strong> файл Markdown с front matter (заголовок и описание), данные (услуги) и общий шаблон проходят через генератор и превращаются в готовый HTML-файл. Меняя Markdown или шаблон, вы сразу видите новую страницу. В Jekyll, Eleventy, Hugo, Astro и SvelteKit цикл по данным пишется по-разному, но делает одно и то же.</p>
</figure>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		margin: var(--space-3) 0;
	}
	textarea {
		width: 100%;
		margin-top: var(--space-1);
		padding: var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		resize: vertical;
	}
	iframe {
		display: block;
		width: 100%;
		height: 17rem;
		margin-top: var(--space-1);
		border: var(--line) solid var(--border-rule);
		background: #ffffff;
	}
	details {
		margin-bottom: var(--space-3);
	}
	pre {
		margin: 0 0 var(--space-3);
		overflow-x: auto;
	}
	h4 {
		margin: var(--space-3) 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.alt {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-3);
	}
	@media (max-width: 44rem) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
