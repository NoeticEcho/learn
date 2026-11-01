/**
 * Эхо on the catalog: what a person is after, in their words, and which courses answer it
 * (docs/specs/2026-11-01-platform-design.md §5.3). Scripted, so it works with no key and no network.
 * `tests/unit/dock.test.ts` holds every course to at least one answer.
 */
export type Answer = { id: string; q: { ru: string; en: string }; courses: string[] };

export const ANSWERS: Answer[] = [
	{ id: 'understand-ai', q: { ru: 'Хочу понять, что такое ИИ и откуда он взялся', en: 'I want to understand what AI is and where it came from' }, courses: ['ai', 'noetic-singularity'] },
	{ id: 'real-work', q: { ru: 'Хочу поручать машине настоящую работу', en: 'I want to hand a machine real work' }, courses: ['work-with-ai', 'own-tools'] },
	{ id: 'job', q: { ru: 'Боюсь отстать на работе', en: 'I am afraid of falling behind at work' }, courses: ['work', 'learning', 'meaning'] },
	{ id: 'check', q: { ru: 'Хочу проверять, что мне говорят', en: 'I want to check what I am told' }, courses: ['verify', 'numbers', 'reasoning'] },
	{ id: 'mind', q: { ru: 'Не хочу разучиться думать', en: 'I do not want to forget how to think' }, courses: ['thinking', 'attention', 'learning', 'noetic-singularity'] },
	{ id: 'protect', q: { ru: 'Хочу защитить свои данные и деньги', en: 'I want to protect my data and my money' }, courses: ['privacy', 'security', 'money'] },
	{ id: 'law-health', q: { ru: 'Нужно разобраться с правом или здоровьем', en: 'I need to make sense of the law or my health' }, courses: ['law', 'health'] },
	{ id: 'children', q: { ru: 'У меня дети или ученики', en: 'I have children or students' }, courses: ['children', 'dialogue'] },
	{ id: 'anxious', q: { ru: 'Мне тревожно от того, что происходит', en: 'What is happening makes me anxious' }, courses: ['resilience', 'meaning', 'dialogue'] },
	{ id: 'make', q: { ru: 'Хочу делать своё и отвечать за это', en: 'I want to make things of my own and answer for them' }, courses: ['imagination', 'responsibility'] },
	{ id: 'site', q: { ru: 'Хочу сделать сайт или понять, как устроен интернет', en: 'I want to build a site or understand how the internet works' }, courses: ['web'] }
];
