// @vitest-environment jsdom
/** What a lesson adds for the exercise is marked data-scaffold, and the gallery and the zip leave it out. */
import { it, expect } from 'vitest';
import { withoutScaffold } from '#lib/practice/scaffold.ts';

const page = '<!doctype html>\n<html lang="ru"><head><title>Сайт</title></head><body><h1>Мария</h1><aside class="note" data-scaffold id="brief-card"><h2>Бриф</h2></aside><p>Текст</p></body></html>';

it('removes every element marked data-scaffold, and keeps the rest and the doctype', () => {
	const out = withoutScaffold(page);
	expect(out).not.toContain('Бриф');
	expect(out).toContain('<h1>Мария</h1>');
	expect(out).toContain('<p>Текст</p>');
	expect(out).toContain('lang="ru"');
	expect(out.startsWith('<!doctype html>')).toBe(true);
});

it('leaves a page with nothing marked exactly as the person wrote it', () => {
	const mine = '<h1>Мария</h1>\n<aside class="note">моя заметка</aside>';
	expect(withoutScaffold(mine)).toBe(mine);
});

it('a page saved before the marker existed loses its lesson notes too', () => {
	const old = '<h1>Мария</h1><aside class="note" id="dns"><h2>DNS</h2></aside>';
	expect(withoutScaffold(old, { legacy: true })).not.toContain('DNS');
});
