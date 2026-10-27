// @vitest-environment jsdom
import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Quiz from '#lib/quiz/Quiz.svelte';

const questions = [
	{ type: 'single', prompt: 'Что такое тег?', options: ['Картинка', 'Метка разметки'], answer: 1, why: ['Нет: картинку вставляет тег img.', 'Да.'] }
];

it('a wrong answer, chosen from the keyboard, shows why and reports it', async () => {
	const onanswer = vi.fn();
	render(Quiz, { questions: questions as never, onanswer });
	const user = userEvent.setup();
	await user.tab(); // the first radio
	await user.keyboard(' ');
	expect((screen.getByRole('radio', { name: 'Картинка' }) as HTMLInputElement).checked).toBe(true);
	await user.tab(); // the check button
	await user.keyboard('{Enter}');
	expect(screen.getByText(/картинку вставляет тег img/)).toBeTruthy();
	expect(onanswer).toHaveBeenCalledWith(0, false);
});

it('order is answered with buttons', async () => {
	const onanswer = vi.fn();
	render(Quiz, { questions: [{ type: 'order', prompt: 'По порядку', items: ['a', 'b'] }] as never, onanswer, seed: 's' });
	const user = userEvent.setup();
	// two items always start reversed (a shuffle never returns the answer)
	await user.click(screen.getByRole('button', { name: 'Ниже: b' }));
	await user.click(screen.getByRole('button', { name: 'Проверить' }));
	expect(onanswer).toHaveBeenCalledWith(0, true);
});
