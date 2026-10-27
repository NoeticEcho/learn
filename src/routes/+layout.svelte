<script lang="ts">
	import '../app.css';
	import favicon from '../../design/mascot/echo-mark.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
</svelte:head>

{@render children()}
