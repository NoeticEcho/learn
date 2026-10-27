<!--
	«Конвейер рендеринга» (part 1, lesson 8). The person's own HTML and CSS go through the real
	parsers of their browser (DOMParser, CSSStyleSheet) and each stage shows what it produced:
	bytes, the DOM, the CSSOM, the render tree, a simplified layout, and the painted page in a
	sandboxed frame with no scripts. A second part compares when the first paint can happen with
	a blocking script or a style sheet: the times are made-up round numbers that show the order,
	not a measurement.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let html = $state('<h1>Название проекта</h1>\n<p>Описание: кто вы и что делаете.</p>\n<p class="secret">Этот абзац скрыт.</p>');
	let css = $state('h1 { color: #8a3b12; }\n.secret { display: none; }');
	let ready = $state(false);
	onMount(async () => {
		ready = true;
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			html = `<h1>${esc(p.title)}</h1>\n<p>${esc(p.who)}</p>\n<p class="secret">Этот абзац скрыт.</p>`;
		} catch {
			/* the example stays */
		}
	});
	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	const stages = ['Байты', 'DOM', 'CSSOM', 'Дерево отрисовки', 'Раскладка', 'Отрисовка'] as const;
	let stage = $state<(typeof stages)[number]>('DOM');

	const bytes = $derived.by(() => {
		const b = new TextEncoder().encode(html).slice(0, 18);
		return [...b].map((x) => x.toString(16).padStart(2, '0')).join(' ');
	});
	// the page is prerendered in Node, which has no DOMParser: the stages fill in once it runs in the browser
	const doc = $derived(!ready ? null : new DOMParser().parseFromString('<!doctype html><body>' + html, 'text/html'));
	type Row = { depth: number; text: string; el?: Element };
	const walk = (n: Node, depth: number, out: Row[]) => {
		for (const c of Array.from(n.childNodes)) {
			if (c.nodeType === 1) {
				out.push({ depth, text: `<${(c as Element).tagName.toLowerCase()}>`, el: c as Element });
				walk(c, depth + 1, out);
			} else if (c.nodeType === 3 && c.textContent?.trim()) out.push({ depth, text: `«${c.textContent.trim().slice(0, 40)}»` });
		}
	};
	const dom = $derived.by(() => {
		const out: Row[] = [];
		if (doc) walk(doc.body, 0, out);
		return out;
	});
	const rules = $derived.by(() => {
		if (!ready) return [];
		try {
			const s = new CSSStyleSheet();
			s.replaceSync(css);
			return Array.from(s.cssRules)
				.filter((r): r is CSSStyleRule => 'selectorText' in r)
				.map((r) => ({ sel: r.selectorText, body: r.style.cssText, hide: r.style.display === 'none' }));
		} catch {
			return [];
		}
	});
	const hidden = (el: Element) => {
		if (el.hasAttribute('hidden') || (el as HTMLElement).style?.display === 'none') return true;
		return rules.some((r) => {
			try {
				return r.hide && el.matches(r.sel);
			} catch {
				return false;
			}
		});
	};
	const tree = $derived.by(() => {
		const out: (Row & { gone: boolean })[] = [];
		const go = (n: Node, depth: number, parentGone: boolean) => {
			for (const c of Array.from(n.childNodes)) {
				if (c.nodeType === 1) {
					const e = c as Element;
					const gone = parentGone || hidden(e);
					out.push({ depth, text: `<${e.tagName.toLowerCase()}>`, el: e, gone });
					go(e, depth + 1, gone);
				} else if (c.nodeType === 3 && c.textContent?.trim()) out.push({ depth, text: `«${c.textContent.trim().slice(0, 40)}»`, gone: parentGone });
			}
		};
		if (doc) go(doc.body, 0, false);
		return out;
	});
	const BLOCK = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'section', 'ul', 'ol', 'li', 'header', 'footer', 'main', 'nav', 'article', 'aside', 'form', 'table', 'blockquote', 'pre']);
	const srcdoc = $derived(`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:"><style>body{font-family:Georgia,serif;margin:12px;color:#111;background:#fff}${css.replace(/<\/style/gi, '')}</style>${html}`);

	let script = $state<'none' | 'sync' | 'defer'>('none');
	let styles = $state<'inline' | 'link'>('inline');
	const t = $derived.by(() => {
		const parse = 100;
		const parseEnd = parse + (script === 'sync' ? 400 : 0);
		const cssReady = styles === 'link' ? 350 : 0;
		const paint = Math.max(parseEnd, cssReady) + 50;
		return { parseEnd, cssReady, paint };
	});
</script>

