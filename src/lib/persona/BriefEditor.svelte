<!--
	The brief editor (spec §3.1b, §3.2): every field of the person's project, in the brief's seven
	groups. Used in settings and inline in the brief lesson (00-start/04-brief).

	What is stored is only what the person changed: an empty field, or a list they never touched,
	takes the value of their project kind's template, shown grey or marked «пример». Each field
	saves on its own timer and a pending save is flushed, never dropped, when the editor goes away
	or the page is hidden: one shared timer lost a field's last edit when the person moved to the
	next field within the debounce (9f5c6fe), and a cancelled one lost the last edit on leaving
	(7efc2bf). The value saved is read when the timer fires, so it is always the latest.

	After a save it dispatches `learn:brief` on window, so a practice step on the same page can
	re-read the brief.
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import { KINDS, TEMPLATES, type Kind, type Persona } from './fields.ts';

	type Props = {
		/** «Вернуть пример», which erases everything the person wrote; settings shows it, a lesson does not. */
		resettable?: boolean;
	};
	let { resettable = false }: Props = $props();

	const uid = $props.id();

	type Item = { title: string; text: string; price?: string };
	type Person = { name: string; role: string };
	type Proof = { title: string; text?: string };
	type Lists = { sections: string[]; items: Item[]; people: Person[]; proofs: Proof[] };
	type ListKey = keyof Lists;

	const FLAT = ['title', 'who', 'name', 'profession', 'bio', 'forWhom', 'phone', 'email', 'city'] as const;
	type Flat = (typeof FLAT)[number];
	const MULTILINE = new Set<Flat>(['who', 'forWhom', 'bio']);
	const ACTIONS = ['book', 'call', 'form', 'buy', 'signup', 'read'] as const;
	const TONES = ['formal', 'warm', 'bold', 'calm'] as const;
	const LANGS = ['ru', 'en'] as const;
	/** The card's contacts are also the brief's `contacts`, so a check may read either. */
	const MIRRORED = new Set<Flat>(['phone', 'email', 'city']);

	let loaded = $state(false);
	let kind = $state<Kind>('expert');
	let flat = $state<Record<Flat, string>>(Object.fromEntries(FLAT.map((k) => [k, ''])) as Record<Flat, string>);
	let action = $state<{ label: string; kind: string }>({ label: '', kind: '' });
	let address = $state('');
	/** A list the person has made their own; absent means the template's list is shown. */
	let lists = $state<Partial<Lists>>({});
	let languages = $state<string[] | null>(null);
	let tone = $state<string | null>(null);
	let note = $state('');
	let resetting = $state(false);

	const template = $derived(TEMPLATES[kind] as Persona);
	const shown = <K extends ListKey>(k: K): Lists[K] => (lists[k] ?? (template[k] as Lists[K])) as Lists[K];
	const langs = $derived(languages ?? template.languages);
	const toneNow = $derived(tone ?? template.tone);

	onMount(() => {
		(async () => {
			const { db, progress } = await import('#lib/learner.ts');
			const own = await progress.persona(await db());
			kind = (own.kind as Kind) ?? 'expert';
			for (const k of FLAT) flat[k] = typeof own[k] === 'string' ? (own[k] as string) : '';
			const ma = (own.mainAction ?? {}) as Partial<{ label: string; kind: string }>;
			action = { label: ma.label ?? '', kind: ma.kind ?? '' };
			address = ((own.contacts ?? {}) as { address?: string }).address ?? '';
			for (const k of ['sections', 'items', 'people', 'proofs'] as ListKey[]) if (Array.isArray(own[k]) && (own[k] as unknown[]).length) lists[k] = structuredClone(own[k]) as never;
			languages = Array.isArray(own.languages) && own.languages.length ? (own.languages as string[]) : null;
			tone = typeof own.tone === 'string' ? own.tone : null;
			loaded = true;
		})();
		addEventListener('pagehide', flush);
		return () => {
			removeEventListener('pagehide', flush);
			flush();
		};
	});

	// ----- saving: one timer per stored field, flushed rather than dropped -----

	const clean = (s: string | undefined) => (s ?? '').trim();
	const compact = (o: Record<string, string | undefined>) => {
		const out: Record<string, string> = {};
		for (const [k, v] of Object.entries(o)) if (clean(v)) out[k] = clean(v);
		return Object.keys(out).length ? out : undefined;
	};

	/** What a stored field holds now, cleaned: trimmed text, no empty rows, no empty keys. */
	function value(field: string): unknown {
		if ((FLAT as readonly string[]).includes(field)) return clean(flat[field as Flat]) || undefined;
		switch (field) {
			case 'mainAction':
				return compact(action);
			case 'contacts':
				return compact({ phone: flat.phone, email: flat.email, city: flat.city, address });
			case 'sections': {
				const l = lists.sections?.map(clean).filter(Boolean);
				return l?.length ? l : undefined;
			}
			case 'items':
			case 'people':
			case 'proofs': {
				const l = (lists[field] as Record<string, string | undefined>[] | undefined)?.map(compact).filter(Boolean);
				return l?.length ? l : undefined;
			}
			case 'languages':
				return languages ?? undefined;
			case 'tone':
				return tone ?? undefined;
		}
		return undefined;
	}

	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	async function write(field: string) {
		timers.delete(field);
		const v = $state.snapshot(value(field));
		const { db, progress } = await import('#lib/learner.ts');
		await progress.setPersona(await db(), field, v);
		note = t('settings.saved');
		dispatchEvent(new CustomEvent('learn:brief'));
	}

	function queue(field: string) {
		clearTimeout(timers.get(field));
		timers.set(
			field,
			setTimeout(() => write(field), 400)
		);
	}

	function flush() {
		for (const [field, timer] of [...timers]) {
			clearTimeout(timer);
			write(field);
		}
	}

	// ----- edits -----

	function editFlat(k: Flat, v: string) {
		flat[k] = v;
		queue(k);
		if (MIRRORED.has(k)) queue('contacts');
	}

	async function chooseKind(k: Kind) {
		kind = k;
		const { db, progress } = await import('#lib/learner.ts');
		await progress.setPersona(await db(), 'kind', k);
		note = t('settings.saved');
		dispatchEvent(new CustomEvent('learn:brief'));
	}

	/** The list the person edits: the template's, copied, the first time they touch it. */
	function mine<K extends ListKey>(k: K): Lists[K] {
		if (!lists[k]) lists[k] = structuredClone($state.snapshot(template[k])) as never;
		return lists[k]!;
	}

	function editRow<K extends ListKey>(k: K, i: number, patch: string | Record<string, string>) {
		const l = mine(k) as unknown[];
		l[i] = typeof patch === 'string' ? patch : { ...(l[i] as object), ...patch };
		queue(k);
	}

	const BLANK: { [K in ListKey]: () => Lists[K][number] } = {
		sections: () => '',
		items: () => ({ title: '', text: '' }),
		people: () => ({ name: '', role: '' }),
		proofs: () => ({ title: '' })
	};

	async function addRow(k: ListKey) {
		const l = mine(k) as unknown[];
		l.push(BLANK[k]());
		queue(k);
		await tick();
		document.getElementById(`${uid}-${k}-${l.length - 1}-0`)?.focus();
	}

	async function removeRow(k: ListKey, i: number) {
		const l = mine(k) as unknown[];
		l.splice(i, 1);
		queue(k);
		await tick();
		(document.getElementById(`${uid}-${k}-${Math.min(i, l.length - 1)}-0`) ?? document.getElementById(`${uid}-${k}-add`))?.focus();
	}

	async function moveRow(k: ListKey, i: number, d: -1 | 1) {
		const l = mine(k) as unknown[];
		const j = i + d;
		if (j < 0 || j >= l.length) return;
		[l[i], l[j]] = [l[j], l[i]];
		queue(k);
		await tick();
		const target = document.getElementById(`${uid}-${k}-${j}-${d < 0 ? 'up' : 'down'}`) as HTMLButtonElement | null;
		(target && !target.disabled ? target : document.getElementById(`${uid}-${k}-${j}-0`))?.focus();
	}

	function toggleLang(l: string, on: boolean) {
		const now = new Set(langs);
		if (on) now.add(l);
		else if (now.size > 1) now.delete(l);
		languages = LANGS.filter((x) => now.has(x));
		queue('languages');
	}

	function chooseTone(v: string) {
		tone = v;
		queue('tone');
	}

	async function reset() {
		resetting = false;
		for (const timer of timers.values()) clearTimeout(timer);
		timers.clear();
		const { db } = await import('#lib/learner.ts');
		await (await db()).clear('persona');
		kind = 'expert';
		for (const k of FLAT) flat[k] = '';
		action = { label: '', kind: '' };
		address = '';
		lists = {};
		languages = null;
		tone = null;
		note = t('settings.saved');
		dispatchEvent(new CustomEvent('learn:brief'));
	}

	const ROWS: Record<Exclude<ListKey, 'sections'>, { fields: { key: string; label: string; multiline?: boolean }[]; one: string; add: string }> = {
		items: {
			one: 'brief.item',
			add: 'brief.item.add',
			fields: [
				{ key: 'title', label: 'brief.item.title' },
				{ key: 'text', label: 'brief.item.text', multiline: true },
				{ key: 'price', label: 'brief.item.price' }
			]
		},
		people: {
			one: 'brief.person',
			add: 'brief.person.add',
			fields: [
				{ key: 'name', label: 'brief.person.name' },
				{ key: 'role', label: 'brief.person.role' }
			]
		},
		proofs: {
			one: 'brief.proof',
			add: 'brief.proof.add',
			fields: [
				{ key: 'title', label: 'brief.proof.title' },
				{ key: 'text', label: 'brief.proof.text' }
			]
		}
	};
