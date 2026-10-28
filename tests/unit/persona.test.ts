import { it, expect, describe } from 'vitest';
import { render, merged, defaultPersona, fromAnswers, TEMPLATES } from '#lib/persona/render.ts';
import { Persona, Brief } from '#lib/persona/brief.schema.ts';

it('escapes values', () => expect(render('<h1>{{name}}</h1>', merged({ name: '<b>x</b>' }))).toBe('<h1>&lt;b&gt;x&lt;/b&gt;</h1>'));
it('own fields override defaults', () => expect(merged({ city: 'Тверь' }).city).toBe('Тверь'));
it('each', () => expect(render('{{#each services}}<li>{{.}}</li>{{/each}}', merged({ services: ['a', 'b'] }))).toBe('<li>a</li><li>b</li>'));
it('the default persona is fictional', () => expect(JSON.stringify(defaultPersona)).toMatch(/Заречье/));

describe('more of the brief', () => {
	it('each over objects, with fields inside', () =>
		expect(render('{{#each education}}{{year}} — {{text}};{{/each}}', merged({ education: [{ year: 2001, text: 'вуз' }] }))).toBe('2001 — вуз;'));
	it('dot paths', () => expect(render('{{contacts.city}}', merged({ contacts: { city: 'Заречье' } }))).toBe('Заречье'));
	it('an unknown field renders empty, never the placeholder', () => expect(render('[{{nope}}]', defaultPersona)).toBe('[]'));
	it('empty own values do not erase defaults', () => expect(merged({ name: '' }).name).toBe(defaultPersona.name));
	it('every number in the default persona is shaped 00-00-00 or zeros', () => {
		const digits = JSON.stringify(defaultPersona).match(/\d[\d\s()+-]{5,}\d/g) ?? [];
		for (const d of digits) if (!/^(19|20)\d\d/.test(d)) expect(d.replace(/\D/g, '')).toMatch(/^[07]?0+$/);
	});
	it('every template is a valid persona, one per kind', () => {
		for (const [kind, p] of Object.entries(TEMPLATES)) {
			const r = Persona.safeParse(p);
			expect(r.error?.issues ?? [], kind).toEqual([]);
			expect(p.kind).toBe(kind);
		}
	});
	it('a kind picks its template', () => expect(merged({}, 'venue').kind).toBe('venue'));
	it('maps the prologue answers into a brief', () => {
		const b = fromAnswers({ who: 'Анна, кондитер', forWhom: 'соседи', action: 'заказать торт' });
		expect(b).toMatchObject({ title: 'Анна, кондитер', who: 'Анна, кондитер', forWhom: 'соседи', mainAction: { label: 'заказать торт', kind: 'buy' } });
		expect(Brief.partial().safeParse(b).success).toBe(true);
		expect(fromAnswers({ who: 'x', forWhom: 'y', action: 'записаться ко мне' }).mainAction?.kind).toBe('book');
	});
});

describe('the English edition’s templates', async () => {
	const { templatesFor, defaultPersonaFor } = await import('#lib/persona/render.ts');
	const en = templatesFor('en');
	const ru = templatesFor('ru');
	const shape = (v: unknown): unknown =>
		Array.isArray(v) ? v.map(shape) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;

	it('is a valid persona for every kind, fictional, in Riverbend', () => {
		for (const [kind, p] of Object.entries(en)) {
			expect(Persona.safeParse(p).error?.issues ?? [], kind).toEqual([]);
			expect(p.kind).toBe(kind);
			expect(p.city, kind).toBe('Riverbend');
			expect(JSON.stringify(p), kind).not.toMatch(/[А-Яа-яЁё]/);
		}
		const digits = JSON.stringify(defaultPersonaFor('en')).match(/\d[\d\s()+-]{5,}\d/g) ?? [];
		for (const d of digits) if (!/^(19|20)\d\d/.test(d)) expect(d.replace(/\D/g, '')).toMatch(/^(44)?0+$/);
	});
	it('has the Russian template’s structure, item for item, so every check passes for both', () => {
		for (const kind of Object.keys(ru) as (keyof typeof ru)[]) {
			const { languages: _a, ...r } = ru[kind];
			const { languages: _b, ...e } = en[kind];
			expect(shape(e), kind).toEqual(shape(r));
		}
	});
	it('fills an empty field from the page’s edition, and leaves the person’s own words as they are', () => {
		expect(merged({}, 'expert', 'en').name).toBe('Kate Alder');
		expect(merged({ name: 'Ксения' }, 'expert', 'en').name).toBe('Ксения');
		expect(merged({ name: 'Kate' }, 'expert', 'ru').name).toBe('Kate');
	});
	it('reads an English main action too', () => {
		expect(fromAnswers({ who: 'x', forWhom: 'y', action: 'Book a table' }).mainAction?.kind).toBe('book');
		expect(fromAnswers({ who: 'x', forWhom: 'y', action: 'Join the club' }).mainAction?.kind).toBe('signup');
		expect(fromAnswers({ who: 'x', forWhom: 'y', action: 'Order a cake' }).mainAction?.kind).toBe('buy');
	});
});
