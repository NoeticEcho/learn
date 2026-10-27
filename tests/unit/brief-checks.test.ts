// @vitest-environment jsdom
/**
 * Checks that read the brief by a path (spec §3.1b): lists and nested fields, not only the flat
 * card. `facts` resolves the paths outside the sandbox; `evaluate` sees only the resolved values.
 */
import { it, expect, describe } from 'vitest';
import { evaluate, facts, briefValues, describeCheck } from '#lib/practice/checks.ts';
import { Check } from '#lib/practice/checks.schema.ts';
import { defaultPersona, TEMPLATES } from '#lib/persona/fields.ts';

const brief = {
	name: 'Мария',
	mainAction: { label: 'Записаться', kind: 'book' },
	sections: ['О нас', 'Услуги', 'Контакты'],
	items: [
		{ title: 'Стрижка', text: 'Час', price: '0 000 ₽' },
		{ title: 'Окрашивание', text: 'Два часа' }
	],
	languages: ['ru', 'en'],
	contacts: { phone: '+7 000' }
};

const run = (html: string, checks: unknown[], p: Record<string, unknown> = brief) => {
	document.documentElement.innerHTML = html;
	return evaluate(document, window, checks as never, facts(checks as never, p));
};

describe('briefValues', () => {
	it('reads a flat field, a nested one, an index and a whole list', () => {
		expect(briefValues(brief, 'name')).toEqual(['Мария']);
		expect(briefValues(brief, 'mainAction.label')).toEqual(['Записаться']);
		expect(briefValues(brief, 'brief.mainAction.label')).toEqual(['Записаться']);
		expect(briefValues(brief, 'sections[0]')).toEqual(['О нас']);
		expect(briefValues(brief, 'items[1].title')).toEqual(['Окрашивание']);
		expect(briefValues(brief, 'items.1.title')).toEqual(['Окрашивание']);
		expect(briefValues(brief, 'sections')).toEqual(['О нас', 'Услуги', 'Контакты']);
		expect(briefValues(brief, 'items[].title')).toEqual(['Стрижка', 'Окрашивание']);
		expect(briefValues(brief, 'items[].price')).toEqual(['0 000 ₽']);
		expect(briefValues(brief, 'items[5].title')).toEqual([]);
		expect(briefValues(brief, 'nothing.here')).toEqual([]);
	});
});

describe('field with a path', () => {
	it('a nested field must appear in the selector’s text', () => {
		const c = [{ id: 'a', kind: 'field', selector: 'a', field: 'mainAction.label' }];
		expect(run('<body><a>Записаться</a></body>', c)[0].ok).toBe(true);
		expect(run('<body><a>Купить</a></body>', c)[0].ok).toBe(false);
	});
	it('a list field needs every item, each in some element', () => {
		const c = [{ id: 's', kind: 'field', selector: 'nav li', field: 'sections' }];
		expect(run('<body><nav><li>О нас</li><li>Услуги</li><li>Контакты</li></nav></body>', c)[0].ok).toBe(true);
		expect(run('<body><nav><li>О нас</li><li>Услуги</li></nav></body>', c)[0]).toEqual({ id: 's', ok: false, detail: 'found:2/3' });
	});
	it('with min, a list field needs only that many of its items', () => {
		const c = [{ id: 's', kind: 'field', selector: 'nav li', field: 'sections', min: 2 }];
		expect(run('<body><nav><li>О нас</li><li>Услуги</li></nav></body>', c)[0].ok).toBe(true);
	});
	it('a list of objects is read by a path through []', () => {
		const c = [{ id: 'i', kind: 'field', selector: '.item h3', field: 'items[].title' }];
		expect(run('<body><div class="item"><h3>Стрижка</h3></div><div class="item"><h3>Окрашивание</h3></div></body>', c)[0].ok).toBe(true);
	});
	it('an empty list fails as an empty field', () =>
		expect(run('<body><li>x</li></body>', [{ id: 's', kind: 'field', selector: 'li', field: 'sections' }], { sections: [] })[0].detail).toBe('empty-field'));
});

describe('count bounded by the brief', () => {
	it('min is a list’s length', () => {
		const c = [{ id: 'n', kind: 'count', selector: 'nav a', min: { brief: 'sections' } }];
		expect(run('<body><nav><a>1</a><a>2</a><a>3</a></nav></body>', c)[0].ok).toBe(true);
		expect(run('<body><nav><a>1</a><a>2</a></nav></body>', c)[0]).toEqual({ id: 'n', ok: false, detail: 'count:2' });
	});
	it('max is a list’s length too', () => {
		const c = [{ id: 'n', kind: 'count', selector: '.item', max: { brief: 'items' } }];
		expect(run('<body><p class="item"></p><p class="item"></p><p class="item"></p></body>', c)[0].ok).toBe(false);
	});
});

