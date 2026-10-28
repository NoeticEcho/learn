import { error } from '@sveltejs/kit';
import { loadContent, loadEdition } from '#lib/content/load.ts';
import { homeIndex } from '#lib/content/catalogue.server.ts';
import { lastmod, lessonCard, og } from '#lib/seo/pages.server.ts';
import { narration } from '#lib/narration/narration.server.ts';
import type { Locale } from '#lib/i18n/index.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

/**
 * Every lesson in both editions. A lesson the English edition has not translated yet is still a
 * page, `/learn/en/lesson/<id>/`: it says so and links to the Russian lesson, so a link from the
 * English map, a shared address or the language switch never lands on a 404.
 */
export const entries: EntryGenerator = () =>
	loadContent().lessons.flatMap((l) => {
		const [part, lesson] = l.id.split('/');
		return [{ part, lesson }, { lang: 'en', part, lesson }];
	});

export const load: PageServerLoad = ({ params }) => {
	const lang: Locale = params.lang === 'en' ? 'en' : 'ru';
	const id = `${params.part}/${params.lesson}`;
	const source = loadContent().lessons.find((l) => l.id === id);
	if (!source) error(404);
	const { lessons, curriculum } = loadEdition(lang);
	const part = curriculum.parts.find((p) => p.number === source.part)!;
	const lesson = lessons.find((l) => l.id === id);
	// The editions this page exists in as a lesson: the head's hreflang, the language switch.
	const editions: Locale[] = loadEdition('en').lessons.some((l) => l.id === id) ? ['ru', 'en'] : ['ru'];
	if (!lesson) return { untranslated: { id, title: source.title, definition: source.definition, order: source.order } as const, part, editions };
	// Not the whole catalogue: inline in every lesson it was 29 KB gzipped and growing with the
	// course, and it tipped the HTML past a slow-start window (+150 ms LCP). The lesson names
	// the concepts it teaches, and «Дальше» reads which lessons it opens from the home's hashed
	// lesson list, fetched after mount and cached by the service worker.
	const concepts = lesson.teaches.map((c) => curriculum.concepts.find((x) => x.id === c)?.title ?? c);
	// The head's: the Open Graph card and the date the lesson last changed (lib/seo).
	return {
		lesson,
		part,
		concepts,
		editions,
		index: homeIndex(lang).hash,
		og: og(lessonCard(lesson, part, lang)),
		lastmod: lastmod(id, lang),
		// its audio, when every section of its current text has some (docs/narration.md)
		narration: narration(lesson, lang)
	};
};
