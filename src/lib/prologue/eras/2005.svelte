<!-- 2005: «web 2.0». Gloss, gradients, rounded tabs, a beta badge, a reflection. Meant to look its age. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { FrameProps } from '../types.ts';
	let { brief }: FrameProps = $props();
</script>

<div class="page">
	<header>
		<span class="logo">{brief.title}</span><span class="beta">beta</span>
		<nav aria-hidden="true">
			<span class="tab on">{t('era.2005.home')}</span>
			<span class="tab">{t('era.2005.about')}</span>
			<span class="tab">{t('era.2005.contact')}</span>
		</nav>
	</header>
	<main>
		<p class="who">{brief.forWhom}</p>
		<p class="for">{t('era.2005.welcome')}</p>
		<span class="button">{brief.action}</span>
		<span class="button reflection" aria-hidden="true">{brief.action}</span>
	</main>
</div>

<style>
	.page {
		--e-sky-1: #eaf6ff;
		--e-sky-2: #ffffff;
		--e-head-1: #8fd3ff;
		--e-head-2: #2a8fd6;
		--e-head-3: #1c6fb0;
		--e-ink: #23303b;
		--e-tab: #d9eefc;
		--e-orange-1: #ffb347;
		--e-orange-2: #ff7b00;
		--e-white: #ffffff;
		--e-beta: #ff3d7f;
		--e-orange-3: #f06c00;
		--e-shine: rgba(255, 255, 255, 0.6);
		--e-shade: rgba(0, 0, 0, 0.25);
		--e-halo: rgba(255, 123, 0, 0.35);
		--e-mask: #000000;
		--e-font: 'Trebuchet MS', 'Lucida Grande', var(--font-sans);
		height: 100%;
		background: linear-gradient(var(--e-sky-1), var(--e-sky-2) 60%);
		color: var(--e-ink);
		font-family: var(--e-font);
		overflow: hidden;
	}
	header {
		position: relative;
		padding: var(--space-4) var(--space-5) 0;
		background: linear-gradient(var(--e-head-1), var(--e-head-2) 50%, var(--e-head-3) 51%, var(--e-head-2));
		box-shadow: inset 0 1px 0 var(--e-shine);
	}
	.logo {
		font: bold 28px/1.1 var(--e-font);
		color: var(--e-white);
		text-shadow: 0 2px 2px var(--e-shade);
		letter-spacing: -0.02em;
	}
	.beta {
		margin-left: var(--space-2);
		padding: 1px var(--space-2);
		border-radius: 8px;
		background: var(--e-beta);
		color: var(--e-white);
		font-size: 11px;
		vertical-align: super;
	}
	nav {
		display: flex;
		gap: var(--space-1);
		margin-top: var(--space-4);
	}
	.tab {
		padding: var(--space-2) var(--space-4);
		border-radius: 10px 10px 0 0;
		background: linear-gradient(var(--e-white), var(--e-tab));
		font-size: 13px;
	}
	.tab.on {
		background: var(--e-sky-1);
		font-weight: bold;
	}
	main {
		padding: var(--space-5);
		text-align: center;
	}
	.who {
		font-size: 20px;
		margin: 0 0 var(--space-2);
	}
	.for {
		font-size: 14px;
		margin: 0 0 var(--space-5);
	}
	.button {
		display: inline-block;
		padding: var(--space-3) var(--space-6);
		border-radius: 22px;
		background: linear-gradient(var(--e-orange-1), var(--e-orange-2) 50%, var(--e-orange-3) 51%, var(--e-orange-1));
		color: var(--e-white);
		font-size: 17px;
		font-weight: bold;
		text-shadow: 0 1px 1px var(--e-shade);
		box-shadow: 0 4px 10px var(--e-halo);
	}
	.reflection {
		display: block;
		width: max-content;
		margin: 2px auto 0;
		transform: scaleY(-1);
		opacity: 0.18;
		mask-image: linear-gradient(transparent 40%, var(--e-mask));
		box-shadow: none;
	}
</style>
