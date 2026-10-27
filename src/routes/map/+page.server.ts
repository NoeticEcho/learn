import { catalogue } from '#lib/content/catalogue.server.ts';
import { mapCard, og } from '#lib/seo/pages.server.ts';

export function load() {
	return { catalogue: catalogue(), og: og(mapCard()) };
}
