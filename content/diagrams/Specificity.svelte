<!--
	«Кто победит» (part 3, lesson 1). A calculator for the cascade. One element, a few rules that
	all set its colour. For each rule the diagram asks the browser itself whether the selector
	matches (Element.matches on a real element built in memory), counts the selector's specificity
	as three numbers (ids, classes, tags), and applies the cascade's order: !important, then
	specificity, then the later rule. Nothing here is a model of the browser's answer: the match is
	the browser's, the counting is the rule written out.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { pick } from '#lib/i18n/index.ts';

	// Bilingual (docs/content-plan/README.md, «English edition»): the diagram's words are in `W`, one
	// entry per edition. The colours are kept as internal ids; the person sees their names.
	const W = pick({
		ru: {
			colours: { red: 'красный', blue: 'синий', green: 'зелёный', orange: 'оранжевый' } as Record<string, string>,
			presets: ['Класс против тега', 'Id против класса', 'Поровну: решает порядок', '!important'],
			cta: 'Записаться',
			notSelector: 'не селектор',
			noMatch: 'не подходит к ссылке',
			wins: 'побеждает',
			lostImportant: 'проиграло: у соперника !important',
			lostSpec: 'проиграло: у соперника специфичность выше',
			lostOrder: 'проиграло: при равной специфичности побеждает правило ниже по файлу',
			caption: 'Все правила красят одну и ту же ссылку',
			element: 'Элемент:',
			inside: 'внутри',
			oneProp: 'У каждого правила одно свойство:',
			presetsLabel: 'Готовые наборы',
			th: ['№', 'Селектор', 'color', '!important', 'Счёт (id, класс, тег)', 'Итог'],
			selectorOf: (n: number) => `Селектор правила ${n}`,
			colourOf: (n: number) => `Цвет правила ${n}`,
			importantOf: (n: number) => `!important у правила ${n}`,
			add: 'Добавить правило',
			removeLast: 'Убрать последнее',
			linkIs: 'Ссылка будет цвета:',
			rule: 'правило',
			none: 'Ни одно правило не подходит, и ссылка останется цвета по умолчанию.',
			order: 'Порядок такой: сначала !important, потом специфичность, потом то, что ниже по файлу.'
		},
		en: {
			colours: { red: 'red', blue: 'blue', green: 'green', orange: 'orange' } as Record<string, string>,
			presets: ['Class against tag', 'Id against class', 'A tie: order decides', '!important'],
			cta: 'Book now',
			notSelector: 'not a selector',
			noMatch: 'does not match the link',
			wins: 'wins',
			lostImportant: 'loses: the rival has !important',
			lostSpec: 'loses: the rival is more specific',
			lostOrder: 'loses: on equal specificity the later rule wins',
			caption: 'Every rule colors the same link',
			element: 'The element:',
			inside: 'inside',
			oneProp: 'Each rule sets one property:',
			presetsLabel: 'Ready-made sets',
			th: ['No.', 'Selector', 'color', '!important', 'Count (id, class, tag)', 'Result'],
			selectorOf: (n: number) => `Selector of rule ${n}`,
			colourOf: (n: number) => `Color of rule ${n}`,
			importantOf: (n: number) => `!important on rule ${n}`,
			add: 'Add a rule',
			removeLast: 'Remove the last one',
			linkIs: 'The link will be',
			rule: 'rule',
			none: 'No rule matches, so the link keeps its default color.',
			order: 'The order is: !important first, then specificity, then whatever comes later in the file.'
		}
	});

	type Rule = { id: number; selector: string; value: string; important: boolean };
	const colours: Record<string, string> = { red: '#b83226', blue: '#1f5fae', green: '#2a7448', orange: '#9c5508' };
	let uid = 10;
	const mk = (selector: string, value: string, important = false): Rule => ({ id: uid++, selector, value, important });
	const presets: { name: string; rules: () => Rule[] }[] = [
		{ name: W.presets[0], rules: () => [mk('nav a', 'green'), mk('.button', 'blue'), mk('a', 'red')] },
		{ name: W.presets[1], rules: () => [mk('#cta', 'orange'), mk('header nav .button', 'blue')] },
		{ name: W.presets[2], rules: () => [mk('.button', 'red'), mk('nav a', 'green'), mk('a.button', 'blue')] },
		{ name: W.presets[3], rules: () => [mk('a', 'red', true), mk('#cta', 'blue')] }
	];
	let rules = $state<Rule[]>(presets[0].rules());
	let ready = $state(false);
	let el: HTMLElement | null = null;
	onMount(() => {
		const header = document.createElement('header');
		header.innerHTML = `<nav><a class="button" id="cta" href="#">${W.cta}</a></nav>`;
		el = header.querySelector('a');
		ready = true;
	});

	/** (ids, classes, tags) of a selector; :where() counts nothing, :is(), :not() and :has() count their strongest argument. */
	function spec(sel: string): [number, number, number] {
		let s = sel.replace(/"[^"]*"|'[^']*'/g, '');
		let extra: [number, number, number] = [0, 0, 0];
		for (let prev = ''; prev !== s; ) {
			prev = s;
			s = s.replace(/:(where|is|not|has)\(([^()]*)\)/g, (_, fn: string, args: string) => {
				if (fn !== 'where') {
					const top = args.split(',').map((x) => spec(x)).reduce((m, x) => (cmp(x, m) >= 0 ? x : m), [0, 0, 0] as [number, number, number]);
					extra = [extra[0] + top[0], extra[1] + top[1], extra[2] + top[2]];
				}
				return '';
			});
		}
		s = s.replace(/\[[^\]]*\]/g, ' .a ');
		const ids = (s.match(/#[\w-]+/g) ?? []).length;
		const pseudoEl = (s.match(/::[\w-]+/g) ?? []).length;
		const classes = (s.match(/\.[\w-]+/g) ?? []).length + (s.replace(/::[\w-]+/g, '').match(/:[\w-]+/g) ?? []).length;
		const tags = (s.replace(/[#.:][\w-]+/g, ' ').match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) ?? []).length + pseudoEl;
		return [ids + extra[0], classes + extra[1], tags + extra[2]];
	}
	const cmp = (a: number[], b: number[]) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
	const matches = (sel: string) => {
		if (!el) return false;
		try {
			return el.matches(sel);
		} catch {
			return false;
		}
	};
	const valid = (sel: string) => {
		try {
			document.createElement('i').matches(sel);
			return true;
		} catch {
			return false;
		}
	};

	const rows = $derived(
		rules.map((r, order) => ({ r, order, ok: ready && valid(r.selector), hit: ready && matches(r.selector), s: spec(r.selector) }))
	);
	const winner = $derived.by(() => {
		const hits = rows.filter((x) => x.hit);
		if (!hits.length) return null;
		return hits.reduce((w, x) => {
			if (x.r.important !== w.r.important) return x.r.important ? x : w;
			const c = cmp(x.s, w.s);
			return c > 0 || (c === 0 && x.order > w.order) ? x : w;
		});
	});
	const why = (x: (typeof rows)[number]) => {
		if (!x.ok) return W.notSelector;
		if (!x.hit) return W.noMatch;
		if (winner && x.r.id === winner.r.id) return W.wins;
		if (winner && x.r.important !== winner.r.important) return W.lostImportant;
		const c = winner ? cmp(x.s, winner.s) : 0;
		return c < 0 ? W.lostSpec : W.lostOrder;
	};
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="dg-out">
		{W.element} <span class="dg-mono">&lt;a class="button" id="cta"&gt;</span> {W.inside} <span class="dg-mono">nav</span> {W.inside} <span class="dg-mono">header</span>. {W.oneProp} <span class="dg-mono">color</span>.
	</p>
	<div class="dg-ctl" role="group" aria-label={W.presetsLabel}>
		{#each presets as p (p.name)}
			<button type="button" onclick={() => (rules = p.rules())}>{p.name}</button>
		{/each}
	</div>
	<div class="wrap">
		<table>
			<thead>
				<tr>{#each W.th as h (h)}<th scope="col">{h}</th>{/each}</tr>
			</thead>
			<tbody>
				{#each rows as x, i (x.r.id)}
					<tr class:win={winner?.r.id === x.r.id} class:off={!x.hit}>
						<th scope="row">{i + 1}</th>
						<td><input type="text" aria-label={W.selectorOf(i + 1)} bind:value={x.r.selector} spellcheck="false" /></td>
						<td>
							<select aria-label={W.colourOf(i + 1)} bind:value={x.r.value}>
								{#each Object.keys(colours) as c (c)}<option value={c}>{W.colours[c]}</option>{/each}
							</select>
						</td>
						<td><input type="checkbox" aria-label={W.importantOf(i + 1)} bind:checked={x.r.important} /></td>
						<td class="dg-mono">{x.ok ? `(${x.s.join(', ')})` : '—'}</td>
						<td>{why(x)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="dg-ctl">
		<button type="button" onclick={() => (rules = [...rules, mk('.button', 'red')])}>{W.add}</button>
		{#if rules.length > 1}<button type="button" onclick={() => (rules = rules.slice(0, -1))}>{W.removeLast}</button>{/if}
	</div>
	<p class="dg-out" aria-live="polite">
		{#if winner}
			{W.linkIs} <strong class="swatch" style="color: {colours[winner.r.value]}">{W.colours[winner.r.value]}</strong> ({W.rule} {winner.order + 1}: <span class="dg-mono">{winner.r.selector}</span>).
		{:else}
			{W.none}
		{/if}
		{W.order}
	</p>
</figure>

<style>
	/* the link colours are the demo's own, dark enough for Paper; on Ink they sit on a light chip, so they hold 4.5:1 in both themes */
	.swatch {
		padding: 0 0.25em;
		background: #fbfaf6;
		border-radius: 2px;
	}
	.wrap {
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: var(--text-body-sm);
	}
	th,
	td {
		border: var(--line) solid var(--border-hairline);
		padding: var(--space-1) var(--space-2);
		text-align: left;
		vertical-align: middle;
	}
	thead th {
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	tr.win td,
	tr.win th {
		background: var(--surface-canvas);
		color: var(--text-primary);
	}
	tr.off td:not(:first-child) {
		opacity: 0.75;
	}
	input[type='text'],
	select {
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-rule);
		background: var(--surface-canvas);
		color: var(--text-primary);
		font-family: var(--font-mono);
		min-width: 7rem;
		width: 100%;
	}
	input[type='checkbox'] {
		min-width: var(--hit-min);
		min-height: var(--hit-min);
		accent-color: var(--accent-measure);
	}
</style>
