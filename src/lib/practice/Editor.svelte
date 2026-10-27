<!--
	A code editor. A plain textarea first, so the step is usable at once; CodeMirror replaces it
	when its chunk arrives (a dynamic import, never in the first route's bundle).
	Tab indents inside CodeMirror; Escape, then Tab, leaves it (CodeMirror's own convention).
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { EditorView } from '@codemirror/view';
	import type { Lang } from './codemirror.ts';

	type Props = { value: string; lang: Lang; label: string; readonly?: boolean; onchange?: (v: string) => void };
	let { value, lang, label, readonly = false, onchange }: Props = $props();

	let host: HTMLDivElement;
	let view: EditorView | undefined = $state();
	let mod: typeof import('./codemirror.ts') | undefined;
	// The text the editor holds; not reactive, so the effect below runs only on outside changes.
	const seen = { text: untrack(() => value) };

	onMount(() => {
		let gone = false;
		import('./codemirror.ts').then((m) => {
			if (gone) return;
			mod = m;
			view = m.createEditor({
				parent: host,
				doc: seen.text,
				lang,
				label,
				readonly,
				onchange: (v) => {
					seen.text = v;
					onchange?.(v);
				}
			});
		});
		return () => {
			gone = true;
			view?.destroy();
		};
	});

	// A new value from outside (reset, a restored file) replaces the text.
	$effect(() => {
		if (value !== seen.text) {
			seen.text = value;
			if (view && mod) mod.replace(view, value);
		}
	});
</script>

<div class="editor" bind:this={host}>
	{#if !view}
		<textarea
			aria-label={label}
			spellcheck="false"
			{readonly}
			{value}
			oninput={(e) => {
				seen.text = e.currentTarget.value;
				onchange?.(seen.text);
			}}
		></textarea>
	{/if}
</div>

<style>
	.editor {
		height: 100%;
		min-height: 16rem;
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-inset);
		overflow: auto;
	}
	.editor :global(.cm-editor) {
		height: 100%;
		min-height: 16rem;
	}
	textarea {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 16rem;
		border: 0;
		resize: vertical;
		padding: var(--space-3) var(--space-4);
		background: transparent;
		font-family: var(--font-mono);
		font-size: var(--text-body-sm);
		line-height: 1.6;
	}
</style>
