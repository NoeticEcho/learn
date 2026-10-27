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
