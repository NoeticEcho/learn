import { catalogue } from '#lib/content/catalogue.server.ts';
import { loadCourses } from '#lib/courses/load.ts';
import { mapCard, og } from '#lib/seo/pages.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

export const load: PageServerLoad = ({ params }) => {
	const lang = params.lang === 'en' ? 'en' : 'ru';
	return { catalogue: catalogue(lang), og: og(mapCard(lang)), courseName: loadCourses().courses.find((c) => c.id === 'web')!.title[lang] };
};
