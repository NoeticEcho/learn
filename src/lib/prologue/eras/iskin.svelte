<!-- The last frame: Искин, through Эхо, asks the interview's next question. Calm, nothing moves but Эхо. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import Echo from '#lib/guide/Echo.svelte';
	import type { FrameProps } from '../types.ts';
	let { brief }: FrameProps = $props();
</script>

<div class="iskin">
	<Echo mood="explain" era={8} size={132} />
	<div class="talk">
		<p class="intro">{t('era.iskin.intro')}</p>
		<p class="question">{t('era.iskin.question', { action: brief.action })}</p>
		<p class="about">{t('era.iskin.about', { title: brief.title })}</p>
	</div>
</div>

<style>
	.iskin {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-6);
		padding: var(--space-7);
		background: var(--surface-canvas);
		color: var(--text-body);
	}
	.talk {
		max-width: 40ch;
	}
	.intro {
		margin: 0 0 var(--space-3);
		color: var(--text-secondary);
	}
	.question {
		margin: 0 0 var(--space-4);
		font-family: var(--font-serif);
		font-size: var(--text-display-sm);
		line-height: 1.15;
		color: var(--text-primary);
		overflow-wrap: break-word;
	}
	.about {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	@container prologue (max-width: 640px) {
		.iskin {
			flex-direction: column;
			align-items: flex-start;
			padding: var(--space-5);
			gap: var(--space-4);
		}
		.question {
			font-size: var(--text-body-lg);
		}
	}
</style>
