// The practice steps in curriculum order, so the gallery can tell which step is each era's site.
import { loadContent } from '#lib/content/load.ts';

export function load() {
	const steps = loadContent()
		.lessons.filter((l) => l.practice)
		.sort((a, b) => a.part - b.part || a.order - b.order)
		.map((l) => ({ id: l.practice!.id, era: l.practice!.era }));
	return { steps };
}
