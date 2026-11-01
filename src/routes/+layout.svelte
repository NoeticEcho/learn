<!--
	The shell: a skip link, the wordmark, the sections and the language switch, Эхо's launcher, the
	page, and a footer that says what the platform does not do. The map and the gallery are the web
	course's, so the header names them on its pages only.

	Эхо is on every page, this layout being what every page has, the 404 included
	(docs/specs/2026-11-01-platform-design.md §5.3). Below 1100 px its launcher is in the page's
	flow, in the header and again in the footer, and its panel opens in flow and pushes the page
	down, so on a phone it never covers anything. From 1100 px the launcher is a tab on the
	screen's edge, inside the container's padding. The panel and its script are a chunk of their
	own, loaded on the first click, and the launcher is drawn only with a script (app.html's `js`).

	The edition is the URL's (+layout.ts). The script makes it the locale (i18n setLocale) for the
	first render, on the server and in the browser; after that, everything is inside a {#key} on
	it, whose expression makes a new edition the locale before anything inside renders again: a component that read
	a string once, in its script, is made again when the edition changes, and a Russian page never
	renders with English strings left over, or the other way round. The switch itself reloads the
	page (data-sveltekit-reload), so the store and the service worker see a fresh document.
-->
<script lang="ts">
	import '../app.css';
	import favicon from '../../design/mascot/echo-mark.svg';
	// The two faces the first screen sets, fetched alongside the page rather than after the CSS:
	// Russian text needs both subsets (Cyrillic letters; Latin digits, spaces and punctuation),
	// English the Latin one only.
	import serifCyr from '../../design/fonts/literata-400-cyrillic.woff2';
	import serifLat from '../../design/fonts/literata-400-latin.woff2';
	import sansCyr from '../../design/fonts/ibm-plex-sans-400-cyrillic.woff2';
	import sansLat from '../../design/fonts/ibm-plex-sans-400-latin.woff2';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { tick, type Component } from 'svelte';
	import { setLocale, t, type Locale } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import { innerPath } from '#lib/seo/site.ts';
	import OfflineButton from '#lib/offline/OfflineButton.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const preload = $derived(data.lang === 'en' ? [serifLat, sansLat] : [serifCyr, serifLat, sansCyr, sansLat]);

	/** Makes the edition the locale, and returns it for the {#key} below. */
	const edition = (l: Locale) => (setLocale(l), l);
	// The first render's, on the server too: a server render does not evaluate a key's expression.
	// svelte-ignore state_referenced_locally
	setLocale(data.lang);

	const inner = $derived(innerPath(page.url.pathname));
	// The web course's own pages: a lesson, its map and gallery, its page and its prologue.
	const inWebCourse = $derived(/^\/(lesson|map|gallery|course\/web)(\/|$)/.test(inner));
	const nav = $derived([
		{ href: links.home(), label: 'nav.courses', path: '/' },
		...(inWebCourse
			? [
					{ href: links.map(), label: 'nav.map', path: '/map/' },
					{ href: links.gallery(), label: 'nav.gallery', path: '/gallery/' }
				]
			: []),
		{ href: links.review(), label: 'nav.review', path: '/review/' },
		{ href: links.settings(), label: 'nav.settings', path: '/settings/' }
	]);

	// Эхо's panel: its chunk arrives on the first click, and a click that cannot load it says so.
	let Dock = $state<Component<{ onclose: () => void }> | null>(null);
	let echoOpen = $state(false);
	let echoFailed = $state(false);
	let opener: HTMLElement | null = null;
	async function toggleEcho(e: MouseEvent) {
		if (echoOpen) return closeEcho();
		opener = e.currentTarget as HTMLElement;
		echoFailed = false;
		try {
			Dock ??= (await import('#lib/guide/Dock.svelte')).default as unknown as Component<{ onclose: () => void }>;
			echoOpen = true;
		} catch {
			echoFailed = true; // offline before the worker had the chunk
			echoOpen = true;
		}
		await tick();
		const panel = document.getElementById('echo-panel');
		panel?.focus({ preventScroll: true });
		// From the footer, the panel is far up the page; from the tab, it is on screen.
		panel?.scrollIntoView({ block: 'nearest' });
	}
	function closeEcho() {
		echoOpen = false;
		opener?.focus(); // back where the person was, focus and scroll
	}
	afterNavigate(() => {
		echoOpen = false;
	});

	// The same page in the other edition. A lesson the other edition does not have yet (the page
	// data's `editions`) is sent to its part on that edition's map.
	const other = $derived<Locale>(data.lang === 'ru' ? 'en' : 'ru');
	const switchHref = $derived.by(() => {
		const has = (page.data.editions as Locale[] | undefined)?.includes(other) ?? true;
		const part = (page.data.part as { number: number } | undefined)?.number;
		return has || part === undefined ? links.counterpart(innerPath(page.url.pathname), other) : `${links.map(other)}#part-${part}`;
	});
	// The choice is remembered, so the Russian home sends a person who chose English on (app.html).
	function remember() {
		try {
			localStorage.setItem('learn.lang', other);
		} catch {
			// storage blocked: the switch still works, it is only not remembered
		}
	}

	$effect(() => {
		document.documentElement.lang = data.lang;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	{#each preload as href (href)}<link rel="preload" {href} as="font" type="font/woff2" crossorigin="anonymous" />{/each}
</svelte:head>

{#key edition(data.lang)}
	<a class="skip" href="#main">{t('nav.skip')}</a>

	<header class="top">
		<div class="container bar">
			<a class="mark" href={links.home()} aria-label={t('nav.home')}>{t('app.title')}</a>
			<nav aria-label={t('nav.label')}>
				<ul>
					{#each nav as item (item.path)}
						<li><a href={item.href} aria-current={inner === item.path ? 'page' : undefined}>{t(item.label)}</a></li>
					{/each}
					<li>
						<a class="lang" href={switchHref} hreflang={other} lang={other} data-sveltekit-reload onclick={remember}>{t('lang.switch')}</a>
					</li>
				</ul>
			</nav>
			<button type="button" class="echo-launch echo-head" aria-expanded={echoOpen} aria-controls="echo-panel" onclick={toggleEcho}>
				<img src={favicon} alt="" width="22" height="27" />{t('echo.open')}
			</button>
		</div>
	</header>

	<div class="echo-host">
		{#if echoOpen}
			{#if Dock && !echoFailed}
				<Dock onclose={closeEcho} />
			{:else}
				<div id="echo-panel" class="container echo-failed" role="status" tabindex="-1">{t('echo.failed')}</div>
			{/if}
		{/if}
	</div>
	<button type="button" class="echo-launch echo-tab" aria-label={t('echo.ask')} title={t('echo.ask')} aria-expanded={echoOpen} aria-controls="echo-panel" onclick={toggleEcho}>
		<img src={favicon} alt="" width="30" height="37" />
	</button>

	<main id="main" tabindex="-1">
		{@render children()}
	</main>

	<footer class="foot">
		<div class="container cols">
			<div class="private">
				<p>{t('footer.private')}</p>
				<OfflineButton />
				<button type="button" class="echo-launch echo-foot" aria-expanded={echoOpen} aria-controls="echo-panel" onclick={toggleEcho}>
					<img src={favicon} alt="" width="22" height="27" />{t('echo.ask')}
				</button>
			</div>
			<p class="meta">
				{t('footer.licence')}<br />
				<a href="https://github.com/NoeticEcho/learn">{t('footer.source')}</a>
				<span aria-hidden="true">&nbsp;&nbsp;</span>
				<a href="https://open.noeticecho.space">{t('footer.made')}</a>
			</p>
		</div>
	</footer>
{/key}

<style>
	.skip {
		position: absolute;
		left: var(--space-4);
		top: var(--space-2);
		z-index: 10;
		padding: var(--space-2) var(--space-4);
		background: var(--surface-panel-solid);
		transform: translateY(-200%);
	}
	.skip:focus-visible {
		transform: none;
	}
	.top {
		border-bottom: var(--line) solid var(--border-hairline);
	}
	/* Эхо's launchers. Hidden without a script (nothing dead is drawn), and one at a time by width. */
	.echo-launch {
		display: none;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--hit-min);
		padding: 0;
		border: none;
		background: none;
		color: var(--text-primary);
		font: inherit;
		font-size: var(--text-body-sm);
		cursor: pointer;
	}
	.echo-launch:hover {
		color: var(--accent-measure);
	}
	:global(html.js) .echo-head,
	:global(html.js) .echo-foot {
		display: inline-flex;
	}
	/* On a phone Эхо shares the wordmark's row, and the sections take the next one. */
	@media (max-width: 700px) {
		.echo-head {
			order: 2;
		}
		nav {
			order: 3;
			flex-basis: 100%;
		}
		.bar {
			padding-block: var(--space-2);
			row-gap: 0;
		}
	}
	.echo-foot {
		justify-self: start;
	}
	.echo-failed {
		padding-block: var(--space-4);
		color: var(--text-body);
		border-bottom: var(--line) solid var(--border-hairline);
	}
	@media (min-width: 1100px) {
		:global(html.js) .echo-head,
		:global(html.js) .echo-foot {
			display: none;
		}
		/* A tab on the edge, no wider than the container's padding, so it covers no text. */
		:global(html.js) .echo-tab {
			display: flex;
			justify-content: center;
			position: fixed;
			right: 0;
			bottom: var(--space-6);
			z-index: 15;
			width: 44px;
			min-height: 64px;
			background: var(--surface-panel-solid);
			border: var(--line) solid var(--border-rule);
			border-right: none;
		}
		.echo-tab[aria-expanded='true'] {
			border-color: var(--border-brass);
		}
		/* The narration player is a bar along the screen's foot: the tab stands on it, not behind it. */
		:global(body:has([data-narration-player])) .echo-tab {
			bottom: calc(10rem + var(--space-3));
		}
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-5);
		min-height: 4rem;
		flex-wrap: wrap;
	}
	.mark {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		text-decoration: none;
		white-space: nowrap;
	}
	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-5);
		list-style: none;
		margin: 0;
		padding: 0;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: var(--hit-min);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--text-body-sm);
		white-space: nowrap;
	}
	nav a:hover {
		color: var(--text-primary);
	}
	/* The switch names the other edition in its own language, set apart from the sections. */
	nav .lang {
		padding-left: var(--space-5);
		border-left: var(--line) solid var(--border-hairline);
	}
	nav a[aria-current='page'] {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--accent-measure);
		text-underline-offset: 0.45em;
	}
	main {
		outline: none;
	}
	.foot {
		margin-top: var(--space-9);
		border-top: var(--line) solid var(--border-hairline);
		padding-block: var(--space-6);
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-5);
		align-items: end;
	}
	.foot p {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.private {
		display: grid;
		gap: var(--space-2);
		max-width: var(--measure-narrow);
	}
	.meta {
		text-align: right;
	}
	@media (max-width: 600px) {
		/* On a phone the switch may wrap to a line of its own, where a rule before it would dangle. */
		nav .lang {
			padding-left: 0;
			border-left: none;
		}
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
		.meta {
			text-align: left;
		}
	}
</style>
