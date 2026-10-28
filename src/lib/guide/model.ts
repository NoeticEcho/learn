/**
 * Model mode (spec §4.5): the guide answers free questions with the person's own key.
 *
 * - The key goes to the provider the person chose and nowhere else: one request, to that
 *   provider's host. It is never put in a URL, never logged, and never repeated in an error.
 * - The person's project data (the persona) is sent only when the caller passes it, which the UI
 *   does only when the person ticks it for that question (spec §3.2).
 * - Off by default: the UI shows this only when a key is set, with the estimated cost first.
 *
 * Raw `fetch` rather than a provider SDK: three providers, a browser, and a first-route budget,
 * and the plan's interface takes a `fetch` so tests never touch the network.
 */
import { getLocale, t, type Locale } from '#lib/i18n/index.ts';

export type Provider = 'anthropic' | 'openai' | 'openrouter';
export type ModelConfig = { provider: Provider; key: string; model: string };
export type AskContext = { lesson: string; code?: string; question: string; persona?: object };

export class AskError extends Error {
	constructor(
		public reason: 'key' | 'network' | 'refusal' | 'status' | 'empty',
		message: string
	) {
		super(message);
	}
}

export const ENDPOINTS: Record<Provider, string> = {
	anthropic: 'https://api.anthropic.com/v1/messages',
	openai: 'https://api.openai.com/v1/chat/completions',
	openrouter: 'https://openrouter.ai/api/v1/chat/completions'
};

/** The models offered for each provider; the first is the default. OpenAI and OpenRouter take any id. */
export const MODELS: Record<Provider, string[]> = {
	anthropic: ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'],
	openai: [],
	openrouter: []
};

/** The guide's instructions, in the edition's language: the same tutor in both. */
export const SYSTEM_PROMPTS: Record<Locale, string> = {
	ru: [
		'Ты Эхо, наставник в учебнике «Сквозь время» о том, как устроен веб. Ученик взрослый и только начинает.',
		'Объясняй простыми словами, по-русски, коротко: два-три абзаца.',
		'Сначала подскажи, где искать ответ, и только если ученик просит прямо, покажи решение.',
		'Опирайся на текст урока, который тебе дали, и ссылайся на его источники, когда они есть.',
		'Если не уверен, так и скажи. Не выдумывай факты, адреса и цифры.',
		'Никогда не проси у ученика личные данные, пароли или ключи.'
	].join(' '),
	en: [
		'You are Echo, the guide in “Through Time”, a textbook about how the web works. The learner is an adult and a beginner.',
		'Explain in plain English, briefly: two or three paragraphs.',
		'First point to where the answer can be found; show the solution only if the learner asks for it directly.',
		'Ground your answer in the lesson text you are given, and cite its sources when there are any.',
		'If you are not sure, say so. Do not invent facts, addresses or numbers.',
		'Never ask the learner for personal data, passwords or keys.'
	].join(' ')
};
export const SYSTEM_PROMPT = SYSTEM_PROMPTS.ru;

const LABELS: Record<Locale, { lesson: string; code: string; persona: string; question: string }> = {
	ru: { lesson: 'Урок', code: 'Код ученика', persona: 'Данные проекта ученика (он разрешил их передать)', question: 'Вопрос' },
	en: { lesson: 'Lesson', code: "The learner's code", persona: "The learner's project details (they agreed to share them)", question: 'Question' }
};

function userMessage(ctx: AskContext, l: Locale): string {
	const w = LABELS[l];
	const parts = [`${w.lesson}:\n${ctx.lesson}`];
	if (ctx.code) parts.push(`${w.code}:\n${ctx.code}`);
	if (ctx.persona) parts.push(`${w.persona}:\n${JSON.stringify(ctx.persona)}`);
	parts.push(`${w.question}:\n${ctx.question}`);
	return parts.join('\n\n');
}

