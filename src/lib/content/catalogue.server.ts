// Build-time only (the `.server` suffix keeps it out of the browser): the catalogue from content.
import { loadContent } from './load.ts';
import { summarise, type Catalogue } from './catalogue.ts';

export function catalogue(): Catalogue {
	const { curriculum, lessons } = loadContent();
	return {
		parts: curriculum.parts,
		concepts: curriculum.concepts,
		lessons: lessons.map((l) => summarise(l, curriculum.parts)).sort((a, b) => a.part - b.part || a.order - b.order)
	};
}
