/**
 * A deliberately tiny template language for practice files (spec §3.2): `{{field}}`,
 * `{{a.b}}`, `{{.}}` inside a loop, and `{{#each list}}…{{/each}}`. No expressions, no partials,
 * no raw output: every value is HTML-escaped, because the values are the person's own words.
 */
import { TEMPLATES, defaultPersona, type Brief, type Kind, type Persona } from './fields.ts';

export { TEMPLATES, defaultPersona };

const escape = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function lookup(scope: unknown[], path: string): unknown {
	if (path === '.') return scope[0];
	for (const s of scope) {
		let v: unknown = s;
		for (const part of path.split('.')) v = v && typeof v === 'object' ? (v as Record<string, unknown>)[part] : undefined;
		if (v !== undefined) return v;
	}
	return undefined;
}

function show(v: unknown): string {
	if (v === undefined || v === null) return '';
	if (Array.isArray(v)) return v.map(show).join(', ');
	if (typeof v === 'object') return '';
	return escape(String(v));
}

function run(template: string, scope: unknown[]): string {
	let out = '';
	let i = 0;
	const open = /\{\{#each\s+([\w.]+)\s*\}\}/g;
	while (i < template.length) {
		open.lastIndex = i;
		const m = open.exec(template);
		if (!m) {
			out += vars(template.slice(i), scope);
			break;
		}
		out += vars(template.slice(i, m.index), scope);
		// find the matching {{/each}}, counting nested loops
		let depth = 1;
		let j = m.index + m[0].length;
		const tag = /\{\{(#each\s+[\w.]+|\/each)\s*\}\}/g;
		let end = -1,
			endLen = 0;
		tag.lastIndex = j;
		for (let t = tag.exec(template); t; t = tag.exec(template)) {
			depth += t[1] === '/each' ? -1 : 1;
			if (depth === 0) {
				end = t.index;
				endLen = t[0].length;
				break;
			}
		}
		if (end < 0) throw new Error(`render: {{#each ${m[1]}}} has no {{/each}}`);
		const body = template.slice(j, end);
		const list = lookup(scope, m[1]);
		if (Array.isArray(list)) for (const item of list) out += run(body, [item, ...scope]);
		i = end + endLen;
	}
	return out;
}

const vars = (s: string, scope: unknown[]) => s.replace(/\{\{\s*([\w.]+|\.)\s*\}\}/g, (_, p: string) => show(lookup(scope, p)));

export function render(template: string, p: Persona | Record<string, unknown>): string {
	return run(template, [p]);
}

const filled = (v: unknown) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);

/** The person's own fields over that kind's template. Empty values keep the default. */
export function merged(own: Partial<Persona> | Record<string, unknown>, kind?: Kind): Persona {
	const k = (kind ?? (own as Partial<Persona>).kind ?? 'expert') as Kind;
	const base = structuredClone(TEMPLATES[k] ?? defaultPersona);
	const out: Record<string, unknown> = { ...base };
	for (const [key, v] of Object.entries(own)) {
		if (!filled(v)) continue;
		const prior = out[key];
		out[key] = prior && typeof prior === 'object' && !Array.isArray(prior) && typeof v === 'object' && !Array.isArray(v) ? { ...prior, ...v } : v;
	}
	out.kind = k;
	return out as Persona;
}

const ACTIONS: [RegExp, Brief['mainAction']['kind']][] = [
	[/позвон|звон|телефон/i, 'call'],
	[/запис|заброн|бронь|приём|прием/i, 'book'],
	[/куп|заказ|оплат/i, 'buy'],
	[/подпис|регистр|вступ|присоедин|попроб/i, 'signup'],
	[/прочит|узна|почита|посмотр/i, 'read']
];

/** The prologue's three answers, as the start of a brief. */
export function fromAnswers(a: { who: string; forWhom: string; action: string }): Partial<Brief> {
	const who = a.who.trim(),
		forWhom = a.forWhom.trim(),
		label = a.action.trim();
	const kind = ACTIONS.find(([re]) => re.test(label))?.[1] ?? 'form';
	return { title: who, who, forWhom, mainAction: { label, kind } };
}
