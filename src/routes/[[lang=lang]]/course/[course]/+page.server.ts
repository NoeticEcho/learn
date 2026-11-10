import { error } from '@sveltejs/kit';
import { loadCourses } from '#lib/courses/load.ts';
import { courseView, openMinutes } from '#lib/courses/view.server.ts';
import { courseCard, og } from '#lib/seo/pages.server.ts';
import { loadContent } from '#lib/content/load.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => loadCourses().courses.flatMap((c) => [{ course: c.id }, { lang: 'en', course: c.id }]);

export const load: PageServerLoad = ({ params }) => {
	const lang = params.lang === 'en' ? 'en' : 'ru';
	const course = courseView(params.course, lang);
	if (!course) error(404);
	const c = loadCourses().courses.find((x) => x.id === params.course)!;
	return {
		course,
		og: og(courseCard(c, lang)),
		// the workload of what can be taken now, for its structured data: every web lesson, or a
		// planned course's open ones
		minutes: course.kind === 'web' ? loadContent().lessons.reduce((n, l) => n + l.minutes, 0) : openMinutes(course.id)
	};
};
