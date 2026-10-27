/**
 * The checks DSL's evaluator (spec §4.4). A practice step declares checks; this runs them against
 * the person's page, inside the sandboxed preview, and the results are posted back to the app.
 *
 * `evaluate` must be self-contained: `sandbox.ts` serialises it with `toString()` into the
 * preview, where nothing can be imported. So every helper is declared inside it, and this file
 * imports types only. A test rebuilds it from its source to keep that true.
 *
 * Results carry short machine details (`count:3`, `invalid-regex`), not prose: the sandbox has
 * no i18n, and the app turns a result into words.
 */
import type { Check, CheckResult, Facts } from './checks.schema.ts';
import { t, has } from '#lib/i18n/index.ts';
import { briefValues, briefCount, segments } from './brief-path.ts';

export type { Check, CheckResult, Facts };
export { briefValues, briefCount };

/** The brief's values at every path the checks name, and the lengths their counts need. */
export function facts(checks: Check[], brief: Record<string, unknown>): Facts {
	const out: Facts = { values: {}, counts: {} };
	for (const c of checks) {
		if (c.when) out.values[c.when.brief] = briefValues(brief, c.when.brief);
		if (c.kind === 'field') out.values[c.field] = briefValues(brief, c.field);
		if (c.kind === 'count')
			for (const b of [c.min, c.max]) if (b && typeof b === 'object') out.counts[b.brief] = briefCount(brief, b.brief);
	}
	return out;
}

