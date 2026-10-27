<!--
	Эхо, the course's guide: design/mascot/echo.svg, inlined so its classes can be driven
	(design/mascot/README.md is the contract): `mood-<mood>`, `era-<n>`, and `compact` with the
	viewBox 36 24 88 108 under 64 px. Its ids are prefixed per instance, so two on a page do not
	share a gradient. Its words are never in the SVG: the speech bubble beside it is the live region.
-->
<script lang="ts">
	import raw from '../../../design/mascot/echo.svg?raw';

	export type Mood = 'idle' | 'explain' | 'hint' | 'cheer' | 'hmm';
	type Props = { mood?: Mood; era?: number | null; size?: number };
	let { mood = 'idle', era = null, size = 160 }: Props = $props();

	const uid = $props.id();
	const compact = $derived(size < 64);
	const svg = $derived.by(() => {
		const cls = ['echo', `mood-${mood}`, era ? `era-${era}` : '', compact ? 'compact' : ''].filter(Boolean).join(' ');
		const box = compact ? '36 24 88 108' : '0 0 160 160';
		return raw
			.replace(/<svg [^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" class="${cls}" role="img" aria-labelledby="${uid}-title" width="100%" height="100%">`)
			.replaceAll('echo-title', `${uid}-title`)
			.replaceAll('echo-glow', `${uid}-glow`);
	});
</script>

<span class="echo-host" style:width="{size}px" style:height="{compact ? Math.round((size * 108) / 88) : size}px">{@html svg}</span>

<style>
	.echo-host {
		display: inline-block;
		flex: none;
		line-height: 0;
	}
</style>
