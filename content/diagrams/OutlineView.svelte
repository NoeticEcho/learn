<!--
	«Что видит программа чтения с экрана» (part 2, lesson 3). The person's markup (or a ready
	example) is parsed by the browser's own DOMParser; the diagram lists the landmarks the page
	declares and its outline of headings, and says what is wrong: no h1, two main, a skipped level.
	Nothing is sent anywhere.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	const WORDS = {
		ru: {
			name: 'Название проекта',
			about: 'Обо мне',
			navLabel: 'Разделы',
			services: 'Услуги',
			first: 'Первая услуга',
			second: 'Вторая услуга',
			desc: 'Описание.',
			contact: 'Контакты',
			reach: 'Связаться',
			foot: 'Адрес и права'
		},
		en: {
			name: 'Project name',
			about: 'About me',
			navLabel: 'Sections',
			services: 'Services',
			first: 'First service',
			second: 'Second service',
			desc: 'Description.',
			contact: 'Contact',
			reach: 'Get in touch',
			foot: 'Address and copyright'
		}
	};
	const w = pick(WORDS);
	const semantic = `<header>
  <p>${w.name}</p>
  <nav aria-label="${w.navLabel}"><ul><li><a href="#a">${w.about}</a></li></ul></nav>
</header>
<main>
  <h1>${w.name}</h1>
  <section>
    <h2>${w.services}</h2>
    <article><h3>${w.first}</h3><p>${w.desc}</p></article>
    <article><h3>${w.second}</h3><p>${w.desc}</p></article>
  </section>
  <section>
    <h2>${w.contact}</h2>
  </section>
</main>
<aside><h2>${w.reach}</h2></aside>
<footer><p>${w.foot}</p></footer>`;
	const soup = `<div class="top">
  <div class="logo">${w.name}</div>
  <div class="menu"><a href="#a">${w.about}</a></div>
</div>
<div class="content">
  <div class="big">${w.name}</div>
  <div class="block">
    <div class="title">${w.services}</div>
    <div class="item"><b>${w.first}</b> ${w.desc}</div>
  </div>
</div>
<div class="bottom">${w.foot}</div>`;

	// The diagram's own words (docs/content-plan/README.md, «English edition»): one entry per edition.
	const W = pick({
		ru: {
			role: { header: 'шапка (banner)', nav: 'навигация', main: 'основное содержимое', aside: 'дополнительное', footer: 'подвал (contentinfo)', section: 'раздел', article: 'самостоятельный фрагмент' } as Record<string, string>,
			noH1: 'Нет заголовка первого уровня: программа не узнает, о чём страница.',
			manyH1: (n: number) => `Заголовков первого уровня ${n}: обычно он один.`,
			skipped: (a: number, b: number, text: string) => `Пропущен уровень: после h${a} сразу h${b} («${text}»).`,
			noMain: 'Нет элемента main: пользователь не сможет сразу перейти к основному содержимому.',
			manyMain: (n: number) => `Элементов main ${n}: должен быть один.`,
			noNav: 'Нет nav: меню не опознаётся как навигация.',
			quote: (s: string) => `«${s}»`,
			caption: 'Ориентиры и заголовки: что страница рассказывает о себе',
			example: 'Пример разметки',
			semantic: 'Смысловая разметка',
			soup: 'Всё из div',
			markup: 'Разметка (можно править)',
			landmarks: 'Ориентиры',
			noLandmarks: 'Ни одного ориентира. Диктор может только читать всё подряд сверху вниз.',
			headings: 'Заголовки',
			noHeadings: 'Ни одного заголовка. По странице нельзя перемещаться по разделам.',
			fine: 'Замечаний нет: у страницы есть заголовок первого уровня, один main, меню, и заголовки идут по порядку.'
		},
		en: {
			role: { header: 'page header (banner)', nav: 'navigation', main: 'main content', aside: 'complementary', footer: 'page footer (contentinfo)', section: 'section', article: 'self-contained piece' } as Record<string, string>,
			noH1: 'There is no level-one heading: a program cannot tell what the page is about.',
			manyH1: (n: number) => `There are ${n} level-one headings: there is usually just one.`,
			skipped: (a: number, b: number, text: string) => `A level is skipped: h${a} is followed straight by h${b} (“${text}”).`,
			noMain: 'There is no main element: a user cannot jump straight to the main content.',
			manyMain: (n: number) => `There are ${n} main elements: there should be one.`,
			noNav: 'There is no nav: the menu is not recognized as navigation.',
			quote: (s: string) => `“${s}”`,
			caption: 'Landmarks and headings: what the page says about itself',
			example: 'Example markup',
			semantic: 'Semantic markup',
			soup: 'All divs',
			markup: 'Markup (you can edit it)',
			landmarks: 'Landmarks',
			noLandmarks: 'No landmarks at all. A screen reader can only read everything in a row, from top to bottom.',
			headings: 'Headings',
			noHeadings: 'No headings at all. You cannot move around the page by sections.',
			fine: 'No remarks: the page has a level-one heading, one main, a menu, and the headings go in order.'
		}
	});

	let html = $state(semantic);
	let ready = $state(false);
	onMount(() => (ready = true));

	const ROLE = W.role;
	type Land = { tag: string; role: string; label: string; depth: number };
	type Head = { level: number; text: string };

	const parsed = $derived.by(() => {
		if (!ready) return { lands: [] as Land[], heads: [] as Head[] };
		const doc = new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html');
		const lands: Land[] = [];
		const heads: Head[] = [];
		const walk = (n: Element, depth: number) => {
			for (const c of Array.from(n.children)) {
				const tag = c.tagName.toLowerCase();
				let d = depth;
				if (ROLE[tag]) {
					lands.push({ tag, role: ROLE[tag], label: c.getAttribute('aria-label') ?? '', depth });
					d = depth + 1;
				}
				if (/^h[1-6]$/.test(tag)) heads.push({ level: +tag[1], text: (c.textContent ?? '').trim() });
				walk(c, d);
			}
		};
		walk(doc.body, 0);
		return { lands, heads };
	});

	const problems = $derived.by(() => {
		const out: string[] = [];
		const { lands, heads } = parsed;
		if (!lands.length && !heads.length) return out;
		const h1 = heads.filter((h) => h.level === 1).length;
		if (h1 === 0) out.push(W.noH1);
		if (h1 > 1) out.push(W.manyH1(h1));
		for (let i = 1; i < heads.length; i++) if (heads[i].level > heads[i - 1].level + 1) out.push(W.skipped(heads[i - 1].level, heads[i].level, heads[i].text));
		const mains = lands.filter((l) => l.tag === 'main').length;
		if (mains === 0) out.push(W.noMain);
		if (mains > 1) out.push(W.manyMain(mains));
		if (!lands.some((l) => l.tag === 'nav')) out.push(W.noNav);
		return out;
	});
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl" role="group" aria-label={W.example}>
		<button type="button" aria-pressed={html === semantic} onclick={() => (html = semantic)}>{W.semantic}</button>
		<button type="button" aria-pressed={html === soup} onclick={() => (html = soup)}>{W.soup}</button>
	</div>
	<div class="cols">
		<label>
			{W.markup}
			<textarea bind:value={html} rows="14" spellcheck="false"></textarea>
		</label>
		<div>
			<div class="dh">{W.landmarks}</div>
			{#if parsed.lands.length}
				<ul class="dg-box dg-mono tree">
					{#each parsed.lands as l, i (i)}
						<li style="padding-left: {l.depth * 1.1}rem">&lt;{l.tag}&gt; — {l.role}{l.label ? `, ${W.quote(l.label)}` : ''}</li>
					{/each}
				</ul>
			{:else}
				<p class="dg-box">{W.noLandmarks}</p>
			{/if}
			<div class="dh">{W.headings}</div>
			{#if parsed.heads.length}
				<ul class="dg-box dg-mono tree">
					{#each parsed.heads as h, i (i)}
						<li style="padding-left: {(h.level - 1) * 1.1}rem">h{h.level} — {h.text}</li>
					{/each}
				</ul>
			{:else}
				<p class="dg-box">{W.noHeadings}</p>
			{/if}
		</div>
	</div>
	<div aria-live="polite">
		{#if problems.length}
			<ul class="problems">
				{#each problems as p (p)}<li>{p}</li>{/each}
			</ul>
		{:else if parsed.lands.length || parsed.heads.length}
			<p class="dg-out">{W.fine}</p>
		{/if}
	</div>
</figure>

<style>
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	label {
		display: grid;
		gap: var(--space-1);
		min-width: 0;
	}
	textarea {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		padding: var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		resize: vertical;
		min-width: 0;
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.tree {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: var(--space-3) !important;
		font-size: 0.82rem;
		overflow-x: auto;
	}
	.problems {
		margin: var(--space-3) 0 0;
		color: var(--text-primary);
	}
</style>
