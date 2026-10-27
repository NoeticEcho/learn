import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { mdsvex } from 'mdsvex';
import { svelteTesting } from '@testing-library/svelte/vite';

// SvelteKit 3 takes its configuration here, in the Vite plugin; there is no svelte.config.js.
export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			extensions: ['.svelte', '.svx'],
			preprocess: [mdsvex({ extensions: ['.svx'] })],
			adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', strict: true }),
			paths: { base: (process.env.BASE_PATH ?? '/learn') as '' | `/${string}` },
			prerender: { handleHttpError: 'fail' },
			// The CSS goes into the page: one round trip less before first paint on a slow phone.
			inlineStyleThreshold: 100_000
		}),
		svelteTesting()
	],
	build: {
		// A font is always a file of its own, never a data: URI inside the CSS: the CSS is inlined
		// into every page, so an inlined face would be paid for on every page instead of cached
		// once, and the CSP allows fonts from 'self' only (docs/design-notes.md, Fonts).
		assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined)
	},
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'node',
		passWithNoTests: true,
		// Off: the cache keys a module by its own source, but an import.meta.glob's result depends
		// on which files exist, so a new lesson was invisible to tests until the cache was cleared.
		fsModuleCache: false
	}
});
