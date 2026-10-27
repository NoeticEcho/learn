import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';

// A diagram sits under whichever heading its lesson has reached, so a heading of its own at a
// fixed level (it was an h4) skips a level (an h2 or h3 inside a drawn sample page is content, not a title) and fails Lighthouse's heading-order. A diagram's
// title is a div with the class `dh`, which app.css styles as a heading was.
describe('diagrams', () => {
	const dir = 'content/diagrams/';
	for (const f of readdirSync(dir).filter((f) => f.endsWith('.svelte')))
		test(`${f} has no heading element for a title (use <div class="dh">)`, () => {
			const markup = readFileSync(dir + f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
			expect(markup).not.toMatch(/<h[4-6][\s>]/);
		});
});
