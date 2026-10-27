// A test-only route: it mounts one practice step for tests/e2e/practice.spec.ts.
// It exists in dev and in a build made with VITE_TEST_ROUTES=1 (the e2e build), and is a 404
// everywhere else, including the published site.
import { dev } from '$app/env';
import { error } from '@sveltejs/kit';

export const prerender = false;
export const ssr = false;

export function load() {
	if (!dev && !import.meta.env.VITE_TEST_ROUTES) error(404);
}
