<!--
	«Что обновилось» (part 5, lesson 7). A real Svelte 5 component (with $state, $derived and an
	each block over the person's own list) running beside its source, and under it a log written by
	a MutationObserver: which nodes of the page really changed after each action. Typing in the
	search box adds or removes cards and rewrites one text node; opening a card changes one
	attribute and adds one paragraph. Nothing else is touched, which is the point of compiled
	reactivity. The listing is a copy of the logic, kept short; it is not executed from the text.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the words are in `W`, one entry per edition.
	const W = pick({
		ru: {
			items: [
				{ title: 'Первое предложение', text: 'Описание первого.' },
				{ title: 'Второе предложение', text: 'Описание второго.' },
				{ title: 'Третье предложение', text: 'Описание третьего.' }
			],
			added: (tag: string, n: number) => `в <${tag}> добавлено элементов: ${n}`,
			removed: (tag: string, n: number) => `из <${tag}> убрано элементов: ${n}`,
			text: (s: string) => `обновлён текстовый узел: «${s}»`,
			attr: (tag: string, name: string | null) => `у <${tag}> изменился атрибут ${name}`,
			caption: 'Компонент и то, что в нём обновилось',
			codeLabel: 'Код компонента',
			code: 'Код',
			shownCode: 'Показано:',
			liveLabel: 'Работающий компонент',
			live: 'Живой результат',
			find: 'Найти',
			shown: (a: number, b: number) => `Показано: ${a} из ${b}`,
			more: 'Подробнее',
			none: 'Ничего не нашлось.',
			changed: (n: number) => `Что изменилось в дереве страницы: всего ${n}`,
			empty: 'пока ничего: введите слово или нажмите «Подробнее»',
			clear: 'Очистить журнал'
		},
		en: {
			items: [
				{ title: 'First offer', text: 'A description of the first.' },
				{ title: 'Second offer', text: 'A description of the second.' },
				{ title: 'Third offer', text: 'A description of the third.' }
			],
			added: (tag: string, n: number) => `${n} ${n === 1 ? 'element' : 'elements'} added to <${tag}>`,
			removed: (tag: string, n: number) => `${n} ${n === 1 ? 'element' : 'elements'} removed from <${tag}>`,
			text: (s: string) => `a text node was updated: “${s}”`,
			attr: (tag: string, name: string | null) => `<${tag}> changed its ${name} attribute`,
			caption: 'A component and what it updated',
			codeLabel: 'The component’s code',
			code: 'Code',
			shownCode: 'Shown:',
			liveLabel: 'The running component',
			live: 'Live result',
			find: 'Find',
			shown: (a: number, b: number) => `Shown: ${a} of ${b}`,
			more: 'More',
			none: 'Nothing found.',
			changed: (n: number) => `What changed in the page tree: ${n} in all`,
			empty: 'nothing yet: type a word or press “More”',
			clear: 'Clear the log'
		}
	});

	type Item = { title: string; text: string };
	let items = $state<Item[]>(W.items);
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			if (p.items?.length) items = p.items.slice(0, 5).map((i) => ({ title: i.title, text: i.text }));
		} catch {
			/* the example stays */
		}
	});

	let query = $state('');
	let open = $state<string[]>([]);
	const shown = $derived(items.filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase())));
	const toggle = (title: string) => (open = open.includes(title) ? open.filter((t) => t !== title) : [...open, title]);

	let area = $state<HTMLElement>();
	let log = $state<string[]>([]);
	let total = $state(0);
	onMount(() => {
		if (!area) return;
		// the first moments (the list is filled from the person's brief) are not the person's actions
		let ready = false;
		const wake = setTimeout(() => (ready = true), 900);
		const obs = new MutationObserver((records) => {
			if (!ready) return;
			const lines: string[] = [];
			for (const r of records) {
				if (r.type === 'childList') {
					const add = Array.from(r.addedNodes).filter((n) => n.nodeType === 1).length;
					const del = Array.from(r.removedNodes).filter((n) => n.nodeType === 1).length;
					if (add) lines.push(W.added((r.target as Element).localName, add));
					if (del) lines.push(W.removed((r.target as Element).localName, del));
				} else if (r.type === 'characterData') lines.push(W.text((r.target.textContent ?? '').slice(0, 30)));
				else if (r.type === 'attributes') lines.push(W.attr((r.target as Element).localName, r.attributeName));
			}
			if (lines.length) {
				total += lines.length;
				log = [...lines, ...log].slice(0, 8);
			}
		});
		obs.observe(area, { childList: true, subtree: true, characterData: true, attributes: true });
		return () => {
			clearTimeout(wake);
			obs.disconnect();
		};
	});
	const clear = () => {
		log = [];
		total = 0;
	};
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="two">
		<section aria-label={W.codeLabel}>
			<div class="dh">{W.code}</div>
			<pre class="dg-box dg-mono">let query = $state('');
let shown = $derived(
  items.filter((i) =&gt; i.title.includes(query))
);

&lt;input bind:value=&#123;query&#125;&gt;
&lt;p&gt;{W.shownCode} &#123;shown.length&#125;&lt;/p&gt;
&#123;#each shown as item (item.title)&#125;
  &lt;article&gt;…&lt;/article&gt;
&#123;/each&#125;</pre>
		</section>
		<section aria-label={W.liveLabel}>
			<div class="dh">{W.live}</div>
			<div class="demo dg-box" bind:this={area}>
				<label>{W.find} <input type="search" bind:value={query} /></label>
				<p>{W.shown(shown.length, items.length)}</p>
				<div class="cards">
					{#each shown as item, i (i)}
						<article>
							<strong>{item.title}</strong>
							<button type="button" aria-expanded={open.includes(item.title)} onclick={() => toggle(item.title)}>{W.more}</button>
							{#if open.includes(item.title)}<p>{item.text}</p>{/if}
						</article>
					{:else}
						<p>{W.none}</p>
					{/each}
				</div>
			</div>
		</section>
	</div>
	<div class="logbox">
		<div class="dh">{W.changed(total)}</div>
		<ol class="dg-box log" aria-live="polite">
			{#each log as line, i (i + line)}<li>{line}</li>{:else}<li class="muted">{W.empty}</li>{/each}
		</ol>
		<button type="button" onclick={clear}>{W.clear}</button>
	</div>
</figure>

<style>
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: var(--space-4);
	}
	.dh {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	pre {
		margin: 0;
		white-space: pre-wrap;
		font-size: 0.8rem;
	}
	.demo label {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.demo input {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-body);
		color: var(--text-primary);
	}
	.cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	article {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		padding: var(--space-2);
		border: var(--line) solid var(--border-hairline);
	}
	article p {
		flex-basis: 100%;
		margin: 0;
		color: var(--text-secondary);
	}
	.logbox {
		margin-top: var(--space-4);
	}
	.log {
		margin: 0 0 var(--space-2);
		padding-left: var(--space-6);
		min-height: 3rem;
	}
	.muted {
		color: var(--text-secondary);
		list-style: none;
		margin-left: calc(-1 * var(--space-5));
	}
</style>
