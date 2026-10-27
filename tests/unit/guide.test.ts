import { it, expect, vi, describe } from 'vitest';
import { nextLine } from '#lib/guide/script.ts';
import { ask, estimateCost, AskError } from '#lib/guide/model.ts';

const lines = { intro: 'Привет', hints: ['Подсказка 1', 'Подсказка 2'], mistakes: { label: 'У поля нет подписи' }, outro: 'Готово' };

it('a known mistake wins over a generic hint', () =>
	expect(nextLine(lines, { kind: 'fail', failed: ['label'], attempt: 1 })).toEqual({ text: 'У поля нет подписи', mood: 'hmm' }));
it('hints escalate by attempt and stop at the last', () => {
	expect(nextLine(lines, { kind: 'fail', failed: ['x'], attempt: 1 }).text).toBe('Подсказка 1');
	expect(nextLine(lines, { kind: 'fail', failed: ['x'], attempt: 5 }).text).toBe('Подсказка 2');
});
it('enter explains, pass cheers', () => {
	expect(nextLine(lines, { kind: 'enter' })).toEqual({ text: 'Привет', mood: 'explain' });
	expect(nextLine(lines, { kind: 'pass' })).toEqual({ text: 'Готово', mood: 'cheer' });
});
it('ask sends the key only to the chosen provider', async () => {
	const f = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: 'text', text: 'ответ' }] })));
	const out = await ask({ provider: 'anthropic', key: 'k', model: 'claude-sonnet-5-5' }, { lesson: 'L', question: 'Q' }, f as never);
	expect(out).toBe('ответ');
	const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
	expect(url).toBe('https://api.anthropic.com/v1/messages');
	expect((init.headers as Record<string, string>)['x-api-key']).toBe('k');
	expect((init.headers as Record<string, string>)['anthropic-dangerous-direct-browser-access']).toBe('true');
	expect(f).toHaveBeenCalledTimes(1);
});

describe('more of the model mode', () => {
	const ok = (body: unknown) => vi.fn(async () => new Response(JSON.stringify(body)));
	it('OpenAI and OpenRouter use the chat completions shape, each at its own host', async () => {
		for (const [provider, host] of [
			['openai', 'https://api.openai.com/v1/chat/completions'],
			['openrouter', 'https://openrouter.ai/api/v1/chat/completions']
		] as const) {
			const f = ok({ choices: [{ message: { content: 'да' } }] });
			expect(await ask({ provider, key: 'sk-x', model: 'm' }, { lesson: 'L', question: 'Q' }, f as never)).toBe('да');
			const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
			expect(url).toBe(host);
			expect((init.headers as Record<string, string>).authorization).toBe('Bearer sk-x');
		}
	});
	it('the persona goes only when given', async () => {
		const f = ok({ content: [{ type: 'text', text: 'x' }] });
		await ask({ provider: 'anthropic', key: 'k', model: 'claude-sonnet-5-5' }, { lesson: 'L', question: 'Q' }, f as never);
		await ask({ provider: 'anthropic', key: 'k', model: 'claude-sonnet-5-5' }, { lesson: 'L', question: 'Q', persona: { name: 'Мария' } }, f as never);
		const body = (i: number) => String((f.mock.calls[i] as unknown as [string, RequestInit])[1].body);
		expect(body(0)).not.toContain('Мария');
		expect(body(1)).toContain('Мария');
	});
	it('a 401 says the key was not accepted, and never repeats the key', async () => {
		const f = vi.fn(async () => new Response('{"error":{"message":"invalid x-api-key sk-secret"}}', { status: 401 }));
		const e = await ask({ provider: 'anthropic', key: 'sk-secret', model: 'claude-sonnet-5-5' }, { lesson: 'L', question: 'Q' }, f as never).catch((x) => x);
		expect(e).toBeInstanceOf(AskError);
		expect(e.message).toMatch(/ключ не принят/i);
		expect(e.message).not.toContain('sk-secret');
	});
	it('a network failure says there is no connection', async () => {
		const f = vi.fn(async () => {
			throw new TypeError('Failed to fetch');
		});
		await expect(ask({ provider: 'openai', key: 'k', model: 'm' }, { lesson: 'L', question: 'Q' }, f as never)).rejects.toThrow(/нет связи/i);
	});
	it('estimates the cost in roubles for a known model, and admits not knowing the rest', () => {
		const c = estimateCost('anthropic', 'claude-sonnet-5-5', 3000);
		expect(c).toBeGreaterThan(0);
		expect(c).toBeLessThan(10);
		expect(estimateCost('openai', 'some-model', 3000)).toBeNull();
	});
});
