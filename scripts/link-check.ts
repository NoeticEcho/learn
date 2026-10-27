// npm run links:check: every source and video URL in the content answers. A YouTube video is
// alive when its oEmbed answers 200 (the watch page answers 200 even for a deleted video).
// Results are cached in .cache/links.json for 24 hours. Non-zero on any dead link.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { withApp } from './vite-load.ts';

type Source = { title: string; url: string; kind: string };
type Lesson = { id: string; sources: Source[]; videos: Source[] };

const CACHE = '.cache/links.json';
const DAY = 24 * 60 * 60 * 1000;
const UA = 'Mozilla/5.0 (compatible; skvoz-vremya-link-check; +https://github.com/NoeticEcho/learn)';

let cache: Record<string, { at: number; ok: boolean; status: number }> = {};
try {
	cache = JSON.parse(readFileSync(CACHE, 'utf8'));
} catch {
	/* no cache yet */
}

const youtubeId = (u: URL) => (u.hostname.endsWith('youtube.com') ? u.searchParams.get('v') : u.hostname === 'youtu.be' ? u.pathname.slice(1) : null);

async function probe(url: string): Promise<{ ok: boolean; status: number }> {
	const u = new URL(url);
	const id = youtubeId(u);
	const target = id ? `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json` : url;
	const go = (method: string) => fetch(target, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20_000) });
	// A HEAD some servers drop or refuse is asked again as a GET.
	const get = () => go('GET').then((r) => ({ ok: r.ok, status: r.status }), () => ({ ok: false, status: 0 }));
	if (id) return get();
	try {
		const res = await go('HEAD');
		if (res.status === 405 || res.status === 403 || res.status === 404 || res.status >= 500) return get();
		return { ok: res.ok, status: res.status };
	} catch {
		return get();
	}
}

const lessons = await withApp(async (load) => {
	const mod = (await load('/src/lib/content/load.ts')) as { loadContent: () => { lessons: Lesson[] } };
	return mod.loadContent().lessons;
});

const urls = new Map<string, string[]>();
for (const l of lessons) for (const s of [...l.sources, ...l.videos]) urls.set(s.url, [...(urls.get(s.url) ?? []), l.id]);

// A few at a time. All ~560 at once from one runner came back as «no answer» for half of them
// (296 on 27.10, Wikipedia and postgresql.org among them): the probe, not the links, was failing.
// A link that does not answer is asked once more, after the rest.
const POOL = 12;
let dead = 0;
const now = Date.now();
const queue = [...urls.keys()];
async function check(url: string) {
	let r = cache[url];
	if (!r || now - r.at > DAY || !r.ok) {
		let p = await probe(url);
		if (p.status === 0) p = await probe(url);
		r = { at: now, ...p };
		cache[url] = r;
	}
	if (!r.ok) {
		dead++;
		console.error(`dead (${r.status || 'no answer'}): ${url}\n  in ${urls.get(url)!.join(', ')}`);
	}
}
await Promise.all(
	Array.from({ length: POOL }, async () => {
		for (let url = queue.shift(); url; url = queue.shift()) await check(url);
	})
);

mkdirSync('.cache', { recursive: true });
writeFileSync(CACHE, JSON.stringify(cache, null, 1));
console.log(`links: ${urls.size} checked, ${dead} dead`);
process.exit(dead ? 1 : 0);
