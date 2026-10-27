// @vitest-environment jsdom
/** The person's own project fields, typed in settings, are all kept, and only a confirmed reset clears them. */
import 'fake-indexeddb/auto';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Settings from '../../src/routes/settings/+page.svelte';
import { db, progress } from '#lib/learner.ts';
import { EDITABLE } from '#lib/persona/fields.ts';

const [first, second] = EDITABLE.filter((f) => !f.multiline);

async function mounted() {
	render(Settings);
	const a = screen.getByLabelText(new RegExp(`^${await label(first.key)}$`)) as HTMLInputElement;
	const b = screen.getByLabelText(new RegExp(`^${await label(second.key)}$`)) as HTMLInputElement;
	// onMount has read the store once the fields carry what it holds
	await vi.waitFor(async () => expect(a.value).toBe(String((await progress.persona(await db()))[first.key] ?? '')));
	return { a, b };
}
const label = async (key: string) => (await import('#lib/i18n/index.ts')).t(`settings.field.${key}`);

it('typing in one field and then the next keeps both', async () => {
	const { a, b } = await mounted();
	await fireEvent.input(a, { target: { value: 'Мария' } });
	await fireEvent.input(b, { target: { value: 'архитектор' } });
	await vi.waitFor(async () => {
		const p = await progress.persona(await db());
		expect(p[second.key]).toBe('архитектор');
		expect(p[first.key]).toBe('Мария');
	});
});

it('«Вернуть пример» asks before it erases the person’s fields', async () => {
	const { a } = await mounted();
	await fireEvent.input(a, { target: { value: 'Мария' } });
	await vi.waitFor(async () => expect((await progress.persona(await db()))[first.key]).toBe('Мария'));
	await fireEvent.click(screen.getByRole('button', { name: 'Вернуть пример' }));
	await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
	await new Promise((r) => setTimeout(r, 50));
	expect((await progress.persona(await db()))[first.key]).toBe('Мария');
	await fireEvent.click(screen.getByRole('button', { name: 'Вернуть пример' }));
	await fireEvent.click(screen.getByRole('button', { name: 'Да, вернуть пример' }));
	await vi.waitFor(async () => expect((await progress.persona(await db()))[first.key]).toBeUndefined());
});