export function evaluate(doc: Document, win: Window, checks: Check[], facts: Facts): CheckResult[] {
	const values = (path: string): string[] => facts?.values?.[path] ?? [];
	// What the sandbox adds to the page carries this mark (sandbox.ts SANDBOX_MARK); the checks
	// look only at what the person wrote.
	const mine = (els: ArrayLike<Element>): Element[] => Array.from(els).filter((e) => !e.hasAttribute('data-learn-sandbox'));
	const all = (selector: string): Element[] | null => {
		try {
			return mine(doc.querySelectorAll(selector));
		} catch {
			return null;
		}
	};
	const regex = (source: string): RegExp | null => {
		try {
			return new RegExp(source, 'u');
		} catch {
			return null;
		}
	};
	const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

	const parseColour = (c: string): [number, number, number, number] | null => {
		const s = c.trim().toLowerCase();
		let m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
		if (m) {
			const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
			return [+m[1], +m[2], +m[3], a];
		}
		m = s.match(/^#([0-9a-f]{3,8})$/);
		if (m) {
			let h = m[1];
			if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
			const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
			return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
		}
		if (s === 'transparent') return [0, 0, 0, 0];
		if (s === 'white') return [255, 255, 255, 1];
		if (s === 'black') return [0, 0, 0, 1];
		return null;
	};
	const luminance = ([r, g, b]: number[]) => {
		const lin = (v: number) => {
			const x = v / 255;
			return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
		};
		return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
	};
	const background = (el: Element): number[] => {
		for (let e: Element | null = el; e; e = e.parentElement) {
			const c = parseColour(win.getComputedStyle(e).backgroundColor || '');
			if (c && c[3] > 0) return c;
		}
		return [255, 255, 255, 1]; // the canvas
	};

	const labelled = (el: Element): boolean => {
		if (el.getAttribute('aria-label')?.trim()) return true;
		if (el.getAttribute('aria-labelledby')) return true;
		if (el.closest('label')) return true;
		const id = el.getAttribute('id');
		if (id) for (const l of Array.from(doc.querySelectorAll('label'))) if (l.getAttribute('for') === id) return true;
		return false;
	};

	/** A `when` that does not hold: the check does not apply to this brief. */
	const skipped = (c: Check): boolean => {
		if (!c.when) return false;
		const got = values(c.when.brief).map(norm);
		if (c.when.contains !== undefined) return !got.includes(norm(c.when.contains));
		if (c.when.equals !== undefined) return !(got.length === 1 && got[0] === norm(c.when.equals));
		return got.length === 0;
	};
	const limit = (b: number | { brief: string } | undefined): number | undefined =>
		b === undefined ? undefined : typeof b === 'number' ? b : (facts?.counts?.[b.brief] ?? 0);

	const one = (c: Check): CheckResult => {
		const ok = (v: boolean, detail?: string): CheckResult => (v || !detail ? { id: c.id, ok: v } : { id: c.id, ok: v, detail });
		if (skipped(c)) return { id: c.id, ok: true, detail: 'skipped' };
		switch (c.kind) {
			case 'exists': {
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				return ok(els.length > 0, 'none');
			}
			case 'count': {
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				const n = els.length;
				const [min, max] = [limit(c.min), limit(c.max)];
				return ok((min === undefined || n >= min) && (max === undefined || n <= max), `count:${n}`);
			}
			case 'text': {
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				const re = regex(c.matches);
				if (!re) return ok(false, 'invalid-regex');
				if (!els.length) return ok(false, 'none');
				return ok(els.some((e) => re.test(e.textContent ?? '')), 'no-match');
			}
			case 'attr': {
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				if (!els.length) return ok(false, 'none');
				const re = c.matches === undefined ? null : regex(c.matches);
				if (c.matches !== undefined && !re) return ok(false, 'invalid-regex');
				const has = els.filter((e) => e.hasAttribute(c.name));
				if (!has.length) return ok(false, 'no-attr');
				return ok(!re || has.some((e) => re.test(e.getAttribute(c.name) ?? '')), 'no-match');
			}
			case 'style': {
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				if (!els.length) return ok(false, 'none');
				const v = win.getComputedStyle(els[0]).getPropertyValue(c.prop).trim();
				if (c.equals !== undefined) return ok(v === c.equals, `value:${v}`);
				const re = c.matches === undefined ? null : regex(c.matches);
				if (c.matches !== undefined && !re) return ok(false, 'invalid-regex');
				return ok(re ? re.test(v) : v !== '', `value:${v}`);
			}
			case 'contrast': {
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				if (!els.length) return ok(false, 'none');
				const fg = parseColour(win.getComputedStyle(els[0]).color || '');
				if (!fg) return ok(false, 'unknown-colour');
				const bg = background(els[0]);
				// a translucent text colour is composited over its background
				const a = fg[3];
				const mixed = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
				const [l1, l2] = [luminance(mixed), luminance(bg)].sort((x, y) => y - x);
				const ratio = (l1 + 0.05) / (l2 + 0.05);
				return ok(ratio >= c.min, `ratio:${ratio.toFixed(2)}`);
			}
			case 'label': {
				const fields = Array.from(doc.querySelectorAll('input, select, textarea')).filter((e) => {
					const type = (e.getAttribute('type') ?? '').toLowerCase();
					return !['hidden', 'submit', 'button', 'reset', 'image'].includes(type);
				});
				const bare = fields.filter((e) => !labelled(e)).length;
				return ok(bare === 0, `unlabelled:${bare}`);
			}
			case 'lang': {
				const lang = (doc.documentElement.getAttribute('lang') ?? '').toLowerCase();
				const want = c.equals.toLowerCase();
				return ok(lang === want || lang.startsWith(`${want}-`), `lang:${lang}`);
			}
			case 'noTag': {
				const found = c.tags.filter((tag) => mine(doc.getElementsByTagName(tag)).length > 0);
				return ok(found.length === 0, `found:${found.join(',')}`);
			}
			case 'field': {
				const want = values(c.field).map(norm).filter(Boolean);
				if (!want.length) return ok(false, 'empty-field');
				const els = all(c.selector);
				if (!els) return ok(false, 'invalid-selector');
				if (!els.length) return ok(false, 'none');
				const texts = els.map((e) => norm(e.textContent ?? ''));
				const found = want.filter((w) => texts.some((x) => x.includes(w))).length;
				if (want.length === 1 && c.min === undefined) return ok(found === 1, 'no-match');
				return ok(found >= Math.min(c.min ?? want.length, want.length), `found:${found}/${want.length}`);
			}
			default:
				return { id: (c as { id: string }).id, ok: false, detail: 'unknown-check' };
		}
	};

	return checks.map((c) => {
		try {
			return one(c);
		} catch (e) {
			return { id: c.id, ok: false, detail: `error:${e instanceof Error ? e.message : String(e)}` };
		}
	});
}

/** A check, in words, for the checklist beside the preview. Not used inside the sandbox. */
export function describeCheck(c: Check): string {
	switch (c.kind) {
		case 'exists':
			return t('check.exists', { selector: c.selector });
		case 'count': {
			const fromBrief = [c.min, c.max].find((b) => typeof b === 'object');
			if (fromBrief && typeof fromBrief === 'object') {
				const field = fieldLabel(fromBrief.brief);
				if (c.min !== undefined && c.max !== undefined) return t('check.count.brief.equal', { selector: c.selector, field });
				return t(c.min !== undefined ? 'check.count.brief.min' : 'check.count.brief.max', { selector: c.selector, field });
			}
			return c.max === undefined
				? t('check.count.min', { selector: c.selector, min: Number(c.min ?? 0) })
				: c.min === undefined
					? t('check.count.max', { selector: c.selector, max: Number(c.max) })
					: t('check.count.range', { selector: c.selector, min: Number(c.min), max: Number(c.max) });
		}
		case 'text':
			return t('check.text', { selector: c.selector });
		case 'attr': {
			if (c.matches === undefined) return t('check.attr', { selector: c.selector, name: c.name });
			const said = literal(c.matches);
			return said
				? t(`check.attr.${said.how}`, { selector: c.selector, name: c.name, text: said.text })
				: t('check.attr.matches', { selector: c.selector, name: c.name });
		}
		case 'style':
			return t('check.style', { selector: c.selector, prop: c.prop, value: c.equals ?? c.matches ?? '' });
		case 'contrast':
			return t('check.contrast', { selector: c.selector, min: c.min });
		case 'label':
			return t('check.label');
		case 'lang':
			return t('check.lang', { lang: c.equals });
		case 'noTag':
			return t('check.noTag', { tags: c.tags.map((x) => `<${x}>`).join(', ') });
		case 'field': {
			const field = fieldLabel(c.field);
			const list = !segments(c.field).some((s) => /^\d+$/.test(s)) && (c.field.includes('[]') || LISTS.has(segments(c.field).join('.')));
			if (c.min !== undefined) return t('check.field.some', { selector: c.selector, field, min: c.min });
			return t(list ? 'check.field.all' : 'check.field', { selector: c.selector, field });
		}
	}
}

/**
 * A pattern a person can read as words: `^tel:` is «начинается с tel:», `^#top$` is «равен
 * #top». Anything with real regex in it is said as «подходит под образец», never shown raw:
 * the checklist is for the learner, and `^\\s*\\S[\\s\\S]{48,158}` tells them nothing.
 */
export function literal(pattern: string): { how: 'equals' | 'starts' | 'ends' | 'contains'; text: string } | null {
	const start = pattern.startsWith('^');
	const end = pattern.endsWith('$') && !pattern.endsWith('\\$');
	const body = pattern.slice(start ? 1 : 0, end ? -1 : undefined);
	if (/(^|[^\\])[\^$.*+?()[\]{}|]/.test(body) || /\\[a-zA-Z0-9]/.test(body)) return null;
	const text = body.replace(/\\(.)/g, '$1');
	if (!text) return null;
	return { how: start && end ? 'equals' : start ? 'starts' : end ? 'ends' : 'contains', text };
}

/** The brief's lists of values, which a `field` check reads item by item. */
const LISTS = new Set(['sections', 'languages', 'services']);

/** A brief path in words: `items[1].title` → «названия услуг, №2». Unknown paths are shown as written. */
export function fieldLabel(path: string): string {
	const segs = segments(path);
	const key = `field.${segs.filter((s) => s !== '*' && !/^\d+$/.test(s)).join('.')}`;
	const label = has(key) ? t(key) : path;
	const index = segs.find((s) => /^\d+$/.test(s));
	return index === undefined ? label : t('field.nth', { field: label, n: Number(index) + 1 });
}
