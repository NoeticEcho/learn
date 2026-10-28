// The lesson's body is its own chunk: the globs are lazy, so a lesson page loads one lesson, in
// its edition.
import type { Component } from 'svelte';
import type { PageLoad } from './$types';

const bodies = {
	ru: import.meta.glob<{ default: Component }>('/content/ru/**/*.svx'),
	en: import.meta.glob<{ default: Component }>('/content/en/**/*.svx')
};

export const load: PageLoad = async ({ data, params }) => {
	if (!data.lesson) return { ...data, body: null };
	const lang = params.lang === 'en' ? 'en' : 'ru';
	const body = bodies[lang][`/content/${lang}/${data.lesson.id}.svx`];
	return { ...data, body: body ? (await body()).default : null };
};
