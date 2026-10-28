// npm run narration -- <command>: the app's side of narration (docs/narration.md).
//
//   script [--parts 0,1] [--out .cache/narration/ru.scripts.json]
//       writes every lesson's narration script with each section's hash: what the renderer
//       (tools/narration/render.py) reads. Prints the Latin words left after the maps, most
//       frequent first: the candidates for content/narration/ru.yaml.
//   wer --transcripts private/narration/transcripts.ru.json [--max 0.05] [--parts 0,1]
//       scores what Whisper heard (tools/narration/transcribe.py) against each section's script
//       and lists the sections above --max with their errors: the candidates for a map entry.
//   status
//       per lesson: narrated, stale (some section's text changed since it was rendered) or none.
//
// Russian only: the English edition has no voice yet.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { withApp } from './vite-load.ts';

type Section = { key: string; heading: string; sentences: string[]; hash: string };
type Lesson = { id: string; part: number; title: string; summary: string; definition: string; say?: Record<string, string> };
type Mod = {
	script: (l: Lesson, lang: 'ru') => Section[] | null;
	narration: (l: Lesson, lang: 'ru') => unknown;
	spoken: (text: string, l: Lesson, lang: 'ru') => string;
	manifest: (lang: 'ru') => { lessons: Record<string, { sections: { hash: string }[] }> } | null;
	VOICE: Record<string, string>;
	SCRIPT_VERSION: number;
};

const args = process.argv.slice(2);
const cmd = args[0] ?? 'script';
const opt = (name: string) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
};

const code = await withApp(async (load) => {
	const { loadContent } = (await load('/src/lib/content/load.ts')) as { loadContent: () => { lessons: Lesson[] } };
	const n = (await load('/src/lib/narration/narration.server.ts')) as unknown as Mod;
	const parts = opt('parts')?.split(',').map(Number);
	const lessons = loadContent()
		.lessons.filter((l) => !parts || parts.includes(l.part))
		.sort((a, b) => a.id.localeCompare(b.id));

	if (cmd === 'script') {
		const out = opt('out') ?? '.cache/narration/ru.scripts.json';
		const latin = new Map<string, number>();
		let chars = 0;
		let sections = 0;
		const data = lessons.map((l) => {
			const s = n.script(l, 'ru')!;
			for (const sec of s)
				for (const t of sec.sentences) {
					chars += t.length;
					for (const w of t.match(/[A-Za-z][A-Za-z0-9'’.-]*/g) ?? []) latin.set(w, (latin.get(w) ?? 0) + 1);
				}
			sections += s.length;
			return { id: l.id, part: l.part, sections: s };
		});
		mkdirSync(dirname(out), { recursive: true });
		writeFileSync(out, JSON.stringify({ version: n.SCRIPT_VERSION, voice: n.VOICE, lang: 'ru', lessons: data }, null, '\t') + '\n');
		console.log(`narration: ${data.length} lesson(s), ${sections} section(s), ${chars} characters (~${Math.round(chars / 14 / 60)} min of speech) → ${out}`);
		const top = [...latin].sort((a, b) => b[1] - a[1]);
		console.log(`latin words left after the maps: ${top.length} distinct`);
		if (args.includes('--latin')) for (const [w, c] of top) console.log(`${String(c).padStart(5)}  ${w}`);
		else console.log(top.slice(0, 40).map(([w, c]) => `${w}×${c}`).join('  '));
		return 0;
	}
	if (cmd === 'wer') {
		const w = (await load('/src/lib/narration/wer.ts')) as typeof import('../src/lib/narration/wer.ts');
		const heard = JSON.parse(readFileSync(opt('transcripts') ?? 'private/narration/transcripts.ru.json', 'utf8')) as Record<string, Record<string, { hash: string; text: string }>>;
		const max = Number(opt('max') ?? 0.05);
		let refWords = 0;
		let errs = 0;
		let scored = 0;
		const flagged: string[] = [];
		const rows: Record<string, Record<string, number>> = {};
		for (const l of lessons) {
			for (const s of n.script(l, 'ru') ?? []) {
				const h = heard[l.id]?.[s.key];
				if (!h || h.hash !== s.hash) continue;
				const ref = w.words(s.sentences.join(' '));
				// Whisper spells an acronym it heard letter by letter as «H T T P S»: one word again
				const said = h.text.replace(/(?<![\p{L}])\p{Lu}(?:[ .]\p{Lu}(?![\p{L}]))+/gu, (m: string) => m.replace(/[ .]/g, ''));
				const { errors, ops } = w.align(ref, w.words(n.spoken(said, l, 'ru')));
				refWords += ref.length;
				errs += errors;
				scored++;
				const rate = errors / Math.max(1, ref.length);
				(rows[l.id] ??= {})[s.key] = Math.round(rate * 1000) / 1000;
				if (rate > max) flagged.push(`${l.id}#${s.key} ${(rate * 100).toFixed(1)}%  ${w.errors(ops).join(' | ')}`);
			}
		}
		for (const f of flagged) console.log(f);
		const out = opt('out');
		if (out) writeFileSync(out, JSON.stringify({ max, sections: scored, words: refWords, errors: errs, wer: errs / Math.max(1, refWords), lessons: rows }, null, '\t') + '\n');
		console.log(`wer: ${scored} section(s), ${refWords} words, ${errs} errors, overall ${((errs / Math.max(1, refWords)) * 100).toFixed(2)}%; ${flagged.length} above ${(max * 100).toFixed(0)}%`);
		return 0;
	}
	if (cmd === 'status') {
		const m = n.manifest('ru');
		let narrated = 0;
		let stale = 0;
		for (const l of lessons) {
			const has = m?.lessons[l.id];
			if (!has) continue;
			if (n.narration(l, 'ru')) narrated++;
			else {
				stale++;
				console.log(`stale: ${l.id}`);
			}
		}
		console.log(`narration (ru): ${narrated} narrated, ${stale} stale, ${lessons.length - narrated - stale} not rendered, of ${lessons.length}`);
		return 0;
	}
	console.error(`narration: unknown command ${cmd}`);
	return 2;
});
process.exit(code);
