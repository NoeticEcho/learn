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
	import { pick } from '#lib/i18n/index.ts';

	// The words, one table per edition (docs/content-plan/README.md, «English edition»).
	const W = pick({
		ru: {
			stopped: 'событие досюда не дошло: всплытие остановлено ниже',
			ran: (target: string, who: string) => `обработчик сработал: target = ${target}, currentTarget = ${who}`,
			passes: 'событие проходит сквозь, обработчика нет',
			stopNote: '. Здесь вызван stopPropagation, дальше событие не идёт.',
			cancelled: 'Переход по ссылке отменён: сработал preventDefault.',
			followed: 'Браузер перейдёт по ссылке: действие по умолчанию никто не отменил.',
			noDefault: 'У этого элемента действия по умолчанию нет.',
			flight: 'Куда летит нажатие',
			where: 'Куда нажали',
			clickedOn: 'Нажали на:',
			handlerLegend: 'Где стоит обработчик click',
			stopOn: 'Остановить всплытие на',
			nowhere: 'нигде',
			prevent: 'в обработчике вызван preventDefault',
			alsoHappens: 'Что ещё случится.',
			howMany: 'Сколько обработчиков нужно',
			added: 'Скрипт добавил карточку',
			again: 'Сначала',
			perCardLabel: 'Обработчик на каждой карточке',
			perCardTitle: (n: number) => `Обработчик на каждой карточке: ${n}`,
			containerLabel: 'Один обработчик на контейнере',
			containerTitle: 'Один обработчик на контейнере: 1',
			card: (id: number, late: boolean) => `Карточка ${id}${late ? ', добавлена скриптом, обработчика нет' : ''}`,
			hintLate: 'Новая карточка (пунктир) не реагирует: на ней нет обработчика, его надо было навесить при создании.',
			hintPer: 'Нажмите на карточки: каждая отвечает своим обработчиком.',
			hintWorks: 'Новая карточка работает сама: её нажатие всплыло до контейнера, а там closest нашёл карточку.',
			hintAdd: 'Добавьте карточку: она тоже заработает без нового кода.'
		},
		en: {
			stopped: 'the event never got this far: bubbling was stopped lower down',
			ran: (target: string, who: string) => `the handler ran: target = ${target}, currentTarget = ${who}`,
			passes: 'the event passes through, there is no handler',
			stopNote: '. stopPropagation is called here, so the event goes no further.',
			cancelled: 'Following the link is canceled: preventDefault ran.',
			followed: 'The browser will follow the link: nobody canceled the default action.',
			noDefault: 'This element has no default action.',
			flight: 'Where the click flies',
			where: 'Where the click landed',
			clickedOn: 'Clicked on:',
			handlerLegend: 'Where the click handler stands',
			stopOn: 'Stop bubbling at',
			nowhere: 'nowhere',
			prevent: 'the handler calls preventDefault',
			alsoHappens: 'What else happens.',
			howMany: 'How many handlers are needed',
			added: 'The script added a card',
			again: 'Start over',
			perCardLabel: 'A handler on every card',
			perCardTitle: (n: number) => `A handler on every card: ${n}`,
			containerLabel: 'One handler on the container',
			containerTitle: 'One handler on the container: 1',
			card: (id: number, late: boolean) => `Card ${id}${late ? ', added by the script, no handler' : ''}`,
			hintLate: 'The new card (dashed) doesn’t react: it has no handler, which should have been attached when it was created.',
			hintPer: 'Click the cards: each answers with its own handler.',
			hintWorks: 'The new card works by itself: its click bubbled up to the container, where closest found the card.',
			hintAdd: 'Add a card: it will work too, with no new code.'
		}
	});

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
				out.push({ who, text: W.stopped, ran: false });
				continue;
			}
			if (handlers[who]) {
				out.push({ who, text: W.ran(target, who), ran: true, stop: stopAt === who });
				if (stopAt === who) stopped = true;
			} else out.push({ who, text: W.passes, ran: false });
		}
		return out;
	});
	const defaultAction = $derived(
		target === 'a' ? (prevent && log.some((l) => l.ran) ? W.cancelled : W.followed) : W.noDefault
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
		<figcaption>{W.flight}</figcaption>
		<div class="dg-ctl" role="group" aria-label={W.where}>
			<span>{W.clickedOn}</span>
			{#each path.slice(0, 3) as n (n)}
				<button type="button" class="dg-mono" aria-pressed={target === n} onclick={() => (target = n)}>{n}</button>
			{/each}
		</div>
		<fieldset class="hand">
			<legend>{W.handlerLegend}</legend>
			{#each path as n (n)}
				<label class="dg-mono"><input type="checkbox" bind:checked={handlers[n]} /> {n}</label>
			{/each}
		</fieldset>
		<div class="dg-ctl">
			<label>{W.stopOn}
				<select bind:value={stopAt}>
					<option value="none">{W.nowhere}</option>
					{#each path as n (n)}<option value={n}>{n}</option>{/each}
				</select>
			</label>
			<label><input type="checkbox" bind:checked={prevent} /> {W.prevent}</label>
		</div>
		<ol class="log dg-box" aria-live="polite">
			{#each log as l (l.who)}
				<li class:ran={l.ran}><code>{l.who}</code>: {l.text}{l.stop ? W.stopNote : ''}</li>
			{/each}
		</ol>
		<p class="dg-out"><strong>{W.alsoHappens}</strong> {defaultAction}</p>
	</figure>
{:else}
	<figure class="dg">
		<figcaption>{W.howMany}</figcaption>
		<div class="dg-ctl">
			<button type="button" onclick={addCard}>{W.added}</button>
			<button type="button" onclick={reset}>{W.again}</button>
		</div>
		<div class="two">
			<section aria-label={W.perCardLabel}>
				<div class="dh">{W.perCardTitle(perCard.filter((c) => c.own).length)}</div>
				<div class="row">
					{#each perCard as c (c.id)}
						<button type="button" class="sq" class:on={c.picked} class:late={!c.own} onclick={() => clickPer(c)} aria-pressed={c.picked} aria-label={W.card(c.id, !c.own)}>{c.id}</button>
					{/each}
				</div>
				<p class="hint">{perCard.some((c) => !c.own) ? W.hintLate : W.hintPer}</p>
			</section>
			<section aria-label={W.containerLabel}>
				<div class="dh">{W.containerTitle}</div>
				<div class="row">
					{#each delegated as c (c.id)}
						<button type="button" class="sq" class:on={c.picked} onclick={() => clickDelegated(c)} aria-pressed={c.picked} aria-label={W.card(c.id, false)}>{c.id}</button>
					{/each}
				</div>
				<p class="hint">{delegated.some((c) => c.added) ? W.hintWorks : W.hintAdd}</p>
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
	.dh {
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
