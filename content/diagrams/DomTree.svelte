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
	import { pick } from '#lib/i18n/index.ts';

	// The words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			titles: ['Первое предложение', 'Второе предложение', 'Третье предложение'],
			home: 'Главная',
			offers: 'Предложения',
			workshop: 'Мастерская',
			whatWeOffer: 'Что мы предлагаем',
			from: 'от 0 ₽',
			text: (s: string) => `«${s}»`,
			handlerOn: (name: string, tag: string) => `${name} у <${tag}>`,
			element: 'элемент',
			textNode: 'текст',
			sample: '<img src=x onerror=alert(1)>Анна',
			selectCaption: 'Найдите элементы селектором',
			presetsLabel: 'Готовые селекторы',
			own: 'Свой селектор',
			treeLabel: 'Дерево страницы',
			badSelector: 'Такой селектор браузер не понимает.',
			badSelectorRest: ' Посмотрите на запись: в CSS он тоже не сработал бы.',
			nothing: 'Ничего не найдено.',
			nothingRest: ['querySelector вернул бы ', 'null', ', а querySelectorAll пустой список.'],
			found: (n: number) => `Найдено: ${n}.`,
			foundRest: (n: number) => ` querySelector вернул бы первый элемент (выделен сильнее), а querySelectorAll все ${n}.`,
			injectCaption: 'Одна строка, два способа вставки',
			typed: 'Что ввёл посетитель',
			viaText: 'Через textContent',
			viaHtml: 'Через innerHTML',
			stringWord: 'строка',
			safe: 'Безопасно.',
			safeRest: ' Одна строка текста; на странице она появится буквами.',
			danger: 'Опасно.',
			dangerRest: (list: string) => ` В разметке есть обработчик: ${list}. На настоящей странице браузер создал бы элемент и выполнил этот код.`,
			markup: 'Строка стала разметкой.',
			markupRest: ' Здесь обработчика нет, но тот, кто вводит текст, управляет вашей разметкой.',
			noTags: 'Здесь без тегов.',
			noTagsRest: ' Но защищает не строка, а привычка: чужой текст идёт через textContent.',
			note: 'Ничего из этого не выполняется: строка разбирается в изолированном документе, который никуда не вставляется.'
		},
		en: {
			titles: ['First offer', 'Second offer', 'Third offer'],
			home: 'Home',
			offers: 'Offers',
			workshop: 'Workshop',
			whatWeOffer: 'What we offer',
			from: 'from £0',
			text: (s: string) => `“${s}”`,
			handlerOn: (name: string, tag: string) => `${name} on <${tag}>`,
			element: 'element',
			textNode: 'text',
			sample: '<img src=x onerror=alert(1)>Anna',
			selectCaption: 'Find elements with a selector',
			presetsLabel: 'Ready-made selectors',
			own: 'Your own selector',
			treeLabel: 'The page tree',
			badSelector: 'The browser doesn’t understand that selector.',
			badSelectorRest: ' Look at how it is written: it wouldn’t work in CSS either.',
			nothing: 'Nothing found.',
			nothingRest: ['querySelector would return ', 'null', ', and querySelectorAll an empty list.'],
			found: (n: number) => `Found: ${n}.`,
			foundRest: (n: number) => ` querySelector would return the first element (highlighted more strongly), and querySelectorAll all ${n}.`,
			injectCaption: 'One string, two ways to insert it',
			typed: 'What the visitor typed',
			viaText: 'Through textContent',
			viaHtml: 'Through innerHTML',
			stringWord: 'string',
			safe: 'Safe.',
			safeRest: ' One string of text; on the page it appears as plain letters.',
			danger: 'Dangerous.',
			dangerRest: (list: string) => ` The markup has an event handler: ${list}. On a real page the browser would create the element and run that code.`,
			markup: 'The string became markup.',
			markupRest: ' There is no handler here, but whoever types the text controls your markup.',
			noTags: 'No tags here.',
			noTagsRest: ' But it is not the string that protects you, it is the habit: other people’s text goes through textContent.',
			note: 'None of this is run: the string is parsed in an isolated document that is never inserted anywhere.'
		}
	});

	let { mode = 'select' }: { mode?: 'select' | 'inject' } = $props();

	// ----- select mode
	let titles = $state(W.titles);
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
		`<header><nav><a href="#top">${W.home}</a><a href="#offer">${W.offers}</a></nav></header><main><h1>${W.workshop}</h1><section id="offer"><h2>${W.whatWeOffer}</h2>` +
			titles.map((t) => `<article class="card"><h3>${esc(t)}</h3><p class="price">${W.from}</p></article>`).join('') +
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
			} else if (n.nodeType === 3 && n.textContent?.trim()) out.push({ depth, text: W.text(n.textContent.trim()), node: n });
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
	let input = $state(W.sample);
	const injected = $derived.by(() => {
		if (typeof DOMParser === 'undefined') return { nodes: [] as string[], handlers: [] as string[] };
		const d = new DOMParser().parseFromString(`<!doctype html><body>${input}`, 'text/html');
		const nodes: string[] = [];
		const handlers: string[] = [];
		const walk = (n: Node, depth: number) => {
			if (n.nodeType === 1) {
				const el = n as Element;
				for (const a of Array.from(el.attributes)) if (a.name.startsWith('on')) handlers.push(W.handlerOn(a.name, el.localName));
				nodes.push('  '.repeat(depth) + `${W.element} <${el.localName}>`);
				n.childNodes.forEach((c) => walk(c, depth + 1));
			} else if (n.nodeType === 3) nodes.push('  '.repeat(depth) + `${W.textNode} ${W.text(n.textContent ?? '')}`);
		};
		d.body.childNodes.forEach((c) => walk(c, 0));
		return { nodes, handlers };
	});
