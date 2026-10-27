<!-- 1991: the first pages. Text and links, nothing else. Meant to look its age. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import type { FrameProps } from '../types.ts';
	let { brief }: FrameProps = $props();
</script>

<div class="page">
	<h1>{brief.title}</h1>
	<p>{t('era.for')} {brief.forWhom}</p>
	<ul>
		<li><span class="link">{brief.action}</span></li>
		<li><span class="link">{t('era.1991.about')}</span></li>
	</ul>
	<hr />
	<p class="small">{t('era.1991.footer')}</p>
</div>

<style>
	.page {
		--e-bg: #c6c6c6;
		--e-ink: #000000;
		--e-link: #0000ee;
		--e-font: 'Courier New', Courier, var(--font-mono);
		height: 100%;
		padding: var(--space-5) var(--space-6);
		background: var(--e-bg);
		color: var(--e-ink);
		font-family: var(--e-font);
		font-size: 15px;
		line-height: 1.35;
		overflow: hidden;
	}
	h1 {
		font: bold 26px/1.2 var(--e-font);
		color: var(--e-ink);
		margin: 0 0 var(--space-4);
		text-wrap: wrap;
	}
	p {
		margin: 0 0 var(--space-3);
		max-width: 60ch;
	}
	ul {
		padding-left: var(--space-5);
	}
	.link {
		color: var(--e-link);
		text-decoration: underline;
	}
	hr {
		border: 0;
		border-top: 1px solid var(--e-ink);
		margin: var(--space-5) 0 var(--space-3);
	}
	.small {
		font-size: 13px;
	}
</style>
