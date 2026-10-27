<!--
	«Дерево страницы» (part 5, lesson 2). In `select` mode a small page is parsed into a real DOM
	(DOMParser, an inert document: nothing in it runs or loads) and the person's selector is run
	against it with the browser's own querySelectorAll, so the matches are exactly what a script
	would find; the tree is shown with the matches marked, the first one stronger, because that is
	what querySelector returns. In `inject` mode the same string is put in two ways: innerHTML
	(parsed as markup: shown as the nodes it would create, with a warning for an event handler)
	and textContent (one text node). Nothing is executed or inserted into this page.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let { mode = 'select' }: { mode?: 'select' | 'inject' } = $props();

	// ----- select mode
	let titles = $state(['Первое предложение', 'Второе предложение', 'Третье предложение']);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.length) titles = p.items.slice(0, 3).map((i) => i.title);
		} catch {
			/* the example stays */
		}
	});
	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const page = $derived(
		`<header><nav><a href="#top">Главная</a><a href="#offer">Предложения</a></nav></header><main><h1>Мастерская</h1><section id="offer"><h2>Что мы предлагаем</h2>` +
			titles.map((t) => `<article class="card"><h3>${esc(t)}</h3><p class="price">от 0 ₽</p></article>`).join('') +
			`</section></main>`
	);
	const presets = ['.card', 'h3', '#offer', '#offer .price', 'nav a', 'article:first-child', 'li'];
	let selector = $state('.card');
	let doc = $state.raw<Document | null>(null);
	$effect(() => {
		doc = new DOMParser().parseFromString(`<!doctype html><body>${page}`, 'text/html');
	});

	type Row = { depth: number; text: string; node: Node };
	const rows = $derived.by((): Row[] => {
		if (!doc) return [];
		const out: Row[] = [];
		const walk = (n: Node, depth: number) => {
			if (n.nodeType === 1) {
				const el = n as Element;
				const attrs = Array.from(el.attributes)
					.map((a) => ` ${a.name}="${a.value}"`)
					.join('');
				out.push({ depth, text: `<${el.localName}${attrs}>`, node: n });
				n.childNodes.forEach((c) => walk(c, depth + 1));
			} else if (n.nodeType === 3 && n.textContent?.trim()) out.push({ depth, text: `«${n.textContent.trim()}»`, node: n });
		};
		doc.body.childNodes.forEach((c) => walk(c, 0));
		return out;
	});
	const found = $derived.by((): { list: Element[]; error: boolean } => {
		if (!doc || !selector.trim()) return { list: [], error: false };
		try {
			return { list: Array.from(doc.body.querySelectorAll(selector)), error: false };
		} catch {
			return { list: [], error: true };
		}
	});
	const isHit = (n: Node) => found.list.includes(n as Element);

	// ----- inject mode
	let input = $state('<img src=x onerror=alert(1)>Анна');
	const injected = $derived.by(() => {
		if (typeof DOMParser === 'undefined') return { nodes: [] as string[], handlers: [] as string[] };
		const d = new DOMParser().parseFromString(`<!doctype html><body>${input}`, 'text/html');
		const nodes: string[] = [];
		const handlers: string[] = [];
		const walk = (n: Node, depth: number) => {
			if (n.nodeType === 1) {
				const el = n as Element;
				for (const a of Array.from(el.attributes)) if (a.name.startsWith('on')) handlers.push(`${a.name} у <${el.localName}>`);
				nodes.push('  '.repeat(depth) + `элемент <${el.localName}>`);
				n.childNodes.forEach((c) => walk(c, depth + 1));
			} else if (n.nodeType === 3) nodes.push('  '.repeat(depth) + `текст «${n.textContent}»`);
		};
		d.body.childNodes.forEach((c) => walk(c, 0));
		return { nodes, handlers };
	});
</script>

{#if mode === 'select'}
	<figure class="dg">
		<figcaption>Найдите элементы селектором</figcaption>
		<div class="dg-ctl" role="group" aria-label="Готовые селекторы">
			{#each presets as p (p)}
				<button type="button" class="dg-mono" aria-pressed={selector === p} onclick={() => (selector = p)}>{p}</button>
			{/each}
		</div>
		<label class="field">Свой селектор <input class="dg-mono" type="text" bind:value={selector} spellcheck="false" autocomplete="off" /></label>
		<pre class="dg-box dg-mono tree" aria-label="Дерево страницы">{#each rows as r (r)}<span class="row" class:hit={isHit(r.node)} class:first={found.list[0] === r.node} style="padding-left:{r.depth * 1.1}rem">{r.text}</span>{/each}</pre>
		<p class="dg-out" aria-live="polite">
			{#if found.error}
				<strong>Такой селектор браузер не понимает.</strong> Посмотрите на запись: в CSS он тоже не сработал бы.
			{:else if !found.list.length}
				<strong>Ничего не найдено.</strong> querySelector вернул бы <code>null</code>, а querySelectorAll пустой список.
			{:else}
				<strong>Найдено: {found.list.length}.</strong> querySelector вернул бы первый элемент (выделен сильнее), а querySelectorAll все {found.list.length}.
			{/if}
		</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>Одна строка, два способа вставки</figcaption>
		<label class="field">Что ввёл посетитель <input class="dg-mono" type="text" bind:value={input} spellcheck="false" autocomplete="off" /></label>
		<div class="two">
			<section aria-label="Через textContent">
				<div class="dh">box.textContent = строка</div>
				<pre class="dg-box dg-mono">текст «{input}»</pre>
				<p class="ok"><strong>Безопасно.</strong> Одна строка текста; на странице она появится буквами.</p>
			</section>
			<section aria-label="Через innerHTML" aria-live="polite">
				<div class="dh">box.innerHTML = строка</div>
				<pre class="dg-box dg-mono">{injected.nodes.join('\n')}</pre>
				{#if injected.handlers.length}
					<p class="bad"><strong>Опасно.</strong> В разметке есть обработчик: {injected.handlers.join(', ')}. На настоящей странице браузер создал бы элемент и выполнил этот код.</p>
				{:else if injected.nodes.some((n) => n.includes('элемент'))}
					<p class="warn"><strong>Строка стала разметкой.</strong> Здесь обработчика нет, но тот, кто вводит текст, управляет вашей разметкой.</p>
				{:else}
					<p class="ok"><strong>Здесь без тегов.</strong> Но защищает не строка, а привычка: чужой текст идёт через textContent.</p>
				{/if}
			</section>
		</div>
		<p class="note">Ничего из этого не выполняется: строка разбирается в изолированном документе, который никуда не вставляется.</p>
	</figure>
{/if}

<style>
	.field {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0 0 var(--space-3);
	}
	.field input {
		flex: 1 1 18rem;
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	.tree {
		margin: 0;
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		white-space: normal;
	}
	.row {
		display: block;
		padding-block: 0.1rem;
		overflow-wrap: anywhere;
	}
	.row.hit {
		background: color-mix(in srgb, var(--accent-measure) 22%, transparent);
		outline: 1px solid var(--accent-measure);
	}
	.row.first {
		background: color-mix(in srgb, var(--accent-measure) 45%, transparent);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 0.85rem;
	}
	p.ok,
	p.warn,
	p.bad,
	.note {
		margin: var(--space-2) 0 0;
		font-size: var(--text-body-sm);
	}
	p.bad {
		color: var(--brass-300);
	}
	.note {
		color: var(--text-secondary);
	}
</style>
