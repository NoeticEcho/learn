// Loads a module of the app the way the build does (Vite's SSR loader, with mdsvex and the
// #lib imports), so the CLIs validate exactly what the build would.
import { createServer } from 'vite';

export async function withApp<T>(fn: (load: (id: string) => Promise<Record<string, unknown>>) => Promise<T>): Promise<T> {
	const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
	try {
		return await fn((id) => server.ssrLoadModule(id));
	} finally {
		await server.close();
	}
}
