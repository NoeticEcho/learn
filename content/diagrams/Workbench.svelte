<!--
	«Рабочее место» (part 0, lesson 3): three panels, the file, the preview and the element tree,
	tied together. Choosing an element in any of them lights it in the other two. A button breaks
	the page the way a forgotten closing tag does, and the checks say what went wrong.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';

	let title = $state('Ваш проект');
	let who = $state('Кто вы и что делаете');
	let broken = $state(false);
	let sel = $state<'h1' | 'p' | null>(null);

	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			title = p.title;
			who = p.who;
		} catch {
			/* the example words stay */
		}
	});

	const lines = $derived([
		{ id: null, code: '<!doctype html>' },
		{ id: null, code: '<html lang="ru">' },
		{ id: null, code: '<body>' },
		{ id: 'h1' as const, code: broken ? `  <h1>${title}` : `  <h1>${title}</h1>` },
		{ id: 'p' as const, code: `  <p>${who}</p>` },
		{ id: null, code: '</body>' },
		{ id: null, code: '</html>' }
	]);
	const pick = (id: 'h1' | 'p') => (sel = sel === id ? null : id);
	const checks = $derived([
		{ ok: true, text: 'На странице есть один h1' },
		{ ok: !broken, text: 'Текст заголовка совпадает с названием проекта' },
		{ ok: !broken, text: 'Есть абзац с описанием, отдельный от заголовка' }
	]);
</script>

<figure class="dg">
	<figcaption>Файл, предпросмотр и дерево элементов</figcaption>
	<div class="dg-ctl">
		<button type="button" aria-pressed={broken} onclick={() => (broken = !broken)}>
			{broken ? 'Вернуть закрывающий тег' : 'Забыть закрывающий тег </h1>'}
		</button>
		<span>Нажмите на строку, на элемент или на узел дерева: он подсветится везде.</span>
	</div>
	<div class="three">
		<section aria-label="Файл index.html">
			<h4>Файл</h4>
			<ol class="dg-mono code">
				{#each lines as l, i (i)}
					<li class:hot={l.id && sel === l.id}>
						{#if l.id}<button type="button" onclick={() => pick(l.id)} aria-pressed={sel === l.id}>{l.code}</button>{:else}<span>{l.code}</span>{/if}
					</li>
				{/each}
			</ol>
		</section>
		<section aria-label="Предпросмотр">
			<h4>Предпросмотр</h4>
			<div class="page">
				<button type="button" class="h1" class:hot={sel === 'h1'} onclick={() => pick('h1')}>
					{title}{#if broken}<span class="swallow"> {who}</span>{/if}
				</button>
				{#if !broken}
					<button type="button" class="pp" class:hot={sel === 'p'} onclick={() => pick('p')}>{who}</button>
				{/if}
			</div>
		</section>
		<section aria-label="Дерево элементов">
			<h4>Дерево элементов</h4>
			<ul class="tree dg-mono">
				<li>html lang="ru"</li>
				<li class="l1">body</li>
				<li class="l2" class:hot={sel === 'h1'}>
					<button type="button" onclick={() => pick('h1')} aria-pressed={sel === 'h1'}>h1</button>
				</li>
				{#if broken}
					<li class="l3" class:hot={sel === 'p'}><button type="button" onclick={() => pick('p')} aria-pressed={sel === 'p'}>p внутри h1</button></li>
				{:else}
					<li class="l2" class:hot={sel === 'p'}><button type="button" onclick={() => pick('p')} aria-pressed={sel === 'p'}>p</button></li>
				{/if}
			</ul>
		</section>
	</div>
	<ul class="checks" aria-live="polite">
		{#each checks as c (c.text)}
			<li class:bad={!c.ok}><span aria-hidden="true">{c.ok ? '✓' : '○'}</span> {c.text}<span class="visually-hidden">{c.ok ? ': выполнено' : ': не выполнено'}</span></li>
		{/each}
	</ul>
</figure>

<style>
	.three {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--space-4);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.code,
	.tree {
		margin: 0;
		padding: var(--space-3);
		list-style: none;
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-canvas);
		min-height: 11rem;
		font-size: 0.8rem;
	}
	.code li {
		white-space: pre;
		overflow-x: auto;
	}
	.code button,
	.tree button {
		all: unset;
		cursor: pointer;
		white-space: pre;
	}
	.hot {
		background: color-mix(in srgb, var(--accent-measure) 22%, transparent);
	}
	.page {
		min-height: 11rem;
		padding: var(--space-3);
		background: var(--preview-canvas, #fff);
		color: #111;
		font-family: Georgia, serif;
	}
	.page button {
		all: unset;
		display: block;
		cursor: pointer;
		width: 100%;
		box-sizing: border-box;
	}
	.h1 {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: var(--space-2);
	}
	.swallow {
		font-weight: bold;
	}
	.pp {
		font-size: 1rem;
	}
	.page .hot {
		background: #ffe9a8;
	}
	.l1 {
		padding-left: 1ch;
	}
	.l2 {
		padding-left: 2ch;
	}
	.l3 {
		padding-left: 3ch;
	}
	.checks {
		list-style: none;
		margin: var(--space-4) 0 0;
		padding: 0;
	}
	.checks li.bad {
		color: var(--text-secondary);
	}
	.dg button:focus-visible {
		outline: 2px solid var(--border-focus);
	}
</style>