<figure class="dg">
	<figcaption>Ваш HTML и CSS по этапам</figcaption>
	<div class="ed">
		<label>HTML<textarea bind:value={html} rows="5" spellcheck="false"></textarea></label>
		<label>CSS<textarea bind:value={css} rows="5" spellcheck="false"></textarea></label>
	</div>
	<div class="dg-ctl" role="tablist" aria-label="Этап">
		{#each stages as s, i (s)}
			<button type="button" role="tab" aria-selected={stage === s} onclick={() => (stage = s)}>{i + 1}. {s}</button>
		{/each}
	</div>
	<div class="out" role="tabpanel" aria-live="polite">
		{#if stage === 'Байты'}
			<p>Сервер присылает не текст, а байты. Вот первые байты вашего HTML в кодировке UTF-8; браузер превращает их обратно в символы:</p>
			<pre class="dg-box dg-mono">{bytes} …</pre>
		{:else if stage === 'DOM'}
			<p>Браузер читает символы, находит теги и строит из них <strong>дерево элементов</strong>, DOM. Вот оно (текст тоже узлы):</p>
			<ul class="tree dg-mono">{#each dom as r, i (i)}<li style="padding-left:{r.depth * 1.2}rem">{r.text}</li>{/each}</ul>
		{:else if stage === 'CSSOM'}
			<p>Те же шаги для стилей: из правил CSS строится своё дерево, <strong>CSSOM</strong>. У вас правил: {rules.length}.</p>
			<ul class="tree dg-mono">{#each rules as r (r.sel)}<li>{r.sel} {'{'} {r.body} {'}'}</li>{:else}<li>Правил нет или в CSS ошибка.</li>{/each}</ul>
		{:else if stage === 'Дерево отрисовки'}
			<p>DOM и CSSOM соединяются в <strong>дерево отрисовки</strong>: в него попадает только то, что будет видно. Скрытое <code>display: none</code> выпадает.</p>
			<ul class="tree dg-mono">{#each tree as r, i (i)}<li class:gone={r.gone} style="padding-left:{r.depth * 1.2}rem">{r.text}{r.gone ? ' — не попадает: скрыто' : ''}</li>{/each}</ul>
		{:else if stage === 'Раскладка'}
			<p>Для каждого элемента считают размер и место (упрощённо здесь только вид «блок или строчный»). Блок занимает всю строку, строчный идёт внутри текста.</p>
			<ul class="tree dg-mono">{#each tree.filter((r) => r.el && !r.gone) as r, i (i)}<li style="padding-left:{r.depth * 1.2}rem">{r.text} — {BLOCK.has(r.el!.tagName.toLowerCase()) ? 'блок, на всю ширину' : 'строчный, по содержимому'}</li>{/each}</ul>
		{:else}
			<p>Наконец, браузер закрашивает пиксели по слоям. Вот ваша страница, отрисованная в безопасной рамке без скриптов:</p>
			<iframe title="Отрисованная страница" sandbox="" {srcdoc}></iframe>
		{/if}
	</div>

	<div class="dh">Что задерживает первую отрисовку</div>
	<div class="dg-ctl" role="group" aria-label="Скрипт">
		<span>Скрипт в head:</span>
		{#each [['none', 'нет'], ['sync', 'обычный'], ['defer', 'с атрибутом defer']] as [v, l] (v)}
			<button type="button" aria-pressed={script === v} onclick={() => (script = v as typeof script)}>{l}</button>
		{/each}
	</div>
	<div class="dg-ctl" role="group" aria-label="Стили">
		<span>Стили:</span>
		{#each [['inline', 'внутри страницы'], ['link', 'отдельным файлом']] as [v, l] (v)}
			<button type="button" aria-pressed={styles === v} onclick={() => (styles = v as typeof styles)}>{l}</button>
		{/each}
	</div>
	<p class="dg-out" aria-live="polite">
		Условные числа. Разбор HTML закончится через <strong>{t.parseEnd} мс</strong>{script === 'sync' ? ' (обычный скрипт остановил разбор на 400 мс)' : script === 'defer' ? ' (скрипт с defer грузится параллельно и не мешает)' : ''}. Стили будут готовы через <strong>{t.cssReady} мс</strong>{styles === 'link' ? ' (пока файл не пришёл, браузер ничего не рисует: чтобы не показать страницу без оформления)' : ''}. Первая отрисовка: <strong>{t.paint} мс</strong>.
	</p>
</figure>

<style>
	.ed {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.ed label {
		display: grid;
		gap: var(--space-1);
	}
	textarea {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		padding: var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		resize: vertical;
		min-width: 0;
	}
	.out {
		margin-top: var(--space-3);
	}
	.out p {
		margin: 0 0 var(--space-2);
		max-width: var(--measure);
	}
	.tree {
		list-style: none;
		padding: var(--space-3) !important;
		margin: 0;
		background: var(--surface-canvas);
		border: var(--line) solid var(--border-hairline);
		font-size: 0.85rem;
		overflow-x: auto;
	}
	.gone {
		color: var(--text-secondary);
		text-decoration: line-through;
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	iframe {
		width: 100%;
		height: 11rem;
		border: var(--line) solid var(--border-hairline);
		background: #fff;
	}
	.dh {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
