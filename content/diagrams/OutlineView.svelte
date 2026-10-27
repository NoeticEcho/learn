<!--
	«Что видит программа чтения с экрана» (part 2, lesson 3). The person's markup (or a ready
	example) is parsed by the browser's own DOMParser; the diagram lists the landmarks the page
	declares and its outline of headings, and says what is wrong: no h1, two main, a skipped level.
	Nothing is sent anywhere.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	const semantic = `<header>
  <p>Название проекта</p>
  <nav aria-label="Разделы"><ul><li><a href="#a">Обо мне</a></li></ul></nav>
</header>
<main>
  <h1>Название проекта</h1>
  <section>
    <h2>Услуги</h2>
    <article><h3>Первая услуга</h3><p>Описание.</p></article>
    <article><h3>Вторая услуга</h3><p>Описание.</p></article>
  </section>
  <section>
    <h2>Контакты</h2>
  </section>
</main>
<aside><h2>Связаться</h2></aside>
<footer><p>Адрес и права</p></footer>`;
	const soup = `<div class="top">
  <div class="logo">Название проекта</div>
  <div class="menu"><a href="#a">Обо мне</a></div>
</div>
<div class="content">
  <div class="big">Название проекта</div>
  <div class="block">
    <div class="title">Услуги</div>
    <div class="item"><b>Первая услуга</b> Описание.</div>
  </div>
</div>
<div class="bottom">Адрес и права</div>`;

	let html = $state(semantic);
	let ready = $state(false);
	onMount(() => (ready = true));

	const ROLE: Record<string, string> = { header: 'шапка (banner)', nav: 'навигация', main: 'основное содержимое', aside: 'дополнительное', footer: 'подвал (contentinfo)', section: 'раздел', article: 'самостоятельный фрагмент' };
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
		if (h1 === 0) out.push('Нет заголовка первого уровня: программа не узнает, о чём страница.');
		if (h1 > 1) out.push(`Заголовков первого уровня ${h1}: обычно он один.`);
		for (let i = 1; i < heads.length; i++) if (heads[i].level > heads[i - 1].level + 1) out.push(`Пропущен уровень: после h${heads[i - 1].level} сразу h${heads[i].level} («${heads[i].text}»).`);
		const mains = lands.filter((l) => l.tag === 'main').length;
		if (mains === 0) out.push('Нет элемента main: пользователь не сможет сразу перейти к основному содержимому.');
		if (mains > 1) out.push(`Элементов main ${mains}: должен быть один.`);
		if (!lands.some((l) => l.tag === 'nav')) out.push('Нет nav: меню не опознаётся как навигация.');
		return out;
	});
</script>

<figure class="dg">
	<figcaption>Ориентиры и заголовки: что страница рассказывает о себе</figcaption>
	<div class="dg-ctl" role="group" aria-label="Пример разметки">
		<button type="button" aria-pressed={html === semantic} onclick={() => (html = semantic)}>Смысловая разметка</button>
		<button type="button" aria-pressed={html === soup} onclick={() => (html = soup)}>Всё из div</button>
	</div>
	<div class="cols">
		<label>
			Разметка (можно править)
			<textarea bind:value={html} rows="14" spellcheck="false"></textarea>
		</label>
		<div>
			<h4>Ориентиры</h4>
			{#if parsed.lands.length}
				<ul class="dg-box dg-mono tree">
					{#each parsed.lands as l, i (i)}
						<li style="padding-left: {l.depth * 1.1}rem">&lt;{l.tag}&gt; — {l.role}{l.label ? `, «${l.label}»` : ''}</li>
					{/each}
				</ul>
			{:else}
				<p class="dg-box">Ни одного ориентира. Диктор может только читать всё подряд сверху вниз.</p>
			{/if}
			<h4>Заголовки</h4>
			{#if parsed.heads.length}
				<ul class="dg-box dg-mono tree">
					{#each parsed.heads as h, i (i)}
						<li style="padding-left: {(h.level - 1) * 1.1}rem">h{h.level} — {h.text}</li>
					{/each}
				</ul>
			{:else}
				<p class="dg-box">Ни одного заголовка. По странице нельзя перемещаться по разделам.</p>
			{/if}
		</div>
	</div>
	<div aria-live="polite">
		{#if problems.length}
			<ul class="problems">
				{#each problems as p (p)}<li>{p}</li>{/each}
			</ul>
		{:else if parsed.lands.length || parsed.heads.length}
			<p class="dg-out">Замечаний нет: у страницы есть заголовок первого уровня, один main, меню, и заголовки идут по порядку.</p>
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
	h4 {
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
