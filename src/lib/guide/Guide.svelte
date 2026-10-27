<!--
	Эхо, the guide (spec §4.5): the mascot (design/mascot/echo.svg, through Echo.svelte) with its
	mood from nextLine(), the era of the lesson's part on its ring, and an aria-live speech bubble
	beside it. Under reduced motion the mascot's own CSS holds a still pose.

	Model mode appears only when the person has set a key. It shows the estimated cost before
	anything is sent, says which provider will receive the question, and sends the person's
	project data only when they tick it for this question.
-->
<script lang="ts">
	import type { GuideLines } from '#lib/content/schema.ts';
	import { t } from '#lib/i18n/index.ts';
	import Echo from './Echo.svelte';
	import { nextLine, type GuideEvent } from './script.ts';
	import type { ModelConfig, AskContext } from './model.ts';

	type Props = {
		lines: GuideLines;
		event?: GuideEvent;
		era?: number | null;
		model?: ModelConfig | null;
		/** What a free question is asked about: the lesson's text and the person's current code. */
		context?: () => Omit<AskContext, 'question' | 'persona'>;
		persona?: object;
		size?: number;
	};
	let { lines, event = { kind: 'enter' }, era = null, model = null, context, persona, size = 88 }: Props = $props();

	const uid = $props.id();
	const line = $derived(nextLine(lines, event));
	let question = $state('');
	let sharePersona = $state(false);
	let answer = $state('');
	let error = $state('');
	let busy = $state(false);
	let cost = $state<number | null>(null);
	let costFor = $state('');

	// The estimate needs model.ts (and nothing in it runs until a key is set).
	$effect(() => {
		const q = question;
		const m = model;
		if (!m) return;
		const ctx = context?.() ?? { lesson: '' };
		import('./model.ts').then(({ estimateCost, PRICES_DATED }) => {
			const chars = q.length + ctx.lesson.length + (ctx.code?.length ?? 0) + (sharePersona && persona ? JSON.stringify(persona).length : 0);
			cost = estimateCost(m.provider, m.model, chars);
			costFor = PRICES_DATED;
		});
	});

	async function send(e: SubmitEvent) {
		e.preventDefault();
		if (!model || !question.trim() || busy) return;
		busy = true;
		error = '';
		answer = '';
		try {
			const { ask } = await import('./model.ts');
			answer = await ask(model, { ...(context?.() ?? { lesson: '' }), question: question.trim(), persona: sharePersona ? persona : undefined });
		} catch (x) {
			error = x instanceof Error ? x.message : String(x);
		} finally {
			busy = false;
			sharePersona = false; // asked again for every question
		}
	}
</script>

<aside class="guide" aria-label={t('guide.label')}>
	<div class="row">
		<Echo mood={busy ? 'explain' : line.mood} {era} {size} />
		<p class="bubble" aria-live="polite">{answer || line.text}</p>
	</div>

	{#if model}
		<form class="ask" onsubmit={send}>
			<label for="{uid}-q">{t('guide.ask.label')}</label>
			<textarea id="{uid}-q" rows="2" placeholder={t('guide.ask.placeholder')} bind:value={question}></textarea>
			{#if persona}
				<label class="check"><input type="checkbox" bind:checked={sharePersona} /> {t('guide.ask.persona')}</label>
			{/if}
			<p class="meta">
				{cost === null ? t('guide.ask.cost.unknown') : t('guide.ask.cost', { cost: cost.toLocaleString('ru-RU'), date: costFor.split('-').reverse().join('.') })}
				{t('guide.ask.where', { provider: t(`guide.provider.${model.provider}`) })}
			</p>
			<button type="submit" class="secondary" disabled={busy || !question.trim()}>{busy ? t('guide.ask.sending') : t('guide.ask.send')}</button>
			{#if error}<p class="error" role="alert">{error}</p>{/if}
		</form>
	{/if}
</aside>

<style>
	.guide {
		display: grid;
		gap: var(--space-4);
	}
	.row {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}
	.bubble {
		position: relative;
		margin: var(--space-3) 0 0;
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-body);
		color: var(--text-body);
		max-width: var(--measure-narrow);
		white-space: pre-line;
	}
	.bubble::before {
		content: '';
		position: absolute;
		left: calc(-1 * var(--space-2));
		top: var(--space-4);
		width: var(--space-3);
		height: var(--space-3);
		background: var(--surface-body);
		border-left: var(--line) solid var(--border-hairline);
		border-bottom: var(--line) solid var(--border-hairline);
		transform: rotate(45deg);
	}
	.ask {
		display: grid;
		gap: var(--space-2);
		max-width: var(--measure);
	}
	label {
		font-size: var(--text-body-sm);
		color: var(--text-primary);
	}
	.check {
		display: flex;
		gap: var(--space-2);
		align-items: baseline;
		color: var(--text-body);
	}
	textarea {
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-rule);
		border-radius: 0;
		background: var(--surface-body);
		resize: vertical;
	}
	.meta {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.ask button {
		justify-self: start;
	}
	.error {
		margin: 0;
		color: var(--accent-command-text);
		font-size: var(--text-body-sm);
	}
</style>
