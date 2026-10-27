<!--
	Settings (spec §4.3): the theme, the person's project, their own model key, and the backup.
	Everything here lives only in this browser. The key is a password field, is never put in a URL
	or a log, and leaves the browser only in a request to the provider chosen here, or in a backup
	file when the person ticks that box.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t, pl } from '#lib/i18n/index.ts';
	import { getTheme, setTheme, THEME_KEY, type Theme } from '#lib/theme.ts';
	import BriefEditor from '#lib/persona/BriefEditor.svelte';
	import type { Provider } from '#lib/guide/model.ts';

	const PROVIDERS: Provider[] = ['anthropic', 'openai', 'openrouter'];
	const ANTHROPIC_MODELS = ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'];

	let theme = $state<Theme | 'system'>('system');

	let provider = $state<Provider>('anthropic');
	let model = $state(ANTHROPIC_MODELS[0]);
	let key = $state('');
	let keySet = $state(false);
	let keyNote = $state('');
	let keyBusy = $state(false);

	let includeKey = $state(false);
	let pending = $state.raw<unknown>(null); // raw: IndexedDB cannot clone a proxy
	let fileName = $state('');
	let previewText = $state('');
	let importNote = $state('');

	onMount(async () => {
		try {
			const stored = localStorage.getItem(THEME_KEY);
			theme = stored === 'ink' || stored === 'paper' ? stored : 'system';
		} catch {
			theme = 'system';
		}
		const { db, progress } = await import('#lib/learner.ts');
		const d = await db();
		const k = await progress.getSetting<{ provider: Provider; key: string; model: string }>(d, 'ownKey');
		if (k?.key) {
			provider = k.provider;
			model = k.model;
			keySet = true;
		}
	});

	function chooseTheme(v: Theme | 'system') {
		theme = v;
		if (v === 'system') {
			try {
				localStorage.removeItem(THEME_KEY);
			} catch {
				/* nothing stored */
			}
			document.documentElement.dataset.theme = getTheme();
		} else setTheme(v);
	}

	async function saveKey(e: SubmitEvent) {
		e.preventDefault();
		if (!key.trim()) return;
		const { db, progress } = await import('#lib/learner.ts');
		await progress.setSetting(await db(), 'ownKey', { provider, key: key.trim(), model: model.trim() });
		key = '';
		keySet = true;
		keyNote = t('settings.key.saved');
	}

	async function removeKey() {
		const { db, progress } = await import('#lib/learner.ts');
		await progress.setSetting(await db(), 'ownKey', undefined);
		keySet = false;
		keyNote = t('settings.key.removed');
	}

	async function testKey() {
		keyBusy = true;
		keyNote = '';
		try {
			const [{ ownKey }, { ask }] = await Promise.all([import('#lib/learner.ts'), import('#lib/guide/model.ts')]);
			const cfg = await ownKey();
			if (!cfg) return;
			await ask(cfg, { lesson: '', question: t('settings.key.question') });
			keyNote = t('settings.key.ok');
		} catch (x) {
			keyNote = x instanceof Error ? x.message : String(x);
		} finally {
			keyBusy = false;
		}
	}

	async function exportProgress() {
		const [{ db }, { exportAll }, { download }] = await Promise.all([import('#lib/learner.ts'), import('#lib/store/backup.ts'), import('#lib/zip.ts')]);
		const data = await exportAll(await db(), { includeKey });
		const stamp = new Date().toISOString().slice(0, 10);
		download(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }), `skvoz-vremya-${stamp}.json`);
	}

	async function pick(e: Event) {
		importNote = '';
		pending = null;
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		fileName = file?.name ?? '';
		if (!file) return;
		try {
			const data = JSON.parse(await file.text());
			const { preview } = await import('#lib/store/backup.ts');
			const p = preview(data);
			pending = data;
			previewText = t('settings.import.preview', {
				date: new Date(p.exportedAt).toLocaleDateString('ru-RU'),
				lessons: p.counts.lessons,
				lessonsWord: pl(p.counts.lessons, 'lesson.forms'),
				cards: p.counts.cards,
				cardsWord: pl(p.counts.cards, 'card.forms'),
				files: p.counts.practice
			});
		} catch (x) {
			importNote = t('settings.import.error', { message: x instanceof Error ? x.message : String(x) });
		}
	}

	async function importProgress() {
		if (!pending) return;
		try {
			const [{ db }, { importAll }] = await Promise.all([import('#lib/learner.ts'), import('#lib/store/backup.ts')]);
			await importAll(await db(), pending);
			importNote = t('settings.import.done');
		} catch (x) {
			importNote = t('settings.import.error', { message: x instanceof Error ? x.message : String(x) });
		}
		pending = null;
	}
</script>

<svelte:head><title>{t('settings.title')}: {t('app.title')}</title></svelte:head>

