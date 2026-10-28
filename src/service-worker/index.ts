/**
 * Offline (spec §4.8). On install, the shell: the build's immutable files, the static files and
 * every prerendered page that is not a lesson (the home's hashed lesson list among them). A lesson is cached when the person opens it, and
 * «Скачать курс целиком» (a `cache-all` message) caches every prerendered page of the edition the
 * person is reading (`lang`: the English edition's pages are under `en/`), so a Russian reader does
 * not download the English edition's pages, nor the other way round.
 *
 * Same-origin GETs only: the model APIs and the video hosts are never touched, and nothing is
 * cached from them. Immutable files are cache-first; pages and their data are network-first,
 * falling back to the cache, so a new release reaches the person as soon as they are online.
 * The cache carries the build's version, and activate deletes every other one.
 *
 * Every lookup ignores `Vary`. A host that answers `Vary: Origin` (vite preview does, and a
 * mirror may) made each cached module a miss, because a page's module request carries headers
 * the worker's own `addAll` did not: offline, every lesson opened on «Что-то сломалось». The
 * immutable files are named by their hash and the pages are the same for every visitor, so
 * nothing here varies by request header.
 */
import { self } from '$app/service-worker';
import { immutable, assets, prerendered } from '$app/manifest';
// `$app/env`'s version is not set inside a worker, so the cache is named after the build itself:
// a hash of its immutable file names, which change whenever any of the code does.
let h = 2166136261;
for (const f of immutable) for (const ch of f.path) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
const CACHE = `learn-${(h >>> 0).toString(36)}`;
const scope = () => self.registration.scope;
const url = (path: string) => new URL(path.replace(/^\//, ''), scope()).href;

const isLesson = (p: string) => /(^|\/)lesson\//.test(p);
// What the build writes for crawlers, answer engines and link previews, never for the reader:
// the Open Graph cards (a hundred-odd PNGs), the sitemap, robots.txt and llms(-full).txt.
const forMachines = (p: string) => /(^|\/)(og\/|sitemap\.xml$|robots\.txt$|llms(-full)?\.txt$)/.test(p);
const pages = () => prerendered.filter((p) => !forMachines(p.path));
// A prerendered path is relative to the base: `/en/map/` is the English edition's.
const english = (p: string) => /^\/?en(\/|$)/.test(p);
const inEdition = (p: string, lang: string) => (lang === 'en' ? english(p) : !english(p));
const shell = () => [
	...immutable.map((f) => url(f.path)),
	...assets.map((f) => url(f.path)),
	...pages()
		.filter((p) => !isLesson(p.path))
		.map((p) => url(p.path))
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

	// The home's lesson list is named by its content's hash too (catalogue.server.ts homeIndex).
	const immutableFile = u.pathname.includes('/_app/immutable/') || /\/data\/home-[0-9a-f]{12}\.json$/.test(u.pathname);
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			if (immutableFile) {
				const hit = await cache.match(req, { ignoreVary: true });
				if (hit) return hit;
			}
			try {
				const res = await fetch(req);
				if (res.ok && res.type === 'basic') cache.put(req, res.clone());
				return res;
			} catch (e) {
				const hit = (await cache.match(req, { ignoreVary: true })) ?? (await cache.match(req, { ignoreSearch: true, ignoreVary: true }));
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
			const lang = event.data?.lang === 'en' ? 'en' : 'ru';
			const all = [...shell(), ...pages().filter((p) => inEdition(p.path, lang)).map((p) => url(p.path))];
			const todo = [...new Set(all)];
			let done = 0;
			let failed = 0;
			for (const href of todo) {
				if (!(await cache.match(href))) {
					try {
						const res = await fetch(href);
						if (res.ok) await cache.put(href, res);
						else failed++;
					} catch {
						failed++; // offline already: keep what we have, and say so
					}
				}
				done++;
				if (done % 5 === 0 || done === todo.length) source?.postMessage({ type: 'cache-progress', done, total: todo.length });
			}
			source?.postMessage({ type: 'cache-done', total: todo.length, failed });
		})()
	);
});
