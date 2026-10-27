<!--
	A practice step (spec §4.4): the person's files in an editor, a sandboxed preview, and the
	step's checks as a checklist. The preview is `sandbox="allow-scripts"` and never
	`allow-same-origin`; its messages are trusted only by `event.source`, because a sandboxed
	frame's origin is "null" and says nothing.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { PracticeStep, PracticeFiles, FileName } from '#lib/content/schema.ts';
	import { t } from '#lib/i18n/index.ts';
	import { buildSrcdoc, type SandboxMessage } from './sandbox.ts';
	import { describeCheck, type CheckResult } from './checks.ts';
	import { lineDiff } from './diff.ts';
	import Editor from './Editor.svelte';

	type Files = Partial<PracticeFiles> & { 'index.html': string };
	/**
	 * The person's files, keyed by the step's id: each step keeps its own page, so a lesson never
	 * replaces another lesson's starter. `legacy` is the era's page from before step keys (schema 1),
	 * which a step with no work of its own offers and never imposes.
	 */
	type Store = {
		load: (stepId: string, file: FileName) => Promise<string | undefined>;
		save: (stepId: string, file: FileName, text: string) => Promise<void>;
		legacy?: (era: number) => Promise<Partial<Record<FileName, string>> | undefined>;
	};
	type Props = {
		step: PracticeStep;
		persona?: Record<string, unknown>;
		/** Renders the step's templates (`{{name}}`) with the person's brief. */
		prepare?: (template: string) => string;
		store?: Store;
		oncheck?: (results: CheckResult[]) => void;
	};
	let { step, persona = {}, prepare = (s) => s, store, oncheck }: Props = $props();

	const uid = $props.id();
	const names = $derived(
		(['index.html', 'styles.css', 'script.js'] as FileName[]).filter((f) => step.files[f] !== undefined || step.solution[f] !== undefined)
	);
	const starter = (): Files => {
		const out: Files = { 'index.html': '' };
		for (const f of names) out[f] = prepare(step.files[f] ?? '');
		return out;
	};

	let files = $state<Files>({ 'index.html': '' });
	let active = $state<FileName>('index.html');
	let srcdoc = $state('');
	let results = $state<CheckResult[] | null>(null);
	let error = $state('');
	let asking = $state(false);
	/** «Сбросить» asks first: it replaces the person's work on this step with the starter. */
	let resetting = $state(false);
	/** The era's page from the previous version, while this step has no work of its own. */
	let older = $state.raw<Partial<Record<FileName, string>> | null>(null);
	let showing = $state(false);
	let frame: HTMLIFrameElement;

	let renderTimer: ReturnType<typeof setTimeout> | undefined;
	// One pending save per file, flushed rather than dropped: a single shared timer lost the first
	// file's last edit when a second file was edited, and leaving the lesson within the debounce
	// lost the last edit outright.
	const pending = new Map<FileName, { timer: ReturnType<typeof setTimeout>; text: string }>();
	function flush() {
		for (const [file, { timer, text }] of pending) {
			clearTimeout(timer);
			store?.save(step.id, file, text);
		}
		pending.clear();
	}

	function render(now = false) {
		clearTimeout(renderTimer);
		const go = () => {
			error = '';
			results = null;
			srcdoc = buildSrcdoc($state.snapshot(files), step.checks, persona);
		};
		if (now) go();
		else renderTimer = setTimeout(go, 400);
	}

	function edit(file: FileName, text: string) {
		files[file] = text;
		older = null;
		render();
		clearTimeout(pending.get(file)?.timer);
		const timer = setTimeout(() => {
			pending.delete(file);
			store?.save(step.id, file, text);
		}, 400);
		pending.set(file, { timer, text });
	}

	/** Replaces every file at once and saves it now: «Сбросить», or the era's older page. */
	function replaceAll(next: Files) {
		for (const { timer } of pending.values()) clearTimeout(timer);
		pending.clear();
		files = next;
		for (const f of names) store?.save(step.id, f, files[f] ?? '');
		render(true);
	}

	function reset() {
		resetting = false;
		replaceAll(starter());
	}

	function useOlder() {
		if (!older) return;
		const next = { ...$state.snapshot(files) };
		for (const f of names) if (older[f] !== undefined) next[f] = older[f]!;
		older = null;
		replaceAll(next);
	}

	onMount(() => {
		const onMessage = (e: MessageEvent) => {
			if (!frame || e.source !== frame.contentWindow) return;
			const m = e.data as SandboxMessage;
			if (m?.type === 'learn:checks' && Array.isArray(m.results)) {
				results = m.results;
				oncheck?.(m.results);
			} else if (m?.type === 'learn:error') error = String(m.message).slice(0, 300);
		};
		addEventListener('message', onMessage);
		addEventListener('pagehide', flush);
		(async () => {
			const loaded = starter();
			let own = false;
			if (store)
				for (const f of names) {
					const saved = await store.load(step.id, f);
					// a step that continues an earlier one starts from the person's work there
					const carried = saved === undefined && step.continues ? await store.load(step.continues, f) : undefined;
					if (saved !== undefined) own = true;
					if ((saved ?? carried) !== undefined) loaded[f] = (saved ?? carried)!;
				}
			files = loaded;
			render(true);
			if (!own && store?.legacy) {
				const old = await store.legacy(step.era);
				if (old && names.some((f) => old[f] !== undefined)) older = old;
			}
		})();
		return () => {
			removeEventListener('message', onMessage);
			removeEventListener('pagehide', flush);
			clearTimeout(renderTimer);
			flush();
		};
	});

	// The brief can change on the same page (the brief lesson's inline editor): the checks then
	// read the new values at once. The person's files are theirs and are not re-rendered.
	let seenPersona = untrack(() => persona);
	$effect(() => {
		if (persona === seenPersona) return;
		seenPersona = persona;
		if (untrack(() => srcdoc)) render(true);
	});

	const lang = (f: FileName) => (f === 'styles.css' ? 'css' : f === 'script.js' ? 'js' : 'html');
	const allOk = $derived(!!results && results.length > 0 && results.every((r) => r.ok));
	const solution = (f: FileName) => prepare(step.solution[f] ?? '');

	function onTabKey(e: KeyboardEvent, i: number) {
		const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!d) return;
		e.preventDefault();
		const next = names[(i + d + names.length) % names.length];
		active = next;
		document.getElementById(`${uid}-tab-${next}`)?.focus();
	}
