// @vitest-environment jsdom
import { it, expect, describe } from 'vitest';
import { evaluate, describeCheck, facts } from '#lib/practice/checks.ts';

const run = (html: string, checks: unknown[], persona = {}) => {
	document.documentElement.innerHTML = html;
	return evaluate(document, window, checks as never, facts(checks as never, persona));
};

it('exists', () => expect(run('<body><h1>x</h1></body>', [{ id: 'h', kind: 'exists', selector: 'h1' }])[0].ok).toBe(true));
it('label fails on a bare input', () =>
	expect(run('<body><input id=a></body>', [{ id: 'l', kind: 'label' }])[0].ok).toBe(false));
it('label passes with for=', () =>
	expect(run('<body><label for=a>Имя</label><input id=a></body>', [{ id: 'l', kind: 'label' }])[0].ok).toBe(true));
it('field matches the person, not the persona text', () =>
	expect(
		run('<body><h1>Мария Петрова</h1></body>', [{ id: 'f', kind: 'field', selector: 'h1', field: 'name' }], { name: 'Мария Петрова' })[0].ok
	).toBe(true));
it('noTag', () => expect(run('<body><font>x</font></body>', [{ id: 'n', kind: 'noTag', tags: ['font'] }])[0].ok).toBe(false));
it('contrast uses WCAG luminance', () =>
	expect(
		run('<body><p style="color:#777;background:#fff">x</p></body>', [{ id: 'c', kind: 'contrast', selector: 'p', min: 4.5 }])[0].ok
	).toBe(false));

describe('more of the DSL', () => {
	it('contrast passes for dark on light, reading the ancestor background', () =>
		expect(
			run('<body><div style="background:#ffffff"><p style="color:#111111">x</p></div></body>', [
				{ id: 'c', kind: 'contrast', selector: 'p', min: 4.5 }
			])[0].ok
		).toBe(true));
	it('count with min and max', () => {
		const html = '<body><p>a</p><p>b</p></body>';
		expect(run(html, [{ id: 'c', kind: 'count', selector: 'p', min: 2 }])[0].ok).toBe(true);
		expect(run(html, [{ id: 'c', kind: 'count', selector: 'p', max: 1 }])[0]).toEqual({ id: 'c', ok: false, detail: 'count:2' });
	});
	it('text with a regex, and an invalid regex fails with its detail', () => {
		expect(run('<body><h1>Привет</h1></body>', [{ id: 't', kind: 'text', selector: 'h1', matches: '^При' }])[0].ok).toBe(true);
		expect(run('<body><h1>x</h1></body>', [{ id: 't', kind: 'text', selector: 'h1', matches: '(' }])[0].detail).toBe('invalid-regex');
	});
	it('attr, with and without a pattern', () => {
		const html = '<body><a href="tel:+70000000000">Позвонить</a></body>';
		expect(run(html, [{ id: 'a', kind: 'attr', selector: 'a', name: 'href', matches: '^tel:' }])[0].ok).toBe(true);
		expect(run(html, [{ id: 'a', kind: 'attr', selector: 'a', name: 'href', matches: '^mailto:' }])[0].ok).toBe(false);
		expect(run(html, [{ id: 'a', kind: 'attr', selector: 'a', name: 'title' }])[0].ok).toBe(false);
	});
	it('style reads the computed value', () =>
		expect(
			run('<body><div class="cards" style="display:grid"></div></body>', [
				{ id: 's', kind: 'style', selector: '.cards', prop: 'display', equals: 'grid' }
			])[0].ok
		).toBe(true));
	it('lang reads the root element', () => {
		document.documentElement.lang = 'ru';
		expect(evaluate(document, window, [{ id: 'l', kind: 'lang', equals: 'ru' }], facts([], {}))[0].ok).toBe(true);
		document.documentElement.lang = 'en';
		expect(evaluate(document, window, [{ id: 'l', kind: 'lang', equals: 'ru' }], facts([], {}))[0]).toEqual({ id: 'l', ok: false, detail: 'lang:en' });
	});
	it('label accepts a wrapping label and aria-label, and ignores hidden and submit inputs', () =>
		expect(
			run('<body><label>Имя <input></label><input aria-label="Телефон"><input type=hidden><input type=submit></body>', [
				{ id: 'l', kind: 'label' }
			])[0].ok
		).toBe(true));
	it('an invalid selector fails the check instead of throwing', () =>
		expect(run('<body></body>', [{ id: 'e', kind: 'exists', selector: '[[' }])[0]).toEqual({ id: 'e', ok: false, detail: 'invalid-selector' }));
	it('an empty field fails', () =>
		expect(run('<body><h1>x</h1></body>', [{ id: 'f', kind: 'field', selector: 'h1', field: 'name' }], {})[0].detail).toBe('empty-field'));
	it('describes a check for people', () =>
		expect(describeCheck({ id: 'h', kind: 'exists', selector: 'h1' })).toMatch(/h1/));
});

it('evaluate is self-contained: it runs after a round trip through toString', () => {
	const rebuilt = new Function(`return (${evaluate.toString()})`)() as typeof evaluate;
	document.documentElement.innerHTML = '<body><h1>x</h1><font>y</font></body>';
	expect(rebuilt(document, window, [{ id: 'h', kind: 'exists', selector: 'h1' }, { id: 'n', kind: 'noTag', tags: ['font'] }], facts([], {})).map((r: { ok: boolean }) => r.ok)).toEqual([true, false]);
});

describe('an attribute pattern in the checklist', () => {
	const say = (matches: string) => describeCheck({ id: 'a', kind: 'attr', selector: 'a', name: 'href', matches } as never);
	it('reads a plain pattern as words', () => {
		expect(say('^tel:')).toBe('Атрибут href у a начинается с tel:');
		expect(say('^#top$')).toBe('Атрибут href у a: #top');
		expect(say('^privacy\\.html$')).toBe('Атрибут href у a: privacy.html');
		expect(say('width=device-width')).toBe('В атрибуте href у a есть width=device-width');
	});
	it('never shows a real regex to the learner', () => {
		for (const p of ['\\S', '^https://\\S+', '^\\d{4}-\\d{2}-\\d{2}$', 'light\\s+dark|dark\\s+light'])
			expect(say(p)).toBe('Атрибут href у a подходит под образец');
	});
});
