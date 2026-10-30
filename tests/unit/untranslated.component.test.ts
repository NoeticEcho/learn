// @vitest-environment jsdom
/**
 * The page for a lesson one edition does not have. Every lesson is in both editions now, so no
 * route renders it; it stays as a mechanism (a lesson added in Russian first would land here
 * rather than on a 404), and this keeps it honest: it says what the lesson is, in the words it
 * exists in, and the way to the original.
 */
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Untranslated from '#lib/Untranslated.svelte';

const lesson = { id: '02-html/01-first-page', title: 'Первая страница', definition: 'HTML — язык разметки.', order: 1 };
const part = { number: 2, slug: '02-html', title: 'HTML', summary: '', era: 1 } as never;

it('names the lesson in Russian and links the original and the map', async () => {
	const { registerCatalogue, setLocale, getLocale } = await import('#lib/i18n/index.ts');
	registerCatalogue('en', (await import('#lib/i18n/en.json')).default);
	const was = getLocale();
	try {
		setLocale('en');
		const { container } = render(Untranslated, { lesson, part });
		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('This lesson isn’t in English yet');
		expect(container.querySelector('figure[lang="ru"]')!.textContent).toContain('Первая страница');
		expect(screen.getByRole('link', { name: 'Read it in Russian' }).getAttribute('href')).toMatch(/lesson\/02-html\/01-first-page\/$/);
		expect(screen.getByRole('link', { name: 'Back to the map' }).getAttribute('href')).toMatch(/#part-2$/);
		// the lede no longer promises that the edition is still being written
		expect(container.textContent).not.toMatch(/part by part|being written/);
	} finally {
		setLocale(was);
	}
});
