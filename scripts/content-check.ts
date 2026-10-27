// npm run content:check: validates every lesson and the curriculum, and prints every problem
// with its file. Non-zero on any problem.
import { withApp } from './vite-load.ts';

const code = await withApp(async (load) => {
	const mod = (await load('/src/lib/content/load.ts')) as { loadContent: () => { lessons: { id: string }[]; curriculum: { parts: unknown[] } } };
	try {
		const { lessons, curriculum } = mod.loadContent();
		console.log(`content: ${lessons.length} lesson(s) in ${curriculum.parts.length} part(s), no problems`);
		return 0;
	} catch (e) {
		const problems = (e as { problems?: string[] }).problems;
		if (problems) for (const p of problems) console.error(`  ${p}`);
		else console.error(e);
		console.error(`content: ${problems?.length ?? 1} problem(s)`);
		return 1;
	}
});
process.exit(code);
