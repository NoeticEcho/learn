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

function memoryStore(legacy: Record<string, string> = {}) {
	const saved = new Map<string, string>();
	return {
		saved,
		load: vi.fn(async (stepId: string, file: string) => saved.get(`${stepId}:${file}`)),
		save: vi.fn(async (stepId: string, file: string, text: string) => void saved.set(`${stepId}:${file}`, text)),
		legacy: vi.fn(async (_era: number) => (Object.keys(legacy).length ? legacy : undefined))
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

async function mounted(store = memoryStore()) {
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
	expect(store.saved.get('two-files:index.html')).toBe('<h1>a</h1>');
});

it('editing a second file does not drop the first file’s pending save', async () => {
	const { store } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>a</h1>' } });
	await fireEvent.click(screen.getByRole('tab', { name: 'styles.css' }));
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'h1 { color: red }' } });
	await vi.runAllTimersAsync();
	expect(store.saved.get('two-files:index.html')).toBe('<h1>a</h1>');
	expect(store.saved.get('two-files:styles.css')).toBe('h1 { color: red }');
});

it('«Сбросить» is not undone by a save still pending from before it', async () => {
	const { store } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>mine</h1>' } });
	await fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
	await fireEvent.click(screen.getByRole('button', { name: 'Да, сбросить' }));
	await vi.runAllTimersAsync();
	expect(store.saved.get('two-files:index.html')).toBe('<p>a</p>');
});

it('«Сбросить» asks first, because it erases the person’s work on this step', async () => {
	const { store } = await mounted();
	await fireEvent.input(screen.getByRole('textbox'), { target: { value: '<h1>mine</h1>' } });
	await vi.runAllTimersAsync();
	await fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
	await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
	await vi.runAllTimersAsync();
	expect(store.saved.get('two-files:index.html')).toBe('<h1>mine</h1>');
	expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('<h1>mine</h1>');
});

const textbox = () => screen.getByRole('textbox') as HTMLTextAreaElement;

it('a step starts from its own starter, not from another step of the same era', async () => {
	const store = memoryStore();
	store.saved.set('earlier-step:index.html', '<h1>другой урок</h1>');
	await mounted(store);
	expect(textbox().value).toBe('<p>a</p>');
	expect(store.load).toHaveBeenCalledWith('two-files', 'index.html');
});

it('continues: a step with no work of its own starts from the step it continues', async () => {
	const store = memoryStore();
	store.saved.set('earlier:index.html', '<h1>моя страница</h1>');
	render(Practice, { step: { ...step, continues: 'earlier' } as never, store });
	await vi.waitFor(() => expect(textbox().value).toBe('<h1>моя страница</h1>'));
	// the earlier step's other file is not there, so this step's own starter fills it
	await fireEvent.click(screen.getByRole('tab', { name: 'styles.css' }));
	expect(textbox().value).toBe('p {}');
});

it('continues: the step’s own work, once there, wins over the step it continues', async () => {
	const store = memoryStore();
	store.saved.set('earlier:index.html', '<h1>моя страница</h1>');
	store.saved.set('two-files:index.html', '<h1>правка</h1>');
	render(Practice, { step: { ...step, continues: 'earlier' } as never, store });
	await vi.waitFor(() => expect(textbox().value).toBe('<h1>правка</h1>'));
});

it('the era’s page from the previous version is offered, not imposed, and kept', async () => {
	const store = memoryStore({ 'index.html': '<h1>старая страница</h1>' });
	await mounted(store);
	expect(textbox().value).toBe('<p>a</p>');
	await fireEvent.click(screen.getByRole('button', { name: /прошлой версии/ }));
	await vi.waitFor(() => expect(textbox().value).toBe('<h1>старая страница</h1>'));
	await vi.runAllTimersAsync();
	expect(store.saved.get('two-files:index.html')).toBe('<h1>старая страница</h1>');
	expect(screen.queryByRole('button', { name: /прошлой версии/ })).toBeNull();
});

it('a step with work of its own does not offer the old page', async () => {
	const store = memoryStore({ 'index.html': '<h1>старая</h1>' });
	store.saved.set('two-files:index.html', '<h1>моя</h1>');
	render(Practice, { step: step as never, store });
	await vi.waitFor(() => expect(textbox().value).toBe('<h1>моя</h1>'));
	expect(screen.queryByRole('button', { name: /прошлой версии/ })).toBeNull();
});

it('a brief edited on the same page reaches the checks without a reload', async () => {
	const named = { ...step, checks: [{ id: 'n', kind: 'field', selector: 'h1', field: 'name' }] };
	const store = memoryStore();
	const r = render(Practice, { step: named as never, store, persona: { name: 'Анна' } });
	const frame = () => r.container.querySelector('iframe')!.getAttribute('srcdoc') ?? '';
	await vi.waitFor(() => expect(frame()).toContain('Анна'));
	await r.rerender({ step: named as never, store, persona: { name: 'Мария' } });
	await vi.waitFor(() => expect(frame()).toContain('Мария'));
});

// 28.10, found in real Chromium on 08-cms/03, 07, 08: the learner's brief replaced the default a
// moment after mount, render() cleared the results and set the same srcdoc again, the iframe was
// not reloaded, no new learn:checks came, and the checks said «проверяется» until the next edit.
it('a brief change that does not change the page keeps the check results', async () => {
	const store = memoryStore();
	const r = render(Practice, { step: step as never, store, persona: { name: 'Анна' } });
	const iframe = () => r.container.querySelector('iframe')!;
	await vi.waitFor(() => expect(iframe().getAttribute('srcdoc')).toBeTruthy());
	const before = iframe().getAttribute('srcdoc');
	window.dispatchEvent(
		new MessageEvent('message', { data: { type: 'learn:checks', results: [{ id: 'h1', ok: false }] }, source: iframe().contentWindow })
	);
	const check = () => r.container.querySelector('[data-check="h1"]')!.getAttribute('data-ok');
	await vi.waitFor(() => expect(check()).toBe('false'));
	await r.rerender({ step: step as never, store, persona: { name: 'Мария' } });
	await vi.runAllTimersAsync();
	expect(iframe().getAttribute('srcdoc')).toBe(before);
	expect(check()).toBe('false');
});
