// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Guide from '#lib/guide/Guide.svelte';

const lines = { intro: 'Привет', hints: ['Подсказка'], mistakes: { h1: 'Нет заголовка' }, outro: 'Готово' };

it('drives the mascot’s classes and speaks in a live region', () => {
	const { container } = render(Guide, { lines, event: { kind: 'fail', failed: ['h1'], attempt: 1 }, era: 1 });
	const svg = container.querySelector('svg.echo')!;
	expect(svg.classList.contains('mood-hmm')).toBe(true);
	expect(svg.classList.contains('era-1')).toBe(true);
	const bubble = container.querySelector('[aria-live="polite"]')!;
	expect(bubble.textContent).toBe('Нет заголовка');
});

it('is compact under 64 px', () => {
	const { container } = render(Guide, { lines, size: 48 });
	const svg = container.querySelector('svg.echo')!;
	expect(svg.classList.contains('compact')).toBe(true);
	expect(svg.getAttribute('viewBox')).toBe('36 24 88 108');
});

it('model mode is hidden without a key', () => {
	render(Guide, { lines });
	expect(screen.queryByRole('textbox')).toBeNull();
});

it('model mode appears with a key, and names where the question goes', () => {
	render(Guide, { lines, model: { provider: 'anthropic', key: 'k', model: 'claude-sonnet-5-5' } });
	expect(screen.getByRole('textbox')).toBeTruthy();
	expect(screen.getByText(/уйдёт только в Anthropic/)).toBeTruthy();
});

it('names the mascot in the page’s language', async () => {
	const { registerCatalogue, setLocale, getLocale } = await import('#lib/i18n/index.ts');
	const en = (await import('#lib/i18n/en.json')).default;
	registerCatalogue('en', en);
	const was = getLocale();
	try {
		const title = (l: 'ru' | 'en') => {
			setLocale(l);
			const { container, unmount } = render(Guide, { lines });
			const text = container.querySelector('svg.echo title')!.textContent;
			unmount();
			return text;
		};
		expect(title('ru')).toBe('Эхо, проводник курса');
		expect(title('en')).toBe('Echo, your guide through the course');
	} finally {
		setLocale(was);
	}
});
