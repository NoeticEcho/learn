import { catalogue } from '#lib/content/catalogue.server.ts';

export function load() {
	return { catalogue: catalogue() };
}
