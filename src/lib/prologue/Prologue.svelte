<!--
	«Прибытие поезда» (spec §3.1a): three questions, then the person's own site arriving through
	the eras, each morphing into the next, in 60 to 90 seconds. No video: the frames are the app's
	own components, driven by the three answers.

	Motion: the View Transitions API where there is one, a CSS cross-fade otherwise. The sequence
	pauses while the pointer is over the frame or focus is inside it, and has a visible pause
	(an auto-advancing sequence must). Under prefers-reduced-motion nothing plays by itself: it is a
	still filmstrip, stepped with «Следующая эпоха». Sound is opt-in and off by default.
-->
<script lang="ts">
	import { onMount, tick, untrack, type Component } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import { SEQUENCE, RING_ERA, type EraId } from './sequence.ts';
	import type { FrameBrief, FrameProps } from './types.ts';
	import Era1991 from './eras/1991.svelte';
	import Era1996 from './eras/1996.svelte';
	import Era2000 from './eras/2000.svelte';
	import Era2005 from './eras/2005.svelte';
	import Era2014 from './eras/2014.svelte';
	import Era2025 from './eras/2025.svelte';
	import EraIskin from './eras/iskin.svelte';
	import Echo from '#lib/guide/Echo.svelte';

	export type Answers = { who: string; forWhom: string; action: string };
	type Props = {
		/** The example the placeholders show, and what an empty answer becomes. */
		example: Answers;
		initial?: Partial<Answers>;
		onsave?: (a: Answers) => void | Promise<void>;
		/** Where «Начать» and «Пропустить» go. */
		startHref: string;
		skipHref: string;
		onskip?: () => void;
	};
	let { example, initial = {}, onsave, startHref, skipHref, onskip }: Props = $props();

	const FRAMES: Record<EraId, Component<FrameProps>> = {
		'1991': Era1991,
		'1996': Era1996,
		'2000': Era2000,
		'2005': Era2005,
		'2014': Era2014,
		'2025': Era2025,
		iskin: EraIskin
	};

	const uid = $props.id();
	let phase = $state<'ask' | 'play' | 'end'>('ask');
	let who = $state(untrack(() => initial.who ?? ''));
	let forWhom = $state(untrack(() => initial.forWhom ?? ''));
	let action = $state(untrack(() => initial.action ?? ''));
	let index = $state(0);
	let still = $state(false);
	let paused = $state(false);
	let held = $state(false); // pointer over the frame, or focus inside it
	let sound = $state(false);

	let brief = $state<FrameBrief>({ title: '', forWhom: '', action: '' });
	const era = $derived(SEQUENCE[index]?.era ?? 'iskin');
	const Frame = $derived(FRAMES[era]);

	let timer: ReturnType<typeof setTimeout> | undefined;
	let startedAt = 0;
	let remaining = 0;
	let audio: AudioContext | undefined;

	function useExample() {
		who = example.who;
		forWhom = example.forWhom;
		action = example.action;
	}

	async function start(e: SubmitEvent) {
		e.preventDefault();
		const a: Answers = {
			who: who.trim() || example.who,
			forWhom: forWhom.trim() || example.forWhom,
			action: action.trim() || example.action
		};
		brief = { title: a.who, forWhom: a.forWhom, action: a.action };
		await onsave?.(a);
		still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		index = 0;
		phase = 'play';
		await tick();
		document.getElementById(`${uid}-stage`)?.focus({ preventScroll: true });
		if (!still) schedule(SEQUENCE[0].ms);
	}

	function schedule(ms: number) {
		clearTimeout(timer);
		remaining = ms;
		startedAt = performance.now();
		if (!paused && !held) timer = setTimeout(advance, ms);
	}

	function hold(on: boolean) {
		if (still || phase !== 'play') return;
		if (on && timer) {
			clearTimeout(timer);
			timer = undefined;
			remaining = Math.max(0, remaining - (performance.now() - startedAt));
		}
		held = on;
		if (!on && !paused) schedule(remaining);
	}

	function togglePause() {
		paused = !paused;
		if (paused) {
			clearTimeout(timer);
			timer = undefined;
			remaining = Math.max(0, remaining - (performance.now() - startedAt));
		} else schedule(remaining);
	}

	async function go(i: number) {
		const apply = async () => {
			index = i;
			await tick();
		};
		const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };
		if (!still && doc.startViewTransition) doc.startViewTransition(apply);
		else await apply();
		if (sound) click();
	}

	let moving = false;
	async function advance() {
		if (moving) return;
		if (index + 1 >= SEQUENCE.length) {
			clearTimeout(timer);
			phase = 'end';
			return;
		}
		moving = true;
		try {
			await go(index + 1);
		} finally {
			moving = false;
		}
		if (!still) schedule(SEQUENCE[index].ms);
	}

	function click() {
		try {
			audio ??= new AudioContext();
			const o = audio.createOscillator();
			const g = audio.createGain();
			o.frequency.value = 880;
			g.gain.setValueAtTime(0.05, audio.currentTime);
			g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
			o.connect(g).connect(audio.destination);
			o.start();
			o.stop(audio.currentTime + 0.13);
		} catch {
			/* no audio here: stay silent */
		}
	}

	onMount(() => () => {
		clearTimeout(timer);
		audio?.close();
	});
