<!-- 1996: tables, a tiled background, a visitor counter and a crawling line. Meant to look its age. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { FrameProps } from '../types.ts';
	let { brief, still = false }: FrameProps = $props();
</script>

<div class="page">
	<table class="layout" role="presentation">
		<tbody>
			<tr>
				<td class="side">
					<p class="nav">{t('era.1996.home')}</p>
					<p class="nav">{t('era.1996.about')}</p>
					<p class="nav">{t('era.1996.guestbook')}</p>
					<p class="counter">{t('era.1996.counter')}<br /><span class="digits">000001</span></p>
				</td>
				<td class="main">
					<h1>{brief.title}</h1>
					<div class="crawl" class:still><span>{brief.action}!!! &nbsp; {brief.action}!!!</span></div>
					<p><b>{t('era.for')}</b> {brief.forWhom}</p>
					<p class="construction"><span>{t('era.1996.construction')}</span></p>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.page {
		--e-tile-a: #1a2a6c;
		--e-tile-b: #22357f;
		--e-panel: #fffbd0;
		--e-ink: #111111;
		--e-red: #cc0000;
		--e-link: #0000ee;
		--e-yellow: #ffee00;
		--e-font: 'Times New Roman', Times, var(--font-serif);
		--e-fun: 'Comic Sans MS', 'Comic Neue', var(--e-font);
		height: 100%;
		padding: var(--space-4);
		background: repeating-conic-gradient(var(--e-tile-a) 0 25%, var(--e-tile-b) 0 50%) 0 0 / 24px 24px;
		font-family: var(--e-font);
		color: var(--e-ink);
		overflow: hidden;
	}
	.layout {
		width: 100%;
		height: 100%;
		border: 3px outset var(--e-panel);
		background: var(--e-panel);
		border-collapse: separate;
	}
	td {
		vertical-align: top;
		padding: var(--space-3);
	}
	.side {
		width: 28%;
		border-right: 2px ridge var(--e-panel);
	}
	.nav {
		color: var(--e-link);
		text-decoration: underline;
		margin: 0 0 var(--space-2);
		font-size: 15px;
	}
	.counter {
		margin-top: var(--space-5);
		font-size: 12px;
	}
	.digits {
		display: inline-block;
		margin-top: var(--space-1);
		padding: 0 var(--space-1);
		background: var(--e-ink);
		color: var(--e-yellow);
		font-family: var(--font-mono);
		letter-spacing: 0.1em;
	}
	h1 {
		font: bold 28px/1.15 var(--e-fun);
		color: var(--e-red);
		margin: 0 0 var(--space-3);
		text-wrap: wrap;
	}
	.crawl {
		overflow: hidden;
		white-space: nowrap;
		background: var(--e-yellow);
		color: var(--e-red);
		font-weight: bold;
		margin-bottom: var(--space-3);
	}
	.crawl span {
		display: inline-block;
		padding-left: 100%;
		animation: crawl 9s linear infinite;
	}
	.crawl.still span {
		padding-left: 0;
		animation: none;
	}
	p {
		margin: 0 0 var(--space-2);
		font-size: 16px;
	}
	.construction {
		margin-top: var(--space-4);
		padding: var(--space-1) var(--space-2);
		background: repeating-linear-gradient(-45deg, var(--e-yellow) 0 10px, var(--e-ink) 10px 20px);
		font-weight: bold;
	}
	.construction span {
		padding: 0 var(--space-2);
		background: var(--e-ink);
		color: var(--e-yellow);
	}
	@keyframes crawl {
		to {
			transform: translateX(-100%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.crawl span {
			animation: none;
			padding-left: 0;
		}
	}
</style>
