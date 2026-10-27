<!-- 2000: the Flash-style splash, with a loader and «Skip intro». Meant to look its age. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { FrameProps } from '../types.ts';
	let { brief, still = false }: FrameProps = $props();
</script>

<div class="page" class:still>
	<p class="loading">{t('era.2000.loading')}</p>
	<h1>{brief.title}</h1>
	<p class="for">{brief.forWhom}</p>
	<span class="enter">{t('era.2000.enter')}: {brief.action}</span>
	<span class="skip">{t('era.2000.skip')}</span>
</div>

<style>
	.page {
		--e-bg: #050505;
		--e-glow: #39ff88;
		--e-ink: #e8ffe8;
		--e-dim: #7fa58a;
		--e-halo: #10301e;
		--e-font: Verdana, Tahoma, var(--font-sans);
		position: relative;
		height: 100%;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--space-3);
		padding: var(--space-6);
		background: radial-gradient(circle at 50% 45%, var(--e-halo) 0%, var(--e-bg) 62%);
		color: var(--e-ink);
		font-family: var(--e-font);
		text-align: center;
		overflow: hidden;
	}
	.loading {
		position: absolute;
		top: var(--space-4);
		left: var(--space-4);
		margin: 0;
		font-size: 11px;
		color: var(--e-dim);
	}
	h1 {
		font: bold 34px/1.1 var(--e-font);
		color: var(--e-ink);
		text-shadow: 0 0 12px var(--e-glow);
		animation: zoom 2.4s cubic-bezier(0.2, 0.9, 0.2, 1) both;
		text-wrap: balance;
		margin: 0;
	}
	.for {
		margin: 0;
		max-width: 46ch;
		font-size: 14px;
		animation: fade 1.2s 1.4s both;
	}
	.for {
		color: var(--e-dim);
	}
	.enter {
		margin-top: var(--space-4);
		padding: var(--space-2) var(--space-5);
		border: 1px solid var(--e-glow);
		color: var(--e-glow);
		font-size: 13px;
		animation: fade 1s 2.4s both;
	}
	.skip {
		position: absolute;
		right: var(--space-4);
		bottom: var(--space-3);
		font-size: 11px;
		color: var(--e-dim);
		text-decoration: underline;
	}
	.still h1,
	.still .for,
	.still .enter {
		animation: none;
	}
	@keyframes zoom {
		from {
			opacity: 0;
			transform: scale(2.4) rotate(-4deg);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		h1,
		.for,
		.enter {
			animation: none;
		}
	}
</style>
