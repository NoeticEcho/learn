// @vitest-environment jsdom
/**
 * The brief editor: every field of the brief, list and nested ones included, saved without losing
 * an edit to the debounce, and storing only what the person changed.
 */
import 'fake-indexeddb/auto';
import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/svelte';
import BriefEditor from '#lib/persona/BriefEditor.svelte';
import { db, progress, persona } from '#lib/learner.ts';
import { defaultPersona } from '#lib/persona/fields.ts';

beforeEach(async () => {
	await (await db()).clear('persona');
});

const stored = async () => progress.persona(await db());

async function mounted() {
	const r = render(BriefEditor, { resettable: true });
	await vi.waitFor(() => expect(r.container.querySelector('[data-loaded="true"]')).toBeTruthy());
	return r;
}

it('shows the template’s lists until the person edits them, and stores nothing for them', async () => {
	await mounted();
	expect((screen.getByLabelText('Раздел 1') as HTMLInputElement).value).toBe(defaultPersona.sections[0]);
	expect(screen.getAllByText(/пример из шаблона/).length).toBeGreaterThan(0);
	await new Promise((r) => setTimeout(r, 500));
	expect((await stored()).sections).toBeUndefined();
});

it('editing, adding, moving and removing sections stores the person’s list', async () => {
	await mounted();
	await fireEvent.input(screen.getByLabelText('Раздел 1'), { target: { value: 'Кто я' } });
	await fireEvent.click(screen.getByRole('button', { name: 'Добавить раздел' }));
	const n = defaultPersona.sections.length + 1;
	const added = screen.getByLabelText(`Раздел ${n}`);
	expect(document.activeElement).toBe(added);
	await fireEvent.input(added, { target: { value: 'Блог' } });
	await fireEvent.click(screen.getByRole('button', { name: `Выше: Раздел ${n}` }));
	await fireEvent.click(screen.getByRole('button', { name: 'Убрать: Раздел 2' }));
	const want = ['Кто я', ...defaultPersona.sections.slice(2, -1), 'Блог', defaultPersona.sections.at(-1)];
	await vi.waitFor(async () => expect((await stored()).sections).toEqual(want));
	expect((await persona()).sections).toEqual(want);
});

it('items are edited field by field, and an empty row is not stored', async () => {
	await mounted();
	const first = screen.getByRole('group', { name: 'Услуга или товар 1' });
	await fireEvent.input(within(first).getByLabelText('Цена, если есть'), { target: { value: '1 000 ₽' } });
	await fireEvent.click(screen.getByRole('button', { name: 'Добавить услугу или товар' }));
	await vi.waitFor(async () => {
		const items = (await stored()).items as { title: string; price?: string }[];
		expect(items).toHaveLength(defaultPersona.items.length);
		expect(items[0]).toMatchObject({ title: defaultPersona.items[0].title, price: '1 000 ₽' });
	});
});

it('the main action keeps the template’s kind when only its label is typed', async () => {
	await mounted();
	await fireEvent.input(screen.getByLabelText('Что посетитель делает, одной фразой'), { target: { value: 'Позвонить мне' } });
	await vi.waitFor(async () => expect((await stored()).mainAction).toEqual({ label: 'Позвонить мне' }));
	expect((await persona()).mainAction).toEqual({ label: 'Позвонить мне', kind: defaultPersona.mainAction.kind });
});

it('languages keep at least one, and tone is one of four', async () => {
	await mounted();
	const ru = screen.getByRole('checkbox', { name: 'Русский' }) as HTMLInputElement;
	const en = screen.getByRole('checkbox', { name: 'Английский' }) as HTMLInputElement;
	await fireEvent.click(en);
	expect(ru.disabled).toBe(true);
	await fireEvent.click(screen.getByRole('radio', { name: 'Смелый' }));
	await vi.waitFor(async () => expect(await stored()).toMatchObject({ languages: ['ru'], tone: 'bold' }));
});

it('a phone typed in the card is the brief’s contact phone too', async () => {
	await mounted();
	await fireEvent.input(screen.getByLabelText('Телефон'), { target: { value: '+7 111' } });
	await fireEvent.input(screen.getByLabelText('Адрес'), { target: { value: 'ул. Новая, 1' } });
	await vi.waitFor(async () => expect(await stored()).toMatchObject({ phone: '+7 111', contacts: { phone: '+7 111', address: 'ул. Новая, 1' } }));
});

it('an edit made just before the editor goes away is saved, in every field', async () => {
	const { unmount } = await mounted();
	await fireEvent.input(screen.getByLabelText('Имя или название'), { target: { value: 'Мария' } });
	await fireEvent.input(screen.getByLabelText('Раздел 1'), { target: { value: 'Начало' } });
	unmount();
	await vi.waitFor(async () => expect(await stored()).toMatchObject({ name: 'Мария', sections: expect.arrayContaining(['Начало']) }));
});

it('says when it saved, and tells the page the brief changed', async () => {
	const heard = vi.fn();
	addEventListener('learn:brief', heard);
	await mounted();
	await fireEvent.input(screen.getByLabelText('Для кого сайт'), { target: { value: 'Соседи' } });
	await vi.waitFor(() => expect(screen.getByRole('status').textContent).toBe('Сохранено.'));
	expect(heard).toHaveBeenCalled();
	removeEventListener('learn:brief', heard);
});
