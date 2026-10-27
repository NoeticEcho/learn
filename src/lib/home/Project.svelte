<!--
	Whose textbook this is, and why it exists (Martin, 27.10): one line under the home's scene and
	under the question screen's lede. Understanding is what lets a person direct the machine instead
	of believing in it; the line says that, and does not say AI makes learning pointless.
-->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
</script>

<p class="project">
	{t('project.label')} <a href="https://open.noeticecho.space/">NoeticEcho</a>. {t('project.text')}
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