/** Models that accept the server-side refusal fallback (Anthropic's guidance for these models). */
const FALLBACK = /^claude-(sonnet-5-5|opus-5-5|opus-5|fable-5-1)$/;

export async function ask(cfg: ModelConfig, ctx: AskContext, fetchImpl: typeof fetch = fetch, l: Locale = getLocale()): Promise<string> {
	const content = userMessage(ctx, l);
	const SYSTEM_PROMPT = SYSTEM_PROMPTS[l];
	const url = ENDPOINTS[cfg.provider];
	let headers: Record<string, string>;
	let body: Record<string, unknown>;
	if (cfg.provider === 'anthropic') {
		headers = {
			'content-type': 'application/json',
			'x-api-key': cfg.key,
			'anthropic-version': '2023-06-01',
			'anthropic-dangerous-direct-browser-access': 'true'
		};
		body = {
			model: cfg.model,
			max_tokens: 4096,
			system: SYSTEM_PROMPT,
			output_config: { effort: 'low' },
			messages: [{ role: 'user', content }]
		};
		if (FALLBACK.test(cfg.model)) {
			headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
			body.fallbacks = 'default';
		}
	} else {
		headers = { 'content-type': 'application/json', authorization: `Bearer ${cfg.key}` };
		body = {
			model: cfg.model,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content }
			]
		};
	}

	let res: Response;
	try {
		res = await fetchImpl(url, { method: 'POST', headers, body: JSON.stringify(body), referrerPolicy: 'no-referrer', credentials: 'omit' });
	} catch {
		throw new AskError('network', t('guide.error.network'));
	}
	if (res.status === 401 || res.status === 403) throw new AskError('key', t('guide.error.key'));
	if (!res.ok) throw new AskError('status', t('guide.error.status', { status: res.status }));

	const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
	let text = '';
	if (cfg.provider === 'anthropic') {
		if (data?.stop_reason === 'refusal') throw new AskError('refusal', t('guide.error.refusal'));
		const blocks = (data?.content ?? []) as { type: string; text?: string }[];
		text = blocks.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim();
	} else {
		const choices = (data?.choices ?? []) as { message?: { content?: string } }[];
		text = (choices[0]?.message?.content ?? '').trim();
	}
	if (!text) throw new AskError('empty', t('guide.error.empty'));
	return text;
}

/**
 * Prices in US dollars per million tokens, from Anthropic's published table, and the rouble at
 * the Bank of Russia's rate; both dated, both to be refreshed. A model not listed has no
 * estimate, and the UI says so rather than guessing.
 */
export const PRICES_DATED = '2026-10-27';
export const USD_RUB = 80.49; // ЦБ РФ, 27.10.2026
export const PRICES: Record<string, { input: number; output: number }> = {
	'anthropic:claude-sonnet-5-5': { input: 2, output: 10 },
	'anthropic:claude-haiku-5-5': { input: 0.1, output: 0.5 },
	'anthropic:claude-opus-5-5': { input: 4, output: 20 }
};

/**
 * The cost of one question, in roubles for the Russian edition and in US dollars (the providers'
 * own currency) for the English one: input tokens from characters (Cyrillic runs about 2.5
 * characters a token, English about 4), the system prompt included, and the answer doubled for
 * the model's own thinking. Roubles are rounded to the kopeck, dollars to a tenth of a cent.
 */
export function estimateCost(provider: Provider, model: string, inputChars: number, outputTokens = 600, l: Locale = 'ru'): number | null {
	const p = PRICES[`${provider}:${model}`];
	if (!p) return null;
	const input = (inputChars + SYSTEM_PROMPTS[l].length) / (l === 'ru' ? 2.5 : 4);
	const usd = (input * p.input + outputTokens * 2 * p.output) / 1_000_000;
	return l === 'ru' ? Math.round(usd * USD_RUB * 100) / 100 : Math.round(usd * 1000) / 1000;
}