</script>

<section class="practice" aria-labelledby="{uid}-title">
	<header>
		<h3 id="{uid}-title">{step.title}</h3>
		<p class="task">{step.task}</p>
	</header>

	<div class="work">
		<div class="code">
			<div class="tabs" role="tablist" aria-label={t('practice.files')}>
				{#each names as f, i (f)}
					<button
						type="button"
						role="tab"
						id="{uid}-tab-{f}"
						aria-selected={active === f}
						aria-controls="{uid}-panel"
						tabindex={active === f ? 0 : -1}
						onclick={() => (active = f)}
						onkeydown={(e) => onTabKey(e, i)}>{f}</button
					>
				{/each}
			</div>
			<div class="panel" role="tabpanel" id="{uid}-panel" aria-labelledby="{uid}-tab-{active}">
				{#key active}
					<Editor value={files[active] ?? ''} lang={lang(active)} label={t('practice.editor', { file: active })} onchange={(v) => edit(active, v)} />
				{/key}
			</div>
			<div class="tools">
				{#if resetting}
					<span class="ask" role="alert">
						{t('practice.reset.confirm')}
						<button type="button" class="secondary" onclick={reset}>{t('practice.reset.yes')}</button>
						<button type="button" class="quiet" onclick={() => (resetting = false)}>{t('practice.cancel')}</button>
					</span>
				{:else}
					<button type="button" class="secondary" onclick={() => ((resetting = true), (asking = false))}>{t('practice.reset')}</button>
				{/if}
				{#if older}
					<button type="button" class="quiet" onclick={useOlder}>{t('practice.older')}</button>
				{/if}
				{#if showing}
					<button type="button" class="quiet" onclick={() => (showing = false)}>{t('practice.solution.hide')}</button>
				{:else if asking}
					<span class="ask" role="alert">
						{t('practice.solution.confirm')}
						<button type="button" class="secondary" onclick={() => ((showing = true), (asking = false))}>{t('practice.solution.yes')}</button>
						<button type="button" class="quiet" onclick={() => (asking = false)}>{t('practice.cancel')}</button>
					</span>
				{:else}
					<button type="button" class="quiet" onclick={() => ((asking = true), (resetting = false))}>{t('practice.solution')}</button>
				{/if}
			</div>
		</div>

		<div class="view">
			<iframe bind:this={frame} sandbox="allow-scripts" title={t('practice.preview')} {srcdoc}></iframe>
			<div class="checks" aria-live="polite">
				<h4>{t('practice.checks')}</h4>
				<ul>
					{#each step.checks as c (c.id)}
						{@const r = results?.find((x) => x.id === c.id)}
						<li class:ok={r?.ok} data-check={c.id} data-ok={r ? String(r.ok) : 'pending'}>
							<span class="mark" aria-hidden="true">{r?.ok ? '✓' : '○'}</span>
							<span>{describeCheck(c)}</span>
							<span class="visually-hidden">{r ? (r.ok ? t('practice.ok') : t('practice.notyet')) : t('practice.waiting')}</span>
						</li>
					{/each}
				</ul>
				{#if allOk}<p class="allok">{t('practice.allok')}</p>{/if}
				{#if error}<p class="error" role="alert">{t('practice.error', { message: error })}</p>{/if}
			</div>
		</div>
	</div>

	{#if showing}
		<div class="solution">
			<h4>{t('practice.solution.title')}</h4>
			<p class="legend">{t('practice.solution.legend')}</p>
			{#each names as f (f)}
				<p class="file">{f}</p>
				<pre><code
						>{#each lineDiff(files[f] ?? '', solution(f)) as l, i (i)}<span class="d{l.op === '+' ? 'add' : l.op === '-' ? 'del' : ''}">{l.op} {l.text}
</span>{/each}</code
					></pre>
			{/each}
		</div>
	{/if}
</section>

<style>
	.practice {
		border-top: var(--line) solid var(--border-hairline);
		padding-top: var(--space-5);
	}
	h3 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
	}
	.task {
		color: var(--text-body);
		max-width: var(--measure);
		margin: var(--space-3) 0 var(--space-5);
	}
	.work {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-5);
	}
	.code {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.tabs {
		display: flex;
		border-bottom: var(--line) solid var(--border-hairline);
	}
	[role='tab'] {
		min-height: var(--hit-min);
		padding: 0 var(--space-4);
		background: none;
		border: 0;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		font-family: var(--font-mono);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	[role='tab'][aria-selected='true'] {
		color: var(--text-primary);
		border-bottom-color: var(--accent-measure);
	}
	[role='tab']:hover {
		color: var(--text-primary);
	}
	.panel {
		flex: 1;
		min-height: 18rem;
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}
	.ask {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
		color: var(--text-body);
		font-size: var(--text-body-sm);
	}
	.view {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-width: 0;
	}
	iframe {
		width: 100%;
		height: 20rem;
		border: var(--line) solid var(--border-hairline);
		background: var(--preview-canvas);
	}
	h4 {
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		font-weight: var(--weight-medium);
		color: var(--text-secondary);
		margin: 0 0 var(--space-2);
	}
	.checks ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}
	.checks li {
		display: flex;
		gap: var(--space-3);
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.checks li.ok {
		color: var(--text-primary);
	}
	.mark {
		font-family: var(--font-mono);
		width: 1.25em;
		flex: none;
		color: var(--text-muted);
	}
	li.ok .mark {
		color: var(--accent-state-text);
	}
	.allok {
		margin: var(--space-4) 0 0;
		color: var(--accent-state-text);
	}
	.error {
		margin: var(--space-3) 0 0;
		color: var(--accent-command-text);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
	}
	.solution {
		margin-top: var(--space-6);
	}
	.legend {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		margin: 0 0 var(--space-3);
	}
	.file {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-secondary);
		margin: var(--space-4) 0 var(--space-1);
	}
	pre {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		background: var(--surface-body);
		border: var(--line) solid var(--border-hairline);
		overflow-x: auto;
		font-size: var(--text-body-sm);
		line-height: 1.6;
	}
	.dadd {
		color: var(--accent-state-text);
	}
	.ddel {
		color: var(--accent-command-text);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}
	@media (max-width: 1024px) {
		.work {
			grid-template-columns: 1fr;
		}
	}
</style>
