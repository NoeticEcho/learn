<!--
	«Формулы на вашем брифе» (part 11). The formulas named in `sets` are laid out block by block.
	Each block says what it has to do, the question the writer answers, and the fact of the
	person's own brief that feeds it, read from the browser, so the skeleton is theirs. The diagram
	writes no sentences: the writing is the practice. With `guess`, a second tab asks which formula
	a short text was written by, with the reason after each answer.
-->
<script lang="ts">
	import './shared.css';
	import { onMount } from 'svelte';
	import { formulasFor, guessesFor, type Formula, type Src } from './formulas.ts';
	import { pick as pickW } from '#lib/i18n/index.ts';

	let { sets, guess }: { sets: string; guess?: string } = $props();

	const formulas = formulasFor();
	const chosen = $derived(sets.split(/\s+/).map((id) => formulas.find((f) => f.id === id)).filter((f): f is Formula => !!f));
	let tab = $state<string>('');
	$effect(() => {
		if (!tab) tab = chosen[0]?.id ?? '';
	});
	const current = $derived(chosen.find((f) => f.id === tab));

	type Facts = Record<Src, string>;
	const W = pickW({
		ru: {
			missing: '(в брифе пока пусто: заполните это поле в настройках)',
			noPrice: 'цену или условия пока нигде не записано',
			facts: {
				forWhom: 'Для кого проект: поле «для кого» в брифе',
				who: 'Кто вы: поле «кто и что» в брифе',
				action: 'Главное действие из брифа',
				item: 'Первая услуга или товар из брифа',
				itemText: 'Описание первой услуги или товара',
				price: 'Цена или условия первой услуги',
				proof: 'Первое доказательство из брифа',
				sections: 'Разделы из брифа',
				contacts: 'Контакты из брифа',
				none: 'Тут нет поля брифа: ответ знаете вы'
			} as Facts,
			capDesk: 'Формула, разложенная на ваш бриф',
			capGuess: 'Какая это формула?',
			mode: 'Режим',
			desk: 'Разложить на бриф',
			guessTab: 'Угадать формулу',
			formula: 'Формула',
			ask: 'Вопрос себе:',
			from: 'Из вашего брифа:',
			note: 'Строки «Из вашего брифа» взяты из ваших данных. Остальное придумываете вы: блок за блоком, в порядке формулы.',
			textOf: (n: number) => `Формула текста ${n}`,
			right: 'Верно.',
			no: (f: string) => `Нет, это ${f}.`,
			hits: 'Верно:',
			of: 'из'
		},
		en: {
			missing: '(empty in the brief so far: fill in this field in settings)',
			noPrice: 'no price or terms are written anywhere yet',
			facts: {
				forWhom: 'Who the project is for: the “for whom” field of the brief',
				who: 'Who you are: the “who and what” field of the brief',
				action: 'The main action from the brief',
				item: 'The first service or product from the brief',
				itemText: 'The description of the first service or product',
				price: 'The price or terms of the first service',
				proof: 'The first proof from the brief',
				sections: 'The sections from the brief',
				contacts: 'The contacts from the brief',
				none: 'There is no brief field here: you know the answer'
			} as Facts,
			capDesk: 'A formula laid out on your brief',
			capGuess: 'Which formula is it?',
			mode: 'Mode',
			desk: 'Lay it out on the brief',
			guessTab: 'Guess the formula',
			formula: 'Formula',
			ask: 'Ask yourself:',
			from: 'From your brief:',
			note: 'The lines “From your brief” come from your data. You make up the rest, block by block, in the formula’s order.',
			textOf: (n: number) => `Formula of text ${n}`,
			right: 'Right.',
			no: (f: string) => `No, this is ${f}.`,
			hits: 'Right:',
			of: 'of'
		}
	});
	const missing = W.missing;
	let facts = $state<Facts>({ ...W.facts });
	onMount(async () => {
		try {
			const p = await (await import('#lib/learner.ts')).persona();
			facts = {
				forWhom: p.forWhom || missing,
				who: p.who || missing,
				action: p.mainAction.label || missing,
				item: p.items[0]?.title || missing,
				itemText: p.items[0]?.text || p.items[0]?.title || missing,
				price: p.items[0]?.price || W.noPrice,
				proof: p.proofs[0]?.title || missing,
				sections: p.sections.length ? p.sections.join(' → ') : missing,
				contacts: [p.phone, p.email].filter(Boolean).join(', ') || missing,
				none: W.facts.none
			};
		} catch {
			/* the generic labels stay */
		}
	});

	// the guessing game
	const game = $derived(guess ? guessesFor()[guess] : undefined);
	let mode = $state<'desk' | 'guess'>('desk');
	let pick = $state<(string | null)[]>([]);
	$effect(() => {
		if (game && pick.length !== game.items.length) pick = game.items.map(() => null);
	});
	const nameOf = (id: string) => formulas.find((f) => f.id === id)?.name ?? id;
	const hits = $derived(game ? game.items.filter((g, i) => pick[i] === g.right).length : 0);
