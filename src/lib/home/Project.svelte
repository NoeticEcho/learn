<!--
	Whose this is, and why it exists (Martin, 27.10): one line on the catalog's foot, under the web
	course's scene and under the prologue's lede. Understanding is what lets a person direct the machine instead
	of believing in it; the line says that, and does not say AI makes learning pointless.
-->
<script lang="ts">
	import { t, type Key } from '#lib/i18n/index.ts';
	// The platform's line by default; the web course and its prologue keep the textbook's own.
	let { text = 'project.text' }: { text?: Key } = $props();
</script>

<p class="project">
	{t('project.label')} <a href="https://open.noeticecho.space/">NoeticEcho</a>. {t(text)}
</p>

<style>
	.project {
		margin: 0;
		max-width: 44ch;
		font-size: var(--text-body-sm);
		line-height: var(--lh-body);
		color: var(--text-secondary);
	}
	a {
		color: var(--text-primary);
	}
</style>
