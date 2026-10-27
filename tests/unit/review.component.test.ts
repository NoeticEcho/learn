// @vitest-environment jsdom
/** A rating grades the card it was given for once: a fast double click is one review, one XP. */
import 'fake-indexeddb/auto';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Review from '../../src/routes/review/+page.svelte';
import { db } from '#lib/learner.ts';
import { enrol } from '#lib/srs/index.ts';

it('a double click on a rating grades the card once and awards one review', async () => {
	const d = await db();
	await enrol(d, [
		{ id: 'r1', front: 'Что такое DNS?', back: 'Имена в адреса' },
		{ id: 'r2', front: 'Что такое TCP?', back: 'Надёжный поток' }
	]);
	const { container } = render(Review);
	await fireEvent.click(await screen.findByRole('button', { name: 'Показать ответ' }));
	const first = container.querySelector('.front')!.textContent;
	const good = screen.getByRole('button', { name: 'Хорошо' });
	await Promise.all([fireEvent.click(good), fireEvent.click(good)]);
	const other = first === 'Что такое DNS?' ? 'Что такое TCP?' : 'Что такое DNS?';
	await vi.waitFor(() => expect(screen.getByText(other)).toBeTruthy());
	await new Promise((r) => setTimeout(r, 50));
	const log = await d.getAll('log');
	expect(log.filter((e) => e.kind === 'review')).toHaveLength(1);
	// the second card was not graded by the second click
	expect(screen.queryByRole('button', { name: 'Хорошо' })).toBeNull();
	expect(screen.getByRole('button', { name: 'Показать ответ' })).toBeTruthy();
});
