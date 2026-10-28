// The edition in a URL (SvelteKit 3's parameter matchers): /learn/en/… is English; Russian, the
// source edition, has no segment, so `[[lang=lang]]` matches `en` or nothing.
import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	lang: (param: string) => (param === 'en' ? 'en' : undefined)
});
