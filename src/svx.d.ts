// A lesson body: mdsvex compiles .svx to a Svelte component; its <script module> exports metadata.
declare module '*.svx' {
	import type { Component } from 'svelte';
	export const metadata: unknown;
	const component: Component;
	export default component;
}
