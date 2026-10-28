<!--
	The shell: a skip link, the wordmark, four plain links and the language switch (no button: the
	one action on each screen belongs to the screen), the page, and a footer that says what the
	textbook does not do.

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

	const nav = () => [
		{ href: links.map(), label: 'nav.map' },
		{ href: links.review(), label: 'nav.review' },
		{ href: links.gallery(), label: 'nav.gallery' },
		{ href: links.settings(), label: 'nav.settings' }
	];
	const current = (href: string) => page.url.pathname.startsWith(href);

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
					{#each nav() as item (item.href)}
						<li><a href={item.href} aria-current={current(item.href) ? 'page' : undefined}>{t(item.label)}</a></li>
					{/each}
					<li>
						<a class="lang" href={switchHref} hreflang={other} lang={other} data-sveltekit-reload onclick={remember}>{t('lang.switch')}</a>
					</li>
				</ul>
			</nav>
		</div>
	</header>

	<main id="main" tabindex="-1">
		{@render children()}
	</main>

	<footer class="foot">
		<div class="container cols">
			<div class="private">
				<p>{t('footer.private')}</p>
				<OfflineButton />
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
