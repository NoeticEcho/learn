<!--
	A page's head for search engines, answer engines and link previews: the title and the meta
	description, the canonical address, Open Graph and the Twitter card, the alternates of the
	other edition (site.ts EDITIONS: hreflang links and og:locale:alternate, for a page that exists
	in both), and the structured data. One component, so every page
	says the same things the same way; tests/e2e/seo.spec.ts reads the built pages.

	Link previews: Telegram and VK read og:title, og:description and og:image (absolute, https,
	PNG 1200 × 630); X reads twitter:card and falls back to the og: tags for the rest. A page that
	should not be indexed (the learner's own screens) says noindex and names no canonical.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { ldJson } from './jsonld.ts';
	import { getLocale, type Locale } from '#lib/i18n/index.ts';
	import { EDITIONS, OG_LOCALES, SITE_NAMES, absolute, alternates, at, innerPath, type Alternate } from './site.ts';

	type Props = {
		/** The page's own title; the document title adds the site's name. */
		title: string;
		/** The document title, when the site's name and the page's title do not make it. */
		full?: string;
		/** The meta description: what a search result or an answer engine quotes. */
		description: string;
		/** What a link preview shows under the title, when it should differ from the description. */
		preview?: string;
		/** The card's path under the base (`og/lesson-…png`) and its alt text. */
		image?: { file: string; alt: string };
		type?: 'website' | 'article';
		jsonld?: Record<string, unknown>[];
		noindex?: boolean;
		/** The editions this page exists in; every screen is in both, a lesson may not be yet. */
		editions?: readonly Locale[];
	};
	let { title, full: fullTitle, description, preview = description, image, type = 'website', jsonld = [], noindex = false, editions = EDITIONS.map((e) => e.lang) }: Props = $props();

	const lang = getLocale();
	const SITE_NAME = SITE_NAMES[lang];
	const url = $derived(absolute(page.url.pathname));
	const img = $derived(image && at.file(image.file));
	const full = $derived(fullTitle ?? (title === SITE_NAME ? title : `${title}: ${SITE_NAME}`));
	const alts: Alternate[] = $derived(alternates(innerPath(page.url.pathname), editions));
	const otherLocales = $derived(editions.filter((l) => l !== lang).map((l) => OG_LOCALES[l]));
	const scripts = $derived(jsonld.map((d) => `<script type="application/ld+json">${ldJson(d)}<\/script>`).join(''));
</script>

<svelte:head>
	<title>{full}</title>
	<meta name="description" content={description} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{:else}
		<link rel="canonical" href={url} />
		{#each alts as a (a.hreflang)}<link rel="alternate" hreflang={a.hreflang} href={a.href} />{/each}
	{/if}
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={OG_LOCALES[lang]} />
	{#each otherLocales as l (l)}<meta property="og:locale:alternate" content={l} />{/each}
	<meta property="og:title" content={title} />
	<meta property="og:description" content={preview} />
	<meta property="og:url" content={url} />
	{#if img && image}
		<meta property="og:image" content={img} />
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content={image.alt} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={preview} />
	{#if img && image}
		<meta name="twitter:image" content={img} />
		<meta name="twitter:image:alt" content={image.alt} />
	{/if}
	{@html scripts}
</svelte:head>
