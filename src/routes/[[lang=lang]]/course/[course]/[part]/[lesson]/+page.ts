// The lesson's body is its own chunk, as in the web course's route: a page loads one lesson, in
// its edition.
import type { Component } from 'svelte';
import { lessonFile } from '#lib/courses/types.ts';
import type { PageLoad } from './$types';

const bodies = import.meta.glob<{ default: Component }>('/content/courses/**/*.svx');

export const load: PageLoad = async ({ data, params }) => {
	const lang = params.lang === 'en' ? 'en' : 'ru';
	const body = bodies[`/${lessonFile(data.lesson.id, lang)}`];
	return { ...data, body: body ? (await body()).default : null };
};