</script>

{#if phase === 'ask'}
	<section class="ask" aria-labelledby="{uid}-h">
		<div class="intro">
			<h1 id="{uid}-h">{t('app.title')}</h1>
			<p class="lede">{t('prologue.lede')}</p>
		</div>
		<form onsubmit={start}>
			<label for="{uid}-who">{t('prologue.q.who')}</label>
			<input id="{uid}-who" name="who" autocomplete="off" placeholder={example.who} bind:value={who} />
			<label for="{uid}-for">{t('prologue.q.for')}</label>
			<input id="{uid}-for" name="forWhom" autocomplete="off" placeholder={example.forWhom} bind:value={forWhom} />
			<label for="{uid}-act">{t('prologue.q.action')}</label>
			<input id="{uid}-act" name="action" autocomplete="off" placeholder={example.action} bind:value={action} />
			<div class="actions">
				<button type="submit" class="primary">{t('prologue.start')}</button>
				<button type="button" class="quiet" onclick={useExample}>{t('prologue.example')}</button>
			</div>
			<p class="note">{t('prologue.privacy')}</p>
		</form>
		<a class="skip" href={skipHref} onclick={() => onskip?.()}>{t('prologue.skip')}</a>
	</section>
{:else}
	<section class="theatre" data-mode={still ? 'filmstrip' : 'motion'} aria-label={t('prologue.label')}>
		{#if phase === 'play'}
			<header class="caption">
				<p class="year" aria-live="polite">{t(`era.${era}.year`)}</p>
				<p class="what">{t(`era.${era}.caption`)}</p>
			</header>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<figure
				id="{uid}-stage"
				class="stage"
				tabindex="-1"
				data-era={era}
				onpointerenter={() => hold(true)}
				onpointerleave={() => hold(false)}
				onfocusin={() => hold(true)}
				onfocusout={() => hold(false)}
			>
				{#key era}
					<div class="frame"><Frame {brief} {still} /></div>
				{/key}
				<figcaption class="visually-hidden">{t(`era.${era}.caption`)}</figcaption>
			</figure>
			<ol class="timeline" aria-label={t('prologue.timeline')}>
				{#each SEQUENCE as s, i (s.era)}
					<li aria-current={i === index ? 'step' : undefined} class:past={i < index}>{t(`era.${s.era}.year`)}</li>
				{/each}
			</ol>
			<div class="controls">
				<button type="button" class="secondary" onclick={advance}>{t('prologue.next')}</button>
				{#if !still}
					<button type="button" class="quiet" aria-pressed={paused} onclick={togglePause}>{paused ? t('prologue.play') : t('prologue.pause')}</button>
				{/if}
				<button type="button" class="quiet" aria-pressed={sound} onclick={() => (sound = !sound)}>{sound ? t('prologue.sound.off') : t('prologue.sound.on')}</button>
				<a class="quiet skip-link" href={skipHref} onclick={() => onskip?.()}>{t('prologue.skip')}</a>
			</div>
		{:else}
			<div class="end">
				<Echo mood="cheer" era={RING_ERA.iskin} size={96} />
				<h2>{t('prologue.end')}</h2>
				<p class="lede">{t('prologue.end.lede')}</p>
				<div class="actions">
					<a class="primary" href={startHref}>{t('prologue.end.start')}</a>
					<a class="secondary" href={skipHref}>{t('prologue.end.map')}</a>
				</div>
			</div>
		{/if}
	</section>
{/if}

<style>
	.ask {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: var(--space-8);
		align-items: center;
		min-height: calc(100dvh - 8rem);
		padding-block: var(--space-7);
	}
	h1 {
		font-size: var(--text-display);
		line-height: var(--lh-display);
		overflow-wrap: break-word;
		min-width: 0;
		margin-bottom: var(--space-5);
	}
	.lede {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-body);
		max-width: 34ch;
		margin: 0;
	}
	form {
		display: grid;
		gap: var(--space-2);
	}
	label {
		color: var(--text-primary);
		font-size: var(--text-body-sm);
		margin-top: var(--space-3);
	}
	label:first-child {
		margin-top: 0;
	}
	input {
		min-height: var(--hit-min);
		padding: 0 var(--space-3);
		border: var(--line) solid var(--border-rule);
		border-radius: 0;
		background: var(--surface-body);
		color: var(--text-primary);
	}
	input::placeholder {
		color: var(--text-muted);
	}
	input:hover {
		border-color: var(--border-brass);
	}
	input:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-5);
		align-items: center;
	}
	.note {
		margin: var(--space-3) 0 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.skip {
		grid-column: 1 / -1;
		justify-self: start;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.theatre {
		display: grid;
		gap: var(--space-4);
		padding-block: var(--space-5);
	}
	.caption {
		display: flex;
		align-items: baseline;
		gap: var(--space-5);
		flex-wrap: wrap;
	}
	.year {
		margin: 0;
		font-family: var(--font-serif);
		font-size: var(--text-display);
		line-height: 1;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}
	.what {
		margin: 0;
		color: var(--text-body);
		max-width: 52ch;
	}
	.stage {
		container: prologue / inline-size;
		margin: 0;
		height: min(60dvh, 34rem);
		border: var(--line) solid var(--border-hairline);
		overflow: hidden;
		outline: none;
	}
	.stage:focus-visible {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
	.frame {
		height: 100%;
		animation: arrive var(--dur-world) var(--ease-emerge);
		view-transition-name: prologue-frame;
	}
	.timeline {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-5);
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--text-body-sm);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.timeline .past {
		color: var(--text-secondary);
	}
	.timeline [aria-current='step'] {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--accent-measure);
		text-underline-offset: 0.35em;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}
	.skip-link {
		margin-left: auto;
	}
	.end {
		min-height: calc(100dvh - 10rem);
		display: grid;
		align-content: center;
		justify-items: start;
		gap: var(--space-4);
	}
	.end h2 {
		font-size: var(--text-display);
		line-height: var(--lh-display);
		overflow-wrap: break-word;
		min-width: 0;
		max-width: 16ch;
	}
	@keyframes arrive {
		from {
			opacity: 0;
		}
	}
	@media (max-width: 1024px) {
		.ask {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-6);
			min-height: auto;
		}
		h1,
		.year,
		.end h2 {
			font-size: var(--text-display-sm);
		}
		.stage {
			height: min(70dvh, 30rem);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.frame {
			animation: none;
		}
	}
</style>
