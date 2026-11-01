<!--
	Эхо's panel, on every page (docs/specs/2026-11-01-platform-design.md §5.3). A chunk of its own,
	loaded on the first click; the worker precaches it with the other build files. It reads where it
	is from SvelteKit's page state, and says that page's scripted line (pages.ts). On the catalog it
	helps choose a course (choose.ts). Model mode is the Guide's own form, there only when the person
	has set a key.

	Below 1100 px it sits in the page's flow under the header and pushes the page down; from 1100 px
	it is a panel over the corner. It never opens by itself, and Esc closes it.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getLocale, pick } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Guide from './Guide.svelte';
	import { script, DOCK_WORDS as W } from './pages.ts';
	import { ANSWERS } from './choose.ts';
	import type { ModelConfig } from './model.ts';
	import type { CatalogView, CourseRow } from '#lib/courses/types.ts';

	let { onclose }: { onclose: () => void } = $props();
	const lang = getLocale();
	const say = (s: { ru: string; en: string }) => pick(s, lang);

	const s = $derived(script(page.route.id, page.status, page.data, lang));
	const lines = $derived({ intro: s.line, hints: [s.line], mistakes: {}, outro: s.line });

	let model = $state<ModelConfig | null>(null);
	let loaded = $state(false);
	onMount(async () => {
		const { ownKey } = await import('#lib/learner.ts');
		model = await ownKey();
		loaded = true;
	});
	const context = () => ({ lesson: s.context.text, label: s.context.label });

	// On the catalog: what the person is after, and the courses that answer it.
	const rows = $derived<Map<string, CourseRow>>(new Map(((page.data.catalog as CatalogView | undefined)?.strands.flatMap((x) => x.courses) ?? []).map((c) => [c.id, c])));
	let chosen = $state<string | null>(null);
	const answer = $derived(ANSWERS.find((a) => a.id === chosen));
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<section id="echo-panel" class="dock" aria-label={say(W.title)} tabindex="-1" data-kind={s.kind} data-course={s.courseId}>
	<div class="inner">
		<header>
			<h2>{say(W.title)}</h2>
			<button type="button" class="quiet" onclick={onclose}>{say(W.close)}</button>
		</header>

		<Guide {lines} event={{ kind: 'enter' }} {model} {context} size={72} />

		{#if s.kind === 'catalog'}
			<div class="choose">
				<h3>{say(W.choose)}</h3>
				<ul class="answers">
					{#each ANSWERS as a (a.id)}
						<li>
							<button type="button" class="answer" aria-pressed={chosen === a.id} onclick={() => (chosen = a.id)}>{say(a.q)}</button>
						</li>
					{/each}
				</ul>
				{#if answer}
					<ul class="result" aria-live="polite">
						{#each answer.courses as id (id)}
							{@const c = rows.get(id)}
							{#if c}
								<li><a href={links.course(id)}>{c.title}</a> <span>{c.state === 'planned' ? say(W.soon) : say(W.open)}</span></li>
							{/if}
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

		{#if s.links.length}
			<ul class="links">
				{#each s.links as l (l.href)}
					<li><a href={l.href} data-sveltekit-reload={l.href.endsWith('.xml') ? '' : undefined}>{l.label}</a></li>
				{/each}
			</ul>
		{/if}

		{#if loaded && !model}<p class="nokey">{say(W.noKey)}{#if s.kind !== 'settings'}{' '}<a href={links.settings()}>{say(W.settings)}</a>{/if}</p>{/if}
	</div>
</section>

<style>
	.dock {
		background: var(--surface-body);
		border-bottom: var(--line) solid var(--border-rule);
		outline: none;
	}
	.inner {
		display: grid;
		gap: var(--space-4);
		width: 100%;
		max-width: 85rem;
		margin-inline: auto;
		padding: var(--space-4) clamp(var(--space-4), 4vw, var(--space-7));
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}
	h2 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		font-weight: 400;
	}
	h3 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		font-weight: 500;
		color: var(--text-primary);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.answers {
		display: grid;
		gap: var(--space-1);
	}
	.answer {
		display: block;
		width: 100%;
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		border: var(--line) solid var(--border-hairline);
		background: none;
		color: var(--text-body);
		font: inherit;
		font-size: var(--text-body-sm);
		text-align: left;
		cursor: pointer;
	}
	.answer:hover {
		border-color: var(--border-brass);
		color: var(--text-primary);
	}
	.answer[aria-pressed='true'] {
		border-color: var(--border-brass);
		color: var(--text-primary);
	}
	.result {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-3);
		font-size: var(--text-body-sm);
	}
	.result span {
		color: var(--text-secondary);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-5);
		font-size: var(--text-body-sm);
	}
	.links a {
		display: inline-flex;
		align-items: center;
		min-height: var(--hit-min);
	}
	.nokey {
		margin: 0;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		max-width: var(--measure);
	}
	@media (min-width: 1100px) {
		.dock {
			position: fixed;
			right: 52px;
			bottom: var(--space-6);
			z-index: 16;
			width: min(30rem, calc(100vw - 104px));
			max-height: calc(100dvh - 2 * var(--space-6));
			overflow-y: auto;
			border: var(--line) solid var(--border-rule);
			box-shadow: 0 8px 32px rgb(0 0 0 / 0.24);
		}
		:global(body:has([data-narration-player])) .dock {
			bottom: calc(10rem + var(--space-3));
			max-height: calc(100dvh - 10rem - 2 * var(--space-5));
		}
	}
</style>
