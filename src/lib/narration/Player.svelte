<!--
	The lesson's player (spec §4.9), loaded on the first «Слушать». It plays the lesson section by
	section, marks the section being read on the page, and lets the listener jump to any section
	from its list. Speed 0.8–1.5×, the system's media keys and lock screen (Media Session), and the
	place reached remembered per lesson in the learner's own store, so «Слушать» tomorrow goes on
	from there.

	Offline only on request: «Скачать для офлайна» puts this lesson's files in a cache of their own
	(`narration`, which the service worker's clean-up does not touch, because its name is not a
	build's), and a downloaded section plays from there. Nothing else is precached: the whole
	course is hours of audio, and a reader who never listens should not pay for it.
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { t, getLocale } from '#lib/i18n/index.ts';
	import type { Narration } from './types.ts';

	type Props = { narration: Narration; lesson: string; title: string; onclose: () => void };
	let { narration, lesson, title, onclose }: Props = $props();

	const CACHE = 'narration';
	const RATES = [0.8, 0.9, 1, 1.1, 1.25, 1.5];
	const lang = getLocale();
	// the player is made for one lesson: LessonView is keyed by the lesson's id
	const key = $derived(`narration:${lang}:${lesson}`);
	const sections = $derived(narration.sections);
	const url = (i: number) => new URL(narration.base + sections[i].file, location.origin).href;

	let audio: HTMLAudioElement;
	let index = $state(0);
	let time = $state(0);
	let length = $state(0);
	let playing = $state(false);
	let rate = $state(1);
	let failed = $state(false);
	let saved = $state<'none' | 'busy' | 'all'>('none');
	let progress = $state(0);
	let listOpen = $state(false);
	let blobUrl: string | null = null;
	let lastSave = 0;

	const fmt = (s: number) => {
		const v = Math.max(0, Math.floor(s));
		return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
	};

	// ---- the store: where the listener stopped ----
	async function store() {
		const { db, progress: p } = await import('#lib/learner.ts');
		return { d: await db(), p };
	}
	async function remember(force = false) {
		const now = Date.now();
		if (!force && now - lastSave < 5000) return;
		lastSave = now;
		try {
			const { d, p } = await store();
			await p.setSetting(d, key, { i: index, t: Math.floor(audio?.currentTime ?? time) });
		} catch {
			// private mode or a blocked store: the player still plays, it only forgets
		}
	}
	async function recall(): Promise<{ i: number; t: number } | undefined> {
		try {
			const { d, p } = await store();
			return await p.getSetting<{ i: number; t: number }>(d, key);
		} catch {
			return undefined;
		}
	}

	// ---- the page: which section is being read ----
	const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
	function nodes(i: number): Element[] {
		const s = sections[i];
		if (s.key === 'intro') return [...document.querySelectorAll('.lesson .head h1, .lesson .head .why, .lesson .prose > .definition')];
		const heads = [...document.querySelectorAll('.lesson .prose > h2')];
		let h = heads[Number(s.key) - 1];
		if (!h || norm(h.textContent) !== norm(s.heading)) h = heads.find((x) => norm(x.textContent) === norm(s.heading)) ?? h;
		if (!h) return [];
		const out: Element[] = [h];
		for (let n = h.nextElementSibling; n && n.tagName !== 'H2'; n = n.nextElementSibling) out.push(n);
		return out;
	}
	function mark(i: number | null) {
		for (const el of document.querySelectorAll('[data-narrating]')) el.removeAttribute('data-narrating');
		if (i === null) return;
		const ns = nodes(i);
		ns.forEach((el, k) => el.setAttribute('data-narrating', k === 0 ? 'first' : ''));
	}

	// ---- playback ----
	async function source(i: number): Promise<string> {
		if (blobUrl) URL.revokeObjectURL(blobUrl);
		blobUrl = null;
		if ('caches' in window) {
			try {
				const hit = await (await caches.open(CACHE)).match(url(i));
				if (hit) return (blobUrl = URL.createObjectURL(await hit.blob()));
			} catch {
				// no cache: the network it is
			}
		}
		return url(i);
	}

	async function load(i: number, at = 0, play = true) {
		index = i;
		failed = false;
		length = sections[i].duration;
		time = at;
		mark(i);
		meta();
		audio.src = await source(i);
		audio.playbackRate = rate;
		audio.preservesPitch = true;
		if (at) audio.currentTime = at;
		if (play) await audio.play().catch(() => (playing = false));
		remember(true);
	}

	function toggle() {
		if (audio.paused) audio.play().catch(() => (failed = true));
		else audio.pause();
	}
	const prev = () => (audio.currentTime > 3 || index === 0 ? (audio.currentTime = 0) : load(index - 1));
	const next = () => index < sections.length - 1 && load(index + 1);
	function jump(i: number) {
		listOpen = false;
		load(i);
		const first = nodes(i)[0];
		first?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	}
	function seek(e: Event) {
		audio.currentTime = Number((e.currentTarget as HTMLInputElement).value);
	}
	function setRate(e: Event) {
		rate = Number((e.currentTarget as HTMLSelectElement).value);
		audio.playbackRate = rate;
		try {
			localStorage.setItem('learn.narration.rate', String(rate));
		} catch {}
	}
	function ended() {
		if (index < sections.length - 1) load(index + 1);
		else {
			playing = false;
			index = 0;
			time = 0;
			mark(null);
			store()
				.then(({ d, p }) => p.setSetting(d, key, { i: 0, t: 0 }))
				.catch(() => {});
		}
	}

	// ---- the system's media controls ----
	function meta() {
		if (!('mediaSession' in navigator)) return;
		navigator.mediaSession.metadata = new MediaMetadata({ title: sections[index].heading, artist: t('app.title'), album: title });
	}
	function position() {
		if (!('mediaSession' in navigator) || !Number.isFinite(audio.duration)) return;
		try {
			navigator.mediaSession.setPositionState({ duration: audio.duration, position: Math.min(audio.currentTime, audio.duration), playbackRate: rate });
		} catch {}
	}
	function handlers(on: boolean) {
		if (!('mediaSession' in navigator)) return;
		const set = (a: MediaSessionAction, h: MediaSessionActionHandler | null) => {
			try {
				navigator.mediaSession.setActionHandler(a, on ? h : null);
			} catch {}
		};
		set('play', () => audio.play());
		set('pause', () => audio.pause());
		set('previoustrack', () => prev());
		set('nexttrack', () => next());
		set('seekbackward', (d) => (audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset ?? 10))));
		set('seekforward', (d) => (audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset ?? 10))));
		set('seekto', (d) => d.seekTime !== undefined && (audio.currentTime = d.seekTime));
		set('stop', () => close());
	}

	// ---- offline, on request ----
	async function checkSaved() {
		if (!('caches' in window)) return;
		try {
			const c = await caches.open(CACHE);
			const have = await Promise.all(sections.map((_, i) => c.match(url(i))));
			saved = have.every(Boolean) ? 'all' : 'none';
		} catch {}
	}
	async function download() {
		saved = 'busy';
		progress = 0;
		try {
			const c = await caches.open(CACHE);
			for (let i = 0; i < sections.length; i++) {
				if (!(await c.match(url(i)))) {
					const res = await fetch(url(i));
					if (!res.ok) throw new Error(String(res.status));
					await c.put(url(i), res);
				}
				progress = i + 1;
			}
			saved = 'all';
		} catch {
			saved = 'none';
			failed = true;
		}
	}
	async function removeDownload() {
		try {
			const c = await caches.open(CACHE);
			await Promise.all(sections.map((_, i) => c.delete(url(i))));
		} catch {}
		saved = 'none';
	}

	function close() {
		audio.pause();
		remember(true);
		mark(null);
		handlers(false);
		if ('mediaSession' in navigator) navigator.mediaSession.metadata = null;
		onclose();
	}

	onMount(() => {
		try {
			const r = Number(localStorage.getItem('learn.narration.rate'));
			if (RATES.includes(r)) rate = r;
		} catch {}
		handlers(true);
		checkSaved();
		(async () => {
			const at = await recall();
			const i = at && at.i < sections.length ? at.i : 0;
			await tick();
			await load(i, at && at.i === i ? Math.max(0, at.t - 2) : 0);
		})();
		const hide = () => remember(true);
		addEventListener('pagehide', hide);
		return () => {
			removeEventListener('pagehide', hide);
			audio?.pause();
			mark(null);
			handlers(false);
			if (blobUrl) URL.revokeObjectURL(blobUrl);
		};
	});
