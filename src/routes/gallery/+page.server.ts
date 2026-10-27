// The practice steps in curriculum order, so the gallery can tell which step is each era's site.
import { loadContent } from '#lib/content/load.ts';

// And each era's first practice lesson, which an era with no site yet points to.
export function load() {
	const practised = loadContent()
		.lessons.filter((l) => l.practice)
		.sort((a, b) => a.part - b.part || a.order - b.order);
	const steps = practised.map((l) => ({ id: l.practice!.id, era: l.practice!.era }));
	const starts: Record<number, { id: string; title: string }> = {};
	for (const l of practised) starts[l.practice!.era] ??= { id: l.id, title: l.title };
	return { steps, starts };
}