</script>

<figure class="dg">
	<figcaption>{mode === 'desk' ? W.capDesk : W.capGuess}</figcaption>
	{#if game}
		<div class="dg-ctl" role="tablist" aria-label={W.mode}>
			<button type="button" role="tab" aria-selected={mode === 'desk'} onclick={() => (mode = 'desk')}>{W.desk}</button>
			<button type="button" role="tab" aria-selected={mode === 'guess'} onclick={() => (mode = 'guess')}>{W.guessTab}</button>
		</div>
	{/if}

	{#if mode === 'desk'}
		{#if chosen.length > 1}
			<div class="dg-ctl" role="group" aria-label={W.formula}>
				{#each chosen as f (f.id)}
					<button type="button" aria-pressed={tab === f.id} onclick={() => (tab = f.id)}>{f.name}</button>
				{/each}
			</div>
		{/if}
		{#if current}
			<ol class="blocks">
				{#each current.blocks as b, i (i)}
					<li>
						<p class="head"><span class="code">{b.code}</span> <strong>{b.name}</strong></p>
						<p class="does">{b.does}</p>
						<p class="ask">{W.ask} {b.ask}</p>
						<p class="fact" class:none={b.src === 'none'}>{#if b.src !== 'none'}<span class="from">{W.from}</span> {/if}{facts[b.src]}</p>
					</li>
				{/each}
			</ol>
			<p class="dg-out">{W.note}</p>
		{/if}
	{:else if game}
		<ol class="guess">
			{#each game.items as g, i (i)}
				<li>
					<p class="txt dg-box">{g.text}</p>
					<div class="dg-ctl" role="group" aria-label={W.textOf(i + 1)}>
						{#each game.options as o (o)}
							<button type="button" aria-pressed={pick[i] === o} onclick={() => (pick[i] = o)}>{nameOf(o)}</button>
						{/each}
					</div>
					{#if pick[i]}
						<p class="fb" class:ok={pick[i] === g.right} role="status">{pick[i] === g.right ? W.right : W.no(nameOf(g.right))} {g.why}</p>
					{/if}
				</li>
			{/each}
		</ol>
		<p class="dg-out" aria-live="polite">{W.hits} <strong>{hits}</strong> {W.of} {game.items.length}.</p>
	{/if}
</figure>

<style>
	.blocks,
	.guess {
		list-style: none;
		padding: 0 !important;
		display: grid;
		gap: var(--space-3);
		margin: 0;
	}
	.blocks li {
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		display: grid;
		gap: var(--space-1);
	}
	.blocks p,
	.guess p {
		margin: 0;
	}
	.head {
		color: var(--text-primary);
	}
	.code {
		display: inline-block;
		min-width: 2.2em;
		padding: 0 var(--space-2);
		border: var(--line) solid var(--accent-measure);
		text-align: center;
	}
	.ask {
		color: var(--text-secondary);
	}
	.fact {
		margin-top: var(--space-1) !important;
		padding: var(--space-2) var(--space-3);
		background: var(--surface-canvas);
		border-left: 3px solid var(--accent-measure);
		overflow-wrap: anywhere;
	}
	.from {
		color: var(--text-secondary);
	}
	.fact.none {
		border-left-color: var(--border-rule);
		color: var(--text-secondary);
	}
	.fb {
		padding-left: var(--space-3);
		border-left: 3px solid var(--border-rule);
		color: var(--text-secondary);
	}
	.fb.ok {
		border-left-color: var(--accent-state-text);
	}
</style>