describe('when: a check that applies only to some briefs', () => {
	it('passes as skipped when the brief does not contain the value', () => {
		const c = [{ id: 'h', kind: 'exists', selector: 'link[hreflang]', when: { brief: 'languages', contains: 'en' } }];
		expect(run('<body></body>', c, { ...brief, languages: ['ru'] })[0]).toEqual({ id: 'h', ok: true, detail: 'skipped' });
		expect(run('<body></body>', c)[0].ok).toBe(false);
	});
	it('equals and filled', () => {
		const eq = [{ id: 'f', kind: 'exists', selector: 'form', when: { brief: 'mainAction.kind', equals: 'form' } }];
		expect(run('<body></body>', eq)[0].detail).toBe('skipped');
		const filled = [{ id: 'p', kind: 'exists', selector: '.price', when: { brief: 'items[].price' } }];
		expect(run('<body></body>', filled)[0].ok).toBe(false);
		expect(run('<body></body>', filled, { items: [{ title: 'x' }] })[0].detail).toBe('skipped');
	});
});

describe('the schema', () => {
	const ok = (c: unknown) => Check.safeParse(c).success;
	it('accepts paths that exist in the brief', () => {
		expect(ok({ id: 'a', kind: 'field', selector: 'a', field: 'mainAction.label' })).toBe(true);
		expect(ok({ id: 'a', kind: 'field', selector: 'a', field: 'items[].title', min: 1 })).toBe(true);
		expect(ok({ id: 'a', kind: 'count', selector: 'a', min: { brief: 'sections' } })).toBe(true);
		expect(ok({ id: 'a', kind: 'exists', selector: 'a', when: { brief: 'languages', contains: 'en' } })).toBe(true);
	});
	it('rejects a path the brief does not have, so a typo fails the build', () => {
		expect(ok({ id: 'a', kind: 'field', selector: 'a', field: 'section' })).toBe(false);
		expect(ok({ id: 'a', kind: 'field', selector: 'a', field: 'mainAction.title' })).toBe(false);
		expect(ok({ id: 'a', kind: 'count', selector: 'a', min: { brief: 'name' } })).toBe(false); // not a list
		expect(ok({ id: 'a', kind: 'exists', selector: 'a', when: { brief: 'langs', contains: 'en' } })).toBe(false);
	});
	it('every template answers the paths the default persona answers, as a list where it is one', () => {
		for (const t of Object.values(TEMPLATES)) {
			expect(Array.isArray(t.sections)).toBe(true);
			expect(typeof t.mainAction.label).toBe('string');
		}
		expect(briefValues(defaultPersona, 'sections').length).toBeGreaterThan(0);
	});
});

it('describes a path check in words', () => {
	expect(describeCheck({ id: 'a', kind: 'field', selector: 'nav', field: 'sections' } as never)).toMatch(/раздел/i);
	expect(describeCheck({ id: 'a', kind: 'field', selector: 'nav', field: 'sections[0]' } as never)).toMatch(/1/);
	expect(describeCheck({ id: 'a', kind: 'count', selector: 'nav a', min: { brief: 'sections' } } as never)).toMatch(/раздел/i);
});

it('the sandbox gets resolved values, not the whole brief', async () => {
	const { buildSrcdoc } = await import('#lib/practice/sandbox.ts');
	const html = buildSrcdoc({ 'index.html': '' }, [{ id: 'a', kind: 'field', selector: 'a', field: 'mainAction.label' }], { ...brief, bio: 'секретная биография' });
	expect(html).toContain('Записаться');
	expect(html).not.toContain('секретная биография');
});

it('evaluate stays self-contained with paths, bounds and when', () => {
	const rebuilt = new Function(`return (${evaluate.toString()})`)() as typeof evaluate;
	const checks = [
		{ id: 'f', kind: 'field', selector: 'li', field: 'sections' },
		{ id: 'n', kind: 'count', selector: 'li', min: { brief: 'sections' } },
		{ id: 'w', kind: 'exists', selector: 'form', when: { brief: 'languages', contains: 'de' } }
	] as never;
	document.documentElement.innerHTML = '<body><li>О нас</li><li>Услуги</li><li>Контакты</li></body>';
	expect(rebuilt(document, window, checks, facts(checks, brief)).map((r) => r.ok)).toEqual([true, true, true]);
});
