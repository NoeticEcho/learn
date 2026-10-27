<!--
	2014: flat and responsive. Halfway through, the frame becomes a phone's width and the layout
	reflows (a container query). The width changes in one step under a cross-fade: it is never
	animated, which would relayout every frame.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/index.ts';
	import type { FrameProps } from '../types.ts';
	let { brief, still = false }: FrameProps = $props();

	let narrow = $state(false);
	onMount(() => {
		if (still) return;
		const id = setTimeout(() => (narrow = true), 5500);
		return () => clearTimeout(id);
	});
</script>

<div class="stage" class:narrow>
	<div class="page">
		<header>
			<span class="logo">{brief.title}</span>
			<span class="menu" aria-hidden="true"></span>
		</header>
		<section class="hero">
			<p class="who">{brief.forWhom}</p>
			<span class="button">{brief.action}</span>
		</section>
		<section class="cards">
			<div class="card"><b>{t('era.2014.about')}</b><span>{brief.title}</span></div>
			<div class="card"><b>{t('era.2014.how')}</b><span>{t('era.2014.how.text')}</span></div>
			<div class="card"><b>{t('era.2014.contact')}</b><span>{brief.action}</span></div>
		</section>
	</div>
</div>

<style>
	.stage {
		--e-bg: #ecf0f1;
		--e-flat: #1abc9c;
		--e-dark: #2c3e50;
		--e-white: #ffffff;
		--e-muted: #7f8c8d;
		--e-font: 'Open Sans', 'Helvetica Neue', var(--font-sans);
		height: 100%;
		display: grid;
		justify-items: center;
		background: var(--e-dark);
	}
	.page {
		container-type: inline-size;
		width: 100%;
		height: 100%;
		background: var(--e-bg);
		color: var(--e-dark);
		font-family: var(--e-font);
		overflow: hidden;
		animation: settle var(--dur-ui) var(--ease-stop);
	}
	.narrow .page {
		width: 360px;
		animation: reflow var(--dur-world) var(--ease-stop);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-5);
		background: var(--e-white);
	}
	.logo {
		font-weight: 600;
		font-size: 17px;
	}
	.menu {
		width: 20px;
		height: 12px;
		border-block: 2px solid var(--e-dark);
		position: relative;
		display: none;
	}
	.menu::after {
		content: '';
		position: absolute;
		inset: 3px 0 auto;
		border-top: 2px solid var(--e-dark);
	}
	.hero {
		padding: var(--space-6) var(--space-5);
		background: var(--e-flat);
		color: var(--e-white);
	}
	.who {
		margin: 0 0 var(--space-4);
		font-size: 24px;
		font-weight: 300;
		max-width: 30ch;
	}
	.button {
		display: inline-block;
		padding: var(--space-2) var(--space-5);
		background: var(--e-dark);
		color: var(--e-white);
		font-weight: 600;
		font-size: 14px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-4);
		padding: var(--space-5);
	}
	.card {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4);
		background: var(--e-white);
		font-size: 14px;
	}
	.card span {
		color: var(--e-muted);
	}
	@container (max-width: 480px) {
		.cards {
			grid-template-columns: 1fr;
			gap: var(--space-2);
			padding: var(--space-3);
		}
		.menu {
			display: block;
		}
		.who {
			font-size: 20px;
		}
		.hero {
			padding: var(--space-5) var(--space-4);
		}
	}
	@keyframes reflow {
		from {
			opacity: 0.2;
		}
	}
	@keyframes settle {
		from {
			opacity: 0.6;
		}
	}
</style>
