// @vitest-environment jsdom
/**
 * The practice step keeps every keystroke the person made. Saving is debounced, and a debounce
 * that is cancelled instead of flushed loses the last edit: when the person leaves the lesson
 * within the debounce, or edits a second file before the first one was written.
 */
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Practice from '#lib/practice/Practice.svelte';

const step = {
	id: 'two-files',
	title: 'Страница',
	task: 'Правьте.',
	era: 1,
	files: { 'index.html': '<p>a</p>', 'styles.css': 'p {}' },
	solution: { 'index.html': '<h1>a</h1>', 'styles.css': 'h1 {}' },
	checks: [{ id: 'h1', kind: 'exists', selector: 'h1' }]
};

function memoryStore() {
	const saved = new Map<string, string>();
	return {
		saved,
		load: vi.fn(async (era: number, file: string) => saved.get(`${era}:${file}`)),
		save: vi.fn(async (era: number, file: string, text: string) => void saved.set(`${era}:${file}`, text))
	};
}

// CodeMirror cannot lay out in jsdom; a textarea stands in for it, wired as createEditor is.
vi.mock('../../src/lib/practice/codemirror.ts', () => ({
	createEditor({ parent, doc, onchange }: { parent: HTMLElement; doc: string; onchange?: (v: string) => void }) {
		const ta = document.createElement('textarea');
		ta.value = doc;
		ta.addEventListener('input', () => onchange?.(ta.value));
		parent.append(ta);
		return { destroy: () => ta.remove(), ta };
	},
	replace(view: { ta: HTMLTextAreaElement }, text: string) {
		view.ta.value = text;
	}
}));

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

async function mounted() {
	const store = memoryStore();
	const r = render(Practice, { step: step as never, store });
	await vi.waitFor(() => expect(store.load).toHaveBeenCalledTimes(2));
	await vi.waitFor(() => expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('<p>a</p>'));
	return { store, ...r };
}

it('an edit made just before leaving the lesson is saved', async () => {
	const { store, unmount } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>a</h1>' } });
	unmount();
	await vi.runAllTimersAsync();
	expect(store.saved.get('1:index.html')).toBe('<h1>a</h1>');
});

it('editing a second file does not drop the first file’s pending save', async () => {
	const { store } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>a</h1>' } });
	await fireEvent.click(screen.getByRole('tab', { name: 'styles.css' }));
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'h1 { color: red }' } });
	await vi.runAllTimersAsync();
	expect(store.saved.get('1:index.html')).toBe('<h1>a</h1>');
	expect(store.saved.get('1:styles.css')).toBe('h1 { color: red }');
});

it('«Сбросить» is not undone by a save still pending from before it', async () => {
	const { store } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>mine</h1>' } });
	await fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
	await fireEvent.click(screen.getByRole('button', { name: 'Да, сбросить' }));
	await vi.runAllTimersAsync();
	expect(store.saved.get('1:index.html')).toBe('<p>a</p>');
});

it('«Сбросить» asks first, because the era’s site is the person’s work across lessons', async () => {
	const { store } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>mine</h1>' } });
	await vi.runAllTimersAsync();
	await fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
	await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
	await vi.runAllTimersAsync();
	expect(store.saved.get('1:index.html')).toBe('<h1>mine</h1>');
	expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('<h1>mine</h1>');
});