<div class="container">
	<header class="head">
		<h1>{t('settings.title')}</h1>
		<p class="lede">{t('settings.lede')}</p>
	</header>

	<section aria-labelledby="s-progress">
		<h2 id="s-progress">{t('settings.progress')}</h2>
		<p class="note">{t('settings.progress.lede')}</p>
		<div class="row">
			<button type="button" class="primary" onclick={exportProgress}>{t('settings.export')}</button>
			<label class="check"><input type="checkbox" bind:checked={includeKey} /> {t('settings.export.key')}</label>
		</div>
		<div class="row">
			<!-- The browser's own picker speaks the browser's language («Choose File»); this one speaks
			     the page's. The input stays real and focusable, only visually hidden. -->
			<label class="file">
				<input class="visually-hidden" type="file" accept="application/json,.json" onchange={pick} />
				<span class="secondary pick">{t('settings.import.pick')}</span>
				<span class="chosen">{fileName || t('settings.import.none')}</span>
			</label>
		</div>
		{#if pending}
			<p class="preview">{previewText}</p>
			<div class="row">
				<button type="button" class="secondary" onclick={importProgress}>{t('settings.import.confirm')}</button>
				<button type="button" class="quiet" onclick={() => (pending = null)}>{t('settings.import.cancel')}</button>
			</div>
		{/if}
		{#if importNote}<p class="status" role="status">{importNote}</p>{/if}
	</section>

	<section aria-labelledby="s-project">
		<h2 id="s-project">{t('settings.project')}</h2>
		<p class="note">{t('settings.project.lede')}</p>
		<BriefEditor resettable />
	</section>

	<section aria-labelledby="s-key">
		<h2 id="s-key">{t('settings.key')}</h2>
		<p class="note">{t('settings.key.lede')}</p>
		{#if keySet}<p class="status">{t('settings.key.set', { provider: t(`guide.provider.${provider}`), model })}</p>{/if}
		<form class="fields" onsubmit={saveKey}>
			<div class="field">
				<label for="provider">{t('settings.key.provider')}</label>
				<select id="provider" bind:value={provider} onchange={() => (model = provider === 'anthropic' ? ANTHROPIC_MODELS[0] : '')}>
					{#each PROVIDERS as p (p)}<option value={p}>{t(`guide.provider.${p}`)}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="model">{t('settings.key.model')}</label>
				{#if provider === 'anthropic'}
					<select id="model" bind:value={model}>
						{#each ANTHROPIC_MODELS as m (m)}<option value={m}>{m}</option>{/each}
					</select>
				{:else}
					<input id="model" bind:value={model} autocomplete="off" spellcheck="false" />
				{/if}
			</div>
			<div class="field wide">
				<label for="key">{t('settings.key.value')}</label>
				<input id="key" type="password" bind:value={key} autocomplete="off" spellcheck="false" />
			</div>
			<div class="row wide">
				<button type="submit" class="secondary" disabled={!key.trim()}>{t('settings.key.save')}</button>
				{#if keySet}
					<button type="button" class="quiet" disabled={keyBusy} onclick={testKey}>{t('settings.key.test')}</button>
					<button type="button" class="quiet" onclick={removeKey}>{t('settings.key.remove')}</button>
				{/if}
			</div>
		</form>
		{#if keyNote}<p class="status" role="status">{keyNote}</p>{/if}
	</section>

	<section aria-labelledby="s-theme">
		<h2 id="s-theme">{t('settings.theme')}</h2>
		<div class="row" role="radiogroup" aria-labelledby="s-theme">
			{#each ['ink', 'paper', 'system'] as const as v (v)}
				<label class="check"><input type="radio" name="theme" checked={theme === v} onchange={() => chooseTheme(v)} /> {t(`settings.theme.${v}`)}</label>
			{/each}
		</div>
	</section>
</div>

<style>
	.head {
		padding-block: var(--space-8) var(--space-4);
	}
	h1 {
		font-size: var(--text-display);
		line-height: var(--lh-display);
		margin-bottom: var(--space-4);
		overflow-wrap: break-word;
		min-width: 0;
	}
	.lede {
		margin: 0;
		max-width: var(--measure);
		color: var(--text-body);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
	}
	section {
		max-width: 52rem;
		padding-block: var(--space-7);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	h2 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
		margin-bottom: var(--space-3);
	}
	.note {
		margin: 0 0 var(--space-5);
		max-width: var(--measure);
		color: var(--text-body);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3) var(--space-5);
		margin-block: var(--space-3);
	}
	.fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4) var(--space-5);
		margin-bottom: var(--space-3);
	}
	.field {
		display: grid;
		gap: var(--space-2);
		align-content: start;
	}
	.wide {
		grid-column: 1 / -1;
	}
	label {
		font-size: var(--text-body-sm);
		color: var(--text-primary);
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--hit-min);
		color: var(--text-body);
	}
	input:not([type='checkbox'], [type='radio'], [type='file']),
	select {
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--field-edge);
		border-radius: 0;
		background: var(--surface-body);
	}
	input::placeholder {
		color: var(--text-muted);
	}
	input[type='checkbox'],
	input[type='radio'] {
		accent-color: var(--brass-500);
	}
	.file {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-4);
		cursor: pointer;
	}
	.file:hover .pick {
		border-color: var(--border-brass);
	}
	.file:active .pick {
		background: var(--surface-inset);
	}
	.file:has(input:focus-visible) .pick {
		outline: 2px solid var(--border-focus);
		outline-offset: 2px;
	}
	.pick {
		padding: 0 var(--space-5);
	}
	.chosen {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		overflow-wrap: anywhere;
		min-width: 0;
	}
	.preview {
		max-width: var(--measure);
		color: var(--text-body);
	}
	.status {
		color: var(--accent-state-text);
		font-size: var(--text-body-sm);
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
		.fields {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
