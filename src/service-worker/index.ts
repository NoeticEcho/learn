/**
 * Offline (spec §4.8). On install, the shell: the build's immutable files, the static files and
 * every prerendered page that is not a lesson. A lesson is cached when the person opens it, and
 * «Скачать курс целиком» (a `cache-all` message) caches every prerendered page.
 *
 * Same-origin GETs only: the model APIs and the video hosts are never touched, and nothing is
 * cached from them. Immutable files are cache-first; pages and their data are network-first,
 * falling back to the cache, so a new release reaches the person as soon as they are online.
 * The cache carries the build's version, and activate deletes every other one.
 */
import { self } from '$app/service-worker';
import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';

const CACHE = `learn-${version}`;
const scope = () => self.registration.scope;
const url = (path: string) => new URL(path.replace(/^\//, ''), scope()).href;

const isLesson = (p: string) => /(^|\/)lesson\//.test(p);
const shell = () => [
	...immutable.map((f) => url(f.path)),
	...assets.map((f) => url(f.path)),
	...prerendered.filter((p) => !isLesson(p.path)).map((p) => url(p.path))
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((c) => c.addAll(shell()))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k.startsWith('learn-') && k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	const u = new URL(req.url);
	if (u.origin !== self.location.origin || !req.url.startsWith(scope())) return;

	const immutableFile = u.pathname.includes('/_app/immutable/');
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			if (immutableFile) {
				const hit = await cache.match(req);
				if (hit) return hit;
			}
			try {
				const res = await fetch(req);
				if (res.ok && res.type === 'basic') cache.put(req, res.clone());
				return res;
			} catch (e) {
				const hit = (await cache.match(req)) ?? (await cache.match(req, { ignoreSearch: true }));
				if (hit) return hit;
				if (req.mode === 'navigate') {
					const fallback = await cache.match(url('404.html'));
					if (fallback) return fallback;
				}
				throw e;
			}
		})()
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type !== 'cache-all') return;
	const source = event.source as Client | null;
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			const all = [...shell(), ...prerendered.map((p) => url(p.path))];
			const todo = [...new Set(all)];
			let done = 0;
			for (const href of todo) {
				if (!(await cache.match(href))) {
					try {
						const res = await fetch(href);
						if (res.ok) await cache.put(href, res);
					} catch {
						/* offline already: keep what we have */
					}
				}
				done++;
				if (done % 5 === 0 || done === todo.length) source?.postMessage({ type: 'cache-progress', done, total: todo.length });
			}
			source?.postMessage({ type: 'cache-done', total: todo.length });
		})()
	);
});
