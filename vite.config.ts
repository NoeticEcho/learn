import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { mdsvex } from 'mdsvex';

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
			prerender: { handleHttpError: 'fail' }
		})
	],
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'node',
		passWithNoTests: true
	}
});
