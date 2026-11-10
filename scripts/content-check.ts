// npm run content:check: validates every lesson and the curriculum, in both editions, and prints
// every problem with its file. Non-zero on any problem. The English edition is checked against
// the Russian one (src/lib/content/load.ts validateEdition): same ids, step ids, check ids, card
// ids and concepts, an English title for every part and concept, an English definition. Then the
// catalog, and the other courses' lessons against it and against each other
// (src/lib/courses/lessons.ts): every open lesson in both editions, the same cards, sections and
// diagrams in each, no body for a planned lesson.
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
		const courses = (await load('/src/lib/courses/load.ts')) as unknown as { loadCourses: () => { courses: unknown[] } };
		console.log(`catalog: ${courses.loadCourses().courses.length} course(s), no problems`);
		const other = (await load('/src/lib/courses/lessons.ts')) as unknown as { loadCourseLessons: () => { id: string }[] };
		const open = other.loadCourseLessons();
		console.log(`other courses: ${open.length} open lesson(s) in both editions${open.length ? ` (${open.map((l) => l.id).join(', ')})` : ''}, no problems`);
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
