<!--
	The shell: a skip link, the wordmark and four plain links (no button: the one action on each
	screen belongs to the screen), the page, and a footer that says what the textbook does not do.
-->
<script lang="ts">
	import '../app.css';
	import favicon from '../../design/mascot/echo-mark.svg';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import OfflineButton from '#lib/offline/OfflineButton.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const nav = [
		{ href: links.map(), label: 'nav.map' },
		{ href: links.review(), label: 'nav.review' },
		{ href: links.gallery(), label: 'nav.gallery' },
		{ href: links.settings(), label: 'nav.settings' }
	];
	const current = (href: string) => page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
</svelte:head>

<a class="skip" href="#main">{t('nav.skip')}</a>

<header class="top">
	<div class="container bar">
		<a class="mark" href={links.home()} aria-label={t('nav.home')}>{t('app.title')}</a>
		<nav aria-label={t('nav.label')}>
			<ul>
				{#each nav as item (item.href)}
					<li><a href={item.href} aria-current={current(item.href) ? 'page' : undefined}>{t(item.label)}</a></li>
				{/each}
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
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
		.meta {
			text-align: left;
		}
	}
</style>
