// npm run content:check: validates every lesson and the curriculum, in both editions, and prints
// every problem with its file. Non-zero on any problem. The English edition is checked against
// the Russian one (src/lib/content/load.ts validateEdition): same ids, step ids, check ids, card
// ids and concepts, an English title for every part and concept, an English definition.
import { withApp } from './vite-load.ts';

type Mod = {
	loadContent: () => { lessons: { id: string }[]; curriculum: { parts: unknown[] } };
	loadEdition: (lang: 'en') => { lessons: { id: string }[]; missing: string[] };
};

const code = await withApp(async (load) => {
	const mod = (await load('/src/lib/content/load.ts')) as unknown as Mod;
	let problems: string[] = [];
	try {
		const { lessons, curriculum } = mod.loadContent();
		console.log(`content (ru): ${lessons.length} lesson(s) in ${curriculum.parts.length} part(s), no problems`);
		const en = mod.loadEdition('en');
		console.log(`content (en): ${en.lessons.length} lesson(s) translated, ${en.missing.length} not yet, no problems`);
		return 0;
	} catch (e) {
		problems = (e as { problems?: string[] }).problems ?? [];
		if (problems.length) for (const p of problems) console.error(`  ${p}`);
		else console.error(e);
		console.error(`content: ${problems.length || 1} problem(s)`);
		return 1;
	}
});
process.exit(code);