</script>

{#snippet field(k: Flat)}
	<div class="field" class:wide={MULTILINE.has(k)}>
		<label for="{uid}-{k}">{t(`settings.field.${k}`)}</label>
		{#if MULTILINE.has(k)}
			<textarea id="{uid}-{k}" rows="3" placeholder={String(template[k] ?? '')} value={flat[k]} oninput={(e) => editFlat(k, e.currentTarget.value)}></textarea>
		{:else}
			<input
				id="{uid}-{k}"
				type={k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text'}
				placeholder={String(template[k] ?? '')}
				value={flat[k]}
				oninput={(e) => editFlat(k, e.currentTarget.value)}
			/>
		{/if}
	</div>
{/snippet}

{#snippet tools(k: ListKey, i: number, n: number, what: string)}
	<div class="tools">
		<button type="button" class="quiet" id="{uid}-{k}-{i}-up" disabled={i === 0} onclick={() => moveRow(k, i, -1)}
			>{t('brief.up')}<span class="visually-hidden">: {what}</span></button
		>
		<button type="button" class="quiet" id="{uid}-{k}-{i}-down" disabled={i === n - 1} onclick={() => moveRow(k, i, 1)}
			>{t('brief.down')}<span class="visually-hidden">: {what}</span></button
		>
		<button type="button" class="quiet" onclick={() => removeRow(k, i)}>{t('brief.remove')}<span class="visually-hidden">: {what}</span></button>
	</div>
{/snippet}

{#snippet example(k: ListKey)}
	{#if !lists[k]}<p class="hint">{t('brief.example')}</p>{/if}
{/snippet}

<div class="brief" data-loaded={loaded}>
	<fieldset class="all" disabled={!loaded}>
		<legend class="visually-hidden">{t('brief.title')}</legend>

		<section aria-labelledby="{uid}-g-who">
			<h3 id="{uid}-g-who">{t('brief.who')}</h3>
			<div class="field">
				<label for="{uid}-kind">{t('settings.kind')}</label>
				<select id="{uid}-kind" value={kind} onchange={(e) => chooseKind(e.currentTarget.value as Kind)}>
					{#each KINDS as k (k)}<option value={k}>{t(`settings.kind.${k}`)}</option>{/each}
				</select>
			</div>
			<div class="fields">
				{@render field('title')}
				{@render field('name')}
				{@render field('profession')}
				{@render field('who')}
				{@render field('bio')}
			</div>
		</section>

		<section aria-labelledby="{uid}-g-for">
			<h3 id="{uid}-g-for">{t('brief.forWhom')}</h3>
			<div class="fields">{@render field('forWhom')}</div>
		</section>

		<section aria-labelledby="{uid}-g-action">
			<h3 id="{uid}-g-action">{t('brief.action')}</h3>
			<div class="fields">
				<div class="field">
					<label for="{uid}-action">{t('brief.action.label')}</label>
					<input
						id="{uid}-action"
						placeholder={template.mainAction.label}
						value={action.label}
						oninput={(e) => {
							action.label = e.currentTarget.value;
							queue('mainAction');
						}}
					/>
				</div>
				<div class="field">
					<label for="{uid}-action-kind">{t('brief.action.kind')}</label>
					<select
						id="{uid}-action-kind"
						value={action.kind || template.mainAction.kind}
						onchange={(e) => {
							action.kind = e.currentTarget.value;
							queue('mainAction');
						}}
					>
						{#each ACTIONS as a (a)}<option value={a}>{t(`brief.action.kind.${a}`)}</option>{/each}
					</select>
				</div>
			</div>
		</section>

		<section aria-labelledby="{uid}-g-sections">
			<h3 id="{uid}-g-sections">{t('brief.sections')}</h3>
			{@render example('sections')}
			<ol class="rows">
				{#each shown('sections') as s, i (i)}
					{@const what = t('brief.section', { n: i + 1 })}
					<li class="row">
						<div class="field">
							<label for="{uid}-sections-{i}-0">{what}</label>
							<input id="{uid}-sections-{i}-0" value={s} oninput={(e) => editRow('sections', i, e.currentTarget.value)} />
						</div>
						{@render tools('sections', i, shown('sections').length, what)}
					</li>
				{/each}
			</ol>
			<button type="button" class="secondary" id="{uid}-sections-add" onclick={() => addRow('sections')}>{t('brief.section.add')}</button>
		</section>

		<section aria-labelledby="{uid}-g-content">
			<h3 id="{uid}-g-content">{t('brief.content')}</h3>
			{#each Object.entries(ROWS) as [k, spec] (k)}
				{@const key = k as Exclude<ListKey, 'sections'>}
				{@const rows = shown(key) as Record<string, string | undefined>[]}
				<div class="group">
					<h4 id="{uid}-g-{key}">{t(`brief.${key}`)}</h4>
					{@render example(key)}
					{#if !rows.length}<p class="hint">{t('brief.empty')}</p>{/if}
					<ol class="rows" aria-labelledby="{uid}-g-{key}">
						{#each rows as row, i (i)}
							{@const what = t(spec.one, { n: i + 1 })}
							<li class="row">
								<fieldset>
									<legend>{what}</legend>
									<div class="fields">
										{#each spec.fields as f, j (f.key)}
											<div class="field" class:wide={f.multiline}>
												<label for="{uid}-{key}-{i}-{j}">{t(f.label)}</label>
												{#if f.multiline}
													<textarea id="{uid}-{key}-{i}-{j}" rows="2" value={row[f.key] ?? ''} oninput={(e) => editRow(key, i, { [f.key]: e.currentTarget.value })}></textarea>
												{:else}
													<input id="{uid}-{key}-{i}-{j}" value={row[f.key] ?? ''} oninput={(e) => editRow(key, i, { [f.key]: e.currentTarget.value })} />
												{/if}
											</div>
										{/each}
									</div>
									{@render tools(key, i, rows.length, what)}
								</fieldset>
							</li>
						{/each}
					</ol>
					<button type="button" class="secondary" id="{uid}-{key}-add" onclick={() => addRow(key)}>{t(spec.add)}</button>
				</div>
			{/each}
			<div class="group">
				<h4>{t('brief.contacts')}</h4>
				<div class="fields">
					{@render field('phone')}
					{@render field('email')}
					{@render field('city')}
					<div class="field">
						<label for="{uid}-address">{t('brief.contacts.address')}</label>
						<input
							id="{uid}-address"
							placeholder={template.contacts.address ?? ''}
							value={address}
							oninput={(e) => {
								address = e.currentTarget.value;
								queue('contacts');
							}}
						/>
					</div>
				</div>
			</div>
		</section>

		<section aria-labelledby="{uid}-g-langs">
			<h3 id="{uid}-g-langs">{t('brief.languages')}</h3>
			<fieldset class="choices">
				<legend class="visually-hidden">{t('brief.languages')}</legend>
				{#each LANGS as l (l)}
					{@const on = langs.includes(l)}
					<label class="check"
						><input type="checkbox" checked={on} disabled={on && langs.length === 1} onchange={(e) => toggleLang(l, e.currentTarget.checked)} />
						{t(`brief.lang.${l}`)}</label
					>
				{/each}
			</fieldset>
			<p class="hint">{t('brief.languages.min')}</p>
		</section>

		<section aria-labelledby="{uid}-g-tone">
			<h3 id="{uid}-g-tone">{t('brief.tone')}</h3>
			<fieldset class="choices">
				<legend class="visually-hidden">{t('brief.tone')}</legend>
				{#each TONES as v (v)}
					<label class="check"><input type="radio" name="{uid}-tone" checked={toneNow === v} onchange={() => chooseTone(v)} /> {t(`brief.tone.${v}`)}</label>
				{/each}
			</fieldset>
		</section>
	</fieldset>

	<div class="foot">
		{#if resettable}
			{#if resetting}
				<span class="ask" role="alert">
					{t('settings.project.reset.confirm')}
					<button type="button" class="secondary" onclick={reset}>{t('settings.project.reset.yes')}</button>
					<button type="button" class="quiet" onclick={() => (resetting = false)}>{t('practice.cancel')}</button>
				</span>
			{:else}
				<button type="button" class="quiet" onclick={() => (resetting = true)}>{t('settings.project.reset')}</button>
			{/if}
		{/if}
		<span class="status" role="status">{note}</span>
	</div>
</div>

<style>
	.all {
		border: 0;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	section {
		padding-block: var(--space-5);
	}
	section + section {
		border-top: var(--line) solid var(--border-hairline);
	}
	h3 {
		font-size: var(--text-body-lg);
		line-height: 1.3;
		margin: 0 0 var(--space-3);
	}
	h4 {
		font-family: var(--font-sans);
		font-size: var(--text-body-size);
		font-weight: var(--weight-medium);
		/* Twice the space above a group's head as below it: the head belongs to what follows,
		   not to the add button above it (hallmark 71). */
		margin: var(--space-6) 0 var(--space-2);
	}
	.group:first-of-type h4 {
		margin-top: 0;
	}
	.fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4) var(--space-5);
	}
	.field {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		min-width: 0;
	}
	section > .field {
		margin-bottom: var(--space-4);
		max-width: 24rem;
	}
	.wide {
		grid-column: 1 / -1;
	}
	label,
	legend {
		font-size: var(--text-body-sm);
		color: var(--text-primary);
	}
	input:not([type='checkbox'], [type='radio']),
	select,
	textarea {
		min-height: var(--hit-min);
		width: 100%;
		min-width: 0;
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--field-edge);
		border-radius: 0;
		background: var(--surface-body);
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--text-muted);
	}
	input[type='checkbox'],
	input[type='radio'] {
		accent-color: var(--brass-500);
	}
	.rows {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-2) var(--space-4);
		align-items: end;
	}
	.row fieldset {
		grid-column: 1 / -1;
		margin: 0;
		padding: var(--space-3) var(--space-4) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		min-width: 0;
	}
	.row legend {
		padding: 0 var(--space-2);
		color: var(--text-secondary);
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.row fieldset .tools {
		margin-top: var(--space-3);
	}
	.choices {
		border: 0;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--hit-min);
		color: var(--text-body);
		font-size: var(--text-body-size);
	}
	.hint {
		margin: 0 0 var(--space-3);
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		max-width: var(--measure);
	}
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3) var(--space-5);
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
	.status {
		color: var(--accent-state-text);
		font-size: var(--text-body-sm);
	}
	@media (max-width: 600px) {
		.fields {
			grid-template-columns: minmax(0, 1fr);
		}
		.row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
