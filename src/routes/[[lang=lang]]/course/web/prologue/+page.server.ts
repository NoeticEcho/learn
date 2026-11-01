import { courseView } from '#lib/courses/view.server.ts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [{}, { lang: 'en' }];

export function load({ params }: { params: { lang?: string } }) {
	const web = courseView('web', params.lang === 'en' ? 'en' : 'ru');
	return { title: web!.title, first: web?.kind === 'web' ? web.first : null };
}
