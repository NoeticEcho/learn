// The practice steps in curriculum order, so the gallery can tell which step is each era's site.
// Steps are the same in both editions (content:check holds them so); the titles are the edition's.
import { loadContent, loadEdition } from '#lib/content/load.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

// And each era's first practice lesson, which an era with no site yet points to.
export const load: PageServerLoad = ({ params }) => {
	const own = new Map(loadEdition(params.lang === 'en' ? 'en' : 'ru').lessons.map((l) => [l.id, l]));
	const practised = loadContent()
		.lessons.filter((l) => l.practice)
		.sort((a, b) => a.part - b.part || a.order - b.order);
	const steps = practised.map((l) => ({ id: l.practice!.id, era: l.practice!.era }));
	const starts: Record<number, { id: string; title: string; lang?: 'ru' }> = {};
	for (const l of practised) {
		const t = own.get(l.id);
		starts[l.practice!.era] ??= t ? { id: l.id, title: t.title } : { id: l.id, title: l.title, lang: 'ru' };
	}
	return { steps, starts };
};
