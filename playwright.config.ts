import { defineConfig } from '@playwright/test';

// Port 4173 is vite preview's default, so authors' own previews sit there, and a run that reused
// whatever answered on it tested someone else's build. The e2e server has a port of its own, and
// an existing server is reused only when asked (E2E_REUSE=1); otherwise a busy port fails the run.
const port = Number(process.env.E2E_PORT ?? 4185);

export default defineConfig({
	webServer: {
		command: `VITE_TEST_ROUTES=1 npm run build && npx vite preview --port ${port} --strictPort`,
		port,
		reuseExistingServer: process.env.E2E_REUSE === '1',
		timeout: 240_000
	},
	use: { baseURL: `http://localhost:${port}/learn/`, trace: 'retain-on-failure' },
	testDir: 'tests/e2e'
});