</script>

<section id="narration-player" class="player" aria-label={t('narration.player')}>
	<div class="bar container">
		<div class="controls">
			<button type="button" class="icon" onclick={prev} aria-label={t('narration.prev')}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M3 2h2v12H3zM14 2.5v11L6 8z" fill="currentColor" /></svg>
			</button>
			<button type="button" class="icon play" onclick={toggle} aria-label={playing ? t('narration.pause') : t('narration.play')} data-state={playing ? 'playing' : 'paused'}>
				{#if playing}
					<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor" /></svg>
				{:else}
					<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
				{/if}
			</button>
			<button type="button" class="icon" onclick={next} disabled={index === sections.length - 1} aria-label={t('narration.next')}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M11 2h2v12h-2zM2 2.5v11L10 8z" fill="currentColor" /></svg>
			</button>
		</div>

		<div class="now">
			<p class="where" aria-live="polite">
				<span class="count">{t('narration.section', { n: index + 1, total: sections.length })}</span>
				<span class="heading">{sections[index].heading}</span>
			</p>
			<div class="seek">
				<span class="time" aria-hidden="true">{fmt(time)}</span>
				<input
					type="range"
					min="0"
					max={Math.max(1, Math.floor(length))}
					step="1"
					value={Math.floor(time)}
					oninput={seek}
					aria-label={t('narration.position')}
					aria-valuetext={t('narration.of', { a: fmt(time), b: fmt(length) })} />
				<span class="time" aria-hidden="true">{fmt(length)}</span>
			</div>
		</div>

		<div class="more">
			<label class="rate">
				<span>{t('narration.speed')}</span>
				<select value={rate} onchange={setRate}>
					{#each RATES as r (r)}<option value={r}>{String(r).replace('.', lang === 'ru' ? ',' : '.')}×</option>{/each}
				</select>
			</label>
			<button type="button" class="quiet" aria-expanded={listOpen} aria-controls="narration-sections" onclick={() => (listOpen = !listOpen)}>{t('narration.sections')}</button>
			<button type="button" class="icon" onclick={close} aria-label={t('narration.close')}>
				<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M3.5 2.4 8 6.9l4.5-4.5 1.1 1.1L9.1 8l4.5 4.5-1.1 1.1L8 9.1l-4.5 4.5-1.1-1.1L6.9 8 2.4 3.5z" fill="currentColor" /></svg>
			</button>
		</div>
	</div>

	{#if listOpen}
		<div class="panel container" id="narration-sections">
			<ol class="sections">
				{#each sections as s, i (s.key)}
					<li>
						<button type="button" class="quiet" aria-current={i === index ? 'true' : undefined} onclick={() => jump(i)}>
							<span>{s.heading}</span><span class="dur">{fmt(s.duration)}</span>
						</button>
					</li>
				{/each}
			</ol>
			<div class="offline">
				{#if saved === 'all'}
					<p role="status">{t('narration.downloaded')}</p>
					<button type="button" class="quiet" onclick={removeDownload}>{t('narration.remove')}</button>
				{:else if saved === 'busy'}
					<p role="status">{t('narration.downloading', { done: progress, total: sections.length })}</p>
				{:else}
					<button type="button" class="quiet" onclick={download}>{t('narration.download')}</button>
				{/if}
			</div>
			<p class="note">{t('narration.note')}</p>
		</div>
	{/if}
	{#if failed}<p class="error container" role="alert">{t('narration.error')}</p>{/if}

	<audio
		bind:this={audio}
		preload="metadata"
		onplay={() => (playing = true)}
		onpause={() => {
			playing = false;
			remember(true);
		}}
		ontimeupdate={() => {
			time = audio.currentTime;
			remember();
			position();
		}}
		onloadedmetadata={() => {
			if (Number.isFinite(audio.duration)) length = audio.duration;
			position();
		}}
		onended={ended}
		onerror={() => {
			if (audio.getAttribute('src')) failed = true;
		}}></audio>
</section>
<div class="spacer" aria-hidden="true"></div>

<style>
	.player {
		position: fixed;
		inset: auto 0 0 0;
		z-index: 20;
		background: var(--surface-panel-solid);
		border-top: var(--line) solid var(--border-hairline);
		box-shadow: 0 -8px 24px rgb(0 0 0 / 0.18);
	}
	.spacer {
		height: 9rem;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-4);
		padding-block: var(--space-3);
	}
	.controls,
	.more {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.play {
		border-color: var(--border-brass);
	}
	.now {
		flex: 1 1 18rem;
		min-width: 0;
	}
	.where {
		display: flex;
		gap: var(--space-2);
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
	}
	.count {
		color: var(--text-secondary);
	}
	.heading {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.seek {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--hit-min);
	}
	.seek input {
		flex: 1;
		min-width: 0;
		min-height: var(--hit-min);
		accent-color: var(--accent-command);
	}
	.time {
		font-variant-numeric: tabular-nums;
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}
	.rate {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.rate select {
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid var(--border-hairline);
		border-radius: var(--radius-none);
		background: transparent;
		color: var(--text-primary);
		font: inherit;
	}
	.rate option {
		background: var(--surface-panel-solid);
		color: var(--text-primary);
	}
	.panel {
		max-height: 50vh;
		overflow-y: auto;
		padding-bottom: var(--space-4);
	}
	.sections {
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: s;
	}
	.sections button {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		width: 100%;
		padding-inline: 0;
		text-align: left;
	}
	.sections button[aria-current] {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.dur {
		font-variant-numeric: tabular-nums;
		color: var(--text-secondary);
	}
	.offline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
		margin-top: var(--space-3);
	}
	.offline .quiet {
		padding-inline: 0;
	}
	.offline p,
	.note,
	.error {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.note {
		margin-top: var(--space-2);
		font-size: var(--text-caption);
	}
	.error {
		padding-bottom: var(--space-3);
		color: var(--text-primary);
	}
	/* The section being read, on the page. */
	:global([data-narrating]) {
		box-shadow: -1rem 0 0 -0.75rem var(--accent-command);
	}
	@media (max-width: 600px) {
		.spacer {
			height: 12rem;
		}
		.more {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
