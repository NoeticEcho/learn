<!--
	«Полёт события» (part 5, lesson 3). In `flight` mode the person chooses where a click lands,
	on which elements a handler stands, where bubbling is stopped and whether the default action
	is cancelled; the log lists, in order, what a browser would do. In `delegate` mode a row of
	cards shows why one handler on the container keeps working for a card added later, and one
	handler per card does not. The browser's event system is modelled, not run: the log is
	computed from the same rules (target first, then each ancestor, stop at stopPropagation).
-->
<script lang="ts">
	import './shared.css';

	let { mode = 'flight' }: { mode?: 'flight' | 'delegate' } = $props();

	// ----- flight
	const path = ['a', 'article.card', 'div.cards', 'body', 'document'] as const;
	type Node = (typeof path)[number];
	let target = $state<Node>('a');
	let handlers = $state<Record<Node, boolean>>({ a: false, 'article.card': false, 'div.cards': true, body: false, document: false });
	let stopAt = $state<Node | 'none'>('none');
	let prevent = $state(false);
	const from = $derived(path.indexOf(target));
	const log = $derived.by(() => {
		const out: { who: Node; text: string; ran: boolean; stop?: boolean }[] = [];
		let stopped = false;
		for (let i = from; i < path.length; i++) {
			const who = path[i];
			if (stopped) {
				out.push({ who, text: 'событие досюда не дошло: всплытие остановлено ниже', ran: false });
				continue;
			}
			if (handlers[who]) {
				out.push({ who, text: `обработчик сработал: target = ${target}, currentTarget = ${who}`, ran: true, stop: stopAt === who });
				if (stopAt === who) stopped = true;
			} else out.push({ who, text: 'событие проходит сквозь, обработчика нет', ran: false });
		}
		return out;
	});
	const defaultAction = $derived(
		target === 'a' ? (prevent && log.some((l) => l.ran) ? 'Переход по ссылке отменён: сработал preventDefault.' : 'Браузер перейдёт по ссылке: действие по умолчанию никто не отменил.') : 'У этого элемента действия по умолчанию нет.'
	);

	// ----- delegation
	type Card = { id: number; added: boolean; own: boolean; picked: boolean };
	let nextId = 6;
	const make = (n: number): Card[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, added: false, own: true, picked: false }));
	let perCard = $state<Card[]>(make(5));
	let delegated = $state<Card[]>(make(5));
	const addCard = () => {
		perCard.push({ id: nextId, added: true, own: false, picked: false });
		delegated.push({ id: nextId, added: true, own: false, picked: false });
		nextId++;
	};
	const reset = () => {
		nextId = 6;
		perCard = make(5);
		delegated = make(5);
	};
	const clickPer = (c: Card) => {
		if (c.own) c.picked = !c.picked;
	};
	const clickDelegated = (c: Card) => {
		c.picked = !c.picked; // the one handler on the container found its card by closest()
	};
</script>

{#if mode === 'flight'}
	<figure class="dg">
		<figcaption>Куда летит нажатие</figcaption>
		<div class="dg-ctl" role="group" aria-label="Куда нажали">
			<span>Нажали на:</span>
			{#each path.slice(0, 3) as n (n)}
				<button type="button" class="dg-mono" aria-pressed={target === n} onclick={() => (target = n)}>{n}</button>
			{/each}
		</div>
		<fieldset class="hand">
			<legend>Где стоит обработчик click</legend>
			{#each path as n (n)}
				<label class="dg-mono"><input type="checkbox" bind:checked={handlers[n]} /> {n}</label>
			{/each}
		</fieldset>
		<div class="dg-ctl">
			<label>Остановить всплытие на
				<select bind:value={stopAt}>
					<option value="none">нигде</option>
					{#each path as n (n)}<option value={n}>{n}</option>{/each}
				</select>
			</label>
			<label><input type="checkbox" bind:checked={prevent} /> в обработчике вызван preventDefault</label>
		</div>
		<ol class="log dg-box" aria-live="polite">
			{#each log as l (l.who)}
				<li class:ran={l.ran}><code>{l.who}</code>: {l.text}{l.stop ? '. Здесь вызван stopPropagation, дальше событие не идёт.' : ''}</li>
			{/each}
		</ol>
		<p class="dg-out"><strong>Что ещё случится.</strong> {defaultAction}</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>Сколько обработчиков нужно</figcaption>
		<div class="dg-ctl">
			<button type="button" onclick={addCard}>Скрипт добавил карточку</button>
			<button type="button" onclick={reset}>Сначала</button>
		</div>
		<div class="two">
			<section aria-label="Обработчик на каждой карточке">
				<h4>Обработчик на каждой карточке: {perCard.filter((c) => c.own).length}</h4>
				<div class="row">
					{#each perCard as c (c.id)}
						<button type="button" class="sq" class:on={c.picked} class:late={!c.own} onclick={() => clickPer(c)} aria-pressed={c.picked} aria-label="Карточка {c.id}{c.own ? '' : ', добавлена скриптом, обработчика нет'}">{c.id}</button>
					{/each}
				</div>
				<p class="hint">{perCard.some((c) => !c.own) ? 'Новая карточка (пунктир) не реагирует: на ней нет обработчика, его надо было навесить при создании.' : 'Нажмите на карточки: каждая отвечает своим обработчиком.'}</p>
			</section>
			<section aria-label="Один обработчик на контейнере">
				<h4>Один обработчик на контейнере: 1</h4>
				<div class="row">
					{#each delegated as c (c.id)}
						<button type="button" class="sq" class:on={c.picked} onclick={() => clickDelegated(c)} aria-pressed={c.picked} aria-label="Карточка {c.id}">{c.id}</button>
					{/each}
				</div>
				<p class="hint">{delegated.some((c) => c.added) ? 'Новая карточка работает сама: её нажатие всплыло до контейнера, а там closest нашёл карточку.' : 'Добавьте карточку: она тоже заработает без нового кода.'}</p>
			</section>
		</div>
	</figure>
{/if}

<style>
	fieldset.hand {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin: 0 0 var(--space-3);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
	}
	legend {
		padding: 0 var(--space-2);
		color: var(--text-secondary);
	}
	.log {
		margin: 0;
		padding-left: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.log li {
		color: var(--text-secondary);
	}
	.log li.ran {
		color: var(--text-primary);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-4);
	}
	h4 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.sq {
		width: 3rem;
		padding: 0;
	}
	.sq.late {
		border-style: dashed;
	}
	.sq.on {
		background: color-mix(in srgb, var(--accent-measure) 30%, transparent);
	}
	.hint {
		margin: var(--space-2) 0 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
</style>
