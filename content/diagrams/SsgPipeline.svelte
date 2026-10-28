<!--
	«Конвейер генератора» (part 8, lesson 5). A Markdown page with front matter, a layout and the
	person's own services (the data) go through a teaching generator (`ssgmini.ts`, not Jekyll or
	Hugo) and come out as HTML, rebuilt on every edit. The person can switch the layout, change the
	Markdown, and see the same loop written the way five real tools write it. Prices are invented.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';
	import { buildPage } from './ssgmini.ts';

	// The words, one entry per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			site: 'Мой сайт',
			lang: 'ru',
			items: [
				{ title: 'Первая услуга', price: 'от 3000 ₽' },
				{ title: 'Вторая услуга', price: 'от 5000 ₽' },
				{ title: 'Третья услуга', price: 'по смете' }
			],
			md: `---
title: Каталог
description: Что мы делаем и сколько это стоит
---
# Каталог

Все услуги выводятся из данных, а не набраны руками:

{% for item in items %}- **{{ item.title | escape }}**, {{ item.price | escape }}
{% endfor %}`,
			rights: 'все права защищены',
			home: 'Главная',
			catalog: 'Каталог',
			error: 'ошибка',
			hugo: 'Hugo (шаблоны Go)',
			caption: 'Как страница собирается из Markdown, данных и шаблона',
			intro: 'Это <strong>учебный генератор</strong>, а не Jekyll или Hugo: он делает то же самое в миниатюре. Правьте Markdown слева, и страница пересобирается. Услуги берутся из вашего брифа, цены придуманы.',
			layoutL: 'Шаблон страницы',
			simple: 'Шаблон простой',
			full: 'Шаблон с шапкой, меню и подвалом',
			mdLabel: '(Markdown с front matter)',
			built: 'Готовая страница',
			showHtml: 'Показать HTML, который получился',
			same: 'Тот же цикл в разных инструментах',
			tool: 'Инструмент',
			alt: 'Текстовая альтернатива:',
			altText: 'файл Markdown с front matter (заголовок и описание), данные (услуги) и общий шаблон проходят через генератор и превращаются в готовый HTML-файл. Меняя Markdown или шаблон, вы сразу видите новую страницу. В Jekyll, Eleventy, Hugo, Astro и SvelteKit цикл по данным пишется по-разному, но делает одно и то же.'
		},
		en: {
			site: 'My site',
			lang: 'en',
			items: [
				{ title: 'First service', price: 'from $300' },
				{ title: 'Second service', price: 'from $500' },
				{ title: 'Third service', price: 'by quote' }
			],
			md: `---
title: Catalog
description: What we do and what it costs
---
# Catalog

Every service is printed from the data, not typed by hand:

{% for item in items %}- **{{ item.title | escape }}**, {{ item.price | escape }}
{% endfor %}`,
			rights: 'all rights reserved',
			home: 'Home',
			catalog: 'Catalog',
			error: 'error',
			hugo: 'Hugo (Go templates)',
			caption: 'How a page is built from Markdown, data and a template',
			intro: 'This is a <strong>teaching generator</strong>, not Jekyll or Hugo: it does the same thing in miniature. Edit the Markdown on the left and the page is rebuilt. The services come from your brief, and the prices are invented.',
			layoutL: 'Page template',
			simple: 'A simple template',
			full: 'A template with a header, menu and footer',
			mdLabel: '(Markdown with front matter)',
			built: 'The finished page',
			showHtml: 'Show the HTML that came out',
			same: 'The same loop in different tools',
			tool: 'Tool',
			alt: 'Text alternative:',
			altText: 'a Markdown file with front matter (a title and a description), the data (the services) and a shared template go through the generator and come out as a finished HTML file. When you change the Markdown or the template you see the new page at once. In Jekyll, Eleventy, Hugo, Astro and SvelteKit the loop over the data is written differently, but does the same thing.'
		}
	});

	let site = $state({ title: W.site, lang: W.lang });
	let items = $state(W.items);
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

	let md = $state(W.md);

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
<footer>{{ site.title | escape }}, ${W.rights}</footer>
</body>
</html>`
	};
	let which = $state<'simple' | 'full'>('full');
	const pages = [
		{ title: W.home, path: 'index.html' },
		{ title: W.catalog, path: 'catalog.html' }
	];
	const html = $derived.by(() => {
		try {
			return buildPage(layouts[which], site, md, pages, { items });
		} catch (e) {
			return `<!-- ${W.error}: ${(e as Error).message} -->`;
		}
	});

	const syntaxes = [
		{ name: 'Jekyll (Liquid)', code: '{% for item in site.items %}\n  <li>{{ item.title }}</li>\n{% endfor %}' },
		{ name: 'Eleventy (Nunjucks)', code: '{% for item in collections.items %}\n  <li>{{ item.data.title }}</li>\n{% endfor %}' },
		{ name: W.hugo, code: '{{ range .Site.Data.items }}\n  <li>{{ .title }}</li>\n{{ end }}' },
		{ name: 'Astro', code: '{items.map((item) => (\n  <li>{item.title}</li>\n))}' },
		{ name: 'SvelteKit', code: '{#each items as item}\n  <li>{item.title}</li>\n{/each}' }
	];
	let syn = $state(0);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">{@html W.intro}</p>
	<div class="dg-ctl" role="group" aria-label={W.layoutL}>
		<button type="button" aria-pressed={which === 'simple'} onclick={() => (which = 'simple')}>{W.simple}</button>
		<button type="button" aria-pressed={which === 'full'} onclick={() => (which = 'full')}>{W.full}</button>
	</div>
	<div class="grid">
		<div>
			<label for="ssg-md"><strong>catalog.md</strong> {W.mdLabel}</label>
			<textarea id="ssg-md" class="dg-mono" rows="13" bind:value={md} spellcheck="false"></textarea>
		</div>
		<div>
			<strong>{W.built}</strong>
			<iframe title={W.built} sandbox="" srcdoc={html}></iframe>
		</div>
	</div>
	<details>
		<summary>{W.showHtml}</summary>
		<pre class="dg-box dg-mono">{html}</pre>
	</details>
	<div class="dh">{W.same}</div>
	<div class="dg-ctl" role="group" aria-label={W.tool}>
		{#each syntaxes as s, i (i)}<button type="button" aria-pressed={syn === i} onclick={() => (syn = i)}>{s.name}</button>{/each}
	</div>
	<pre class="dg-box dg-mono">{syntaxes[syn].code}</pre>
	<p class="dg-out alt"><strong>{W.alt}</strong> {W.altText}</p>
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
	.dh {
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
