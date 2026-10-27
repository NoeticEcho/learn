// The lesson's body is its own chunk: the glob is lazy, so a lesson page loads one lesson.
import type { Component } from 'svelte';
import type { PageLoad } from './$types';

const bodies = import.meta.glob<{ default: Component }>('/content/ru/**/*.svx');

export const load: PageLoad = async ({ data }) => {
	const body = bodies[`/content/ru/${data.lesson.id}.svx`];
	return { ...data, body: body ? (await body()).default : null };
};