</script>

{#if mode === 'select'}
	<figure class="dg">
		<figcaption>{W.selectCaption}</figcaption>
		<div class="dg-ctl" role="group" aria-label={W.presetsLabel}>
			{#each presets as p (p)}
				<button type="button" class="dg-mono" aria-pressed={selector === p} onclick={() => (selector = p)}>{p}</button>
			{/each}
		</div>
		<label class="field">{W.own} <input class="dg-mono" type="text" bind:value={selector} spellcheck="false" autocomplete="off" /></label>
		<pre class="dg-box dg-mono tree" aria-label={W.treeLabel}>{#each rows as r (r)}<span class="row" class:hit={isHit(r.node)} class:first={found.list[0] === r.node} style="padding-left:{r.depth * 1.1}rem">{r.text}</span>{/each}</pre>
		<p class="dg-out" aria-live="polite">
			{#if found.error}
				<strong>{W.badSelector}</strong>{W.badSelectorRest}
			{:else if !found.list.length}
				<strong>{W.nothing}</strong> {W.nothingRest[0]}<code>{W.nothingRest[1]}</code>{W.nothingRest[2]}
			{:else}
				<strong>{W.found(found.list.length)}</strong>{W.foundRest(found.list.length)}
			{/if}
		</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>{W.injectCaption}</figcaption>
		<label class="field">{W.typed} <input class="dg-mono" type="text" bind:value={input} spellcheck="false" autocomplete="off" /></label>
		<div class="two">
			<section aria-label={W.viaText}>
				<div class="dh">box.textContent = {W.stringWord}</div>
				<pre class="dg-box dg-mono">{W.textNode} {W.text(input)}</pre>
				<p class="ok"><strong>{W.safe}</strong>{W.safeRest}</p>
			</section>
			<section aria-label={W.viaHtml} aria-live="polite">
				<div class="dh">box.innerHTML = {W.stringWord}</div>
				<pre class="dg-box dg-mono">{injected.nodes.join('\n')}</pre>
				{#if injected.handlers.length}
					<p class="bad"><strong>{W.danger}</strong>{W.dangerRest(injected.handlers.join(', '))}</p>
				{:else if injected.nodes.some((n) => n.includes(W.element))}
					<p class="warn"><strong>{W.markup}</strong>{W.markupRest}</p>
				{:else}
					<p class="ok"><strong>{W.noTags}</strong>{W.noTagsRest}</p>
				{/if}
			</section>
		</div>
		<p class="note">{W.note}</p>
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
