import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'VITE_TEST_ROUTES=1 npm run build && npx vite preview --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 240_000
	},
	use: { baseURL: 'http://localhost:4173/learn/' },
	testDir: 'tests/e2e'
});
