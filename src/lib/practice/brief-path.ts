/**
 * A path into the brief (spec §3.1b), for checks that read more than the flat card: `name`,
 * `mainAction.label`, `contacts.phone`, `sections[0]`, `items[1].title`, a whole list
 * (`sections`), or one field of every item (`items[].title`). A leading `brief.` is allowed and
 * ignored, and `items.1.title` is the same as `items[1].title`, as in the templates.
 *
 * Paths are resolved here, in the app, and only the values a step's checks need are put into the
 * sandbox (`facts` in checks.ts): the preview never holds the whole brief.
 */

/** `brief.items[1].title` → `['items', '1', 'title']`; `[]` is `*`, every item. */
export function segments(path: string): string[] {
	return path
		.replace(/^brief\./, '')
		.replace(/\[(\d*)\]/g, (_, n: string) => `.${n === '' ? '*' : n}`)
		.split('.')
		.filter((s) => s !== '');
}

/** Every node the path reaches; a `*` fans out over a list. */
export function reach(root: unknown, path: string): unknown[] {
	let nodes: unknown[] = [root];
	for (const seg of segments(path)) {
		const next: unknown[] = [];
		for (const n of nodes) {
			if (seg === '*') {
				if (Array.isArray(n)) next.push(...n);
			} else if (n && typeof n === 'object') {
				const v = (n as Record<string, unknown>)[seg];
				if (v !== undefined && v !== null) next.push(v);
			}
		}
		nodes = next;
	}
	return nodes;
}

const scalar = (v: unknown): v is string | number | boolean => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

/** The text values at a path: a list of strings is read as its items; empty strings are dropped. */
export function briefValues(root: unknown, path: string): string[] {
	const out: string[] = [];
	for (const n of reach(root, path)) {
		if (Array.isArray(n)) for (const x of n) scalar(x) && out.push(String(x));
		else if (scalar(n)) out.push(String(n));
	}
	return out.map((s) => s.trim()).filter((s) => s !== '');
}

/** How many items the path names: a list's length, or the number of nodes a `[]` path reaches. */
export function briefCount(root: unknown, path: string): number {
	const nodes = reach(root, path);
	if (nodes.length === 1 && Array.isArray(nodes[0])) return nodes[0].length;
	return nodes.length;
}
