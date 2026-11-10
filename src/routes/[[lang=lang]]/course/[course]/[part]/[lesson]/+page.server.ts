import { error } from '@sveltejs/kit';
import type { Locale } from '#lib/i18n/index.ts';
import { courseLessonView, openCourseLessons } from '#lib/courses/view.server.ts';
import { courseLessonCard, lastmod, og } from '#lib/seo/pages.server.ts';
import { narration } from '#lib/narration/narration.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

/**
 * A lesson of a course other than the web one (docs/specs/2026-11-01-platform-design.md §5.4): an
 * open lesson, in both editions, because courses/lessons.ts refuses an open lesson without both.
 * A planned lesson is no entry, so it has no page, and a link to one fails the prerender.
 */
export const entries: EntryGenerator = () =>
	openCourseLessons().flatMap(({ course, part, lesson }) => [
		{ course, part, lesson },
		{ lang: 'en', course, part, lesson }
	]);

export const load: PageServerLoad = ({ params }) => {
	const lang: Locale = params.lang === 'en' ? 'en' : 'ru';
	const id = `${params.course}/${params.part}/${params.lesson}`;
	const view = courseLessonView(id, lang);
	if (!view) error(404);
	const { lesson, nav } = view;
	return {
		lesson,
		course: nav,
		editions: ['ru', 'en'] as Locale[],
		og: og(courseLessonCard(lesson, nav, lang)),
		lastmod: lastmod(id, lang),
		// null until its sections are rendered (docs/narration.md): the page then offers no «Слушать»
		narration: narration(lesson, lang)
	};
};
