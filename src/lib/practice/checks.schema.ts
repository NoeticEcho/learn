/**
 * The checks DSL's shape (spec §4.4). A practice step declares what the person's page must do;
 * `checks.ts` evaluates it inside the sandbox.
 *
 * This file holds the Zod schema and the types inferred from it. `checks.ts` imports only the
 * types, so its evaluation path has no runtime import and can be serialised into the sandbox
 * with `toString()`.
 *
 * A path into the brief (`brief-path.ts`) is checked here against the brief's schema, so a typo
 * (`section`, `mainAction.title`) fails `content:check` and the build rather than a learner's
 * practice. A path that names an optional field, or an item a short template lacks, is valid:
 * the check then fails for that person as an empty field, which tells them to fill the brief.
 */
import { z } from 'zod';
import { Persona } from '#lib/persona/brief.schema.ts';
import { segments } from './brief-path.ts';

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'a check id is lowercase, digits and dashes');
const selector = z.string().min(1);

type Leaf = 'value' | 'list' | 'objects' | null;

/** What a path names in the brief's schema: a value, a list of values, a list of objects, or nothing. */
export function pathShape(path: string): Leaf {
	let node: z.ZodType = Persona;
	let fanned = false;
	for (const seg of segments(path)) {
		while (node instanceof z.ZodOptional) node = node.unwrap() as z.ZodType;
		if (seg === '*' || /^\d+$/.test(seg)) {
			if (!(node instanceof z.ZodArray)) return null;
			node = node.element as z.ZodType;
			if (seg === '*') fanned = true;
		} else if (node instanceof z.ZodObject) {
			const next = (node.shape as Record<string, z.ZodType>)[seg];
			if (!next) return null;
			node = next;
		} else return null;
	}
	const bare = (n: z.ZodType): z.ZodType => (n instanceof z.ZodOptional ? bare(n.unwrap() as z.ZodType) : n);
	node = bare(node);
	if (node instanceof z.ZodArray) return bare(node.element as z.ZodType) instanceof z.ZodObject ? 'objects' : 'list';
	if (node instanceof z.ZodObject) return fanned ? 'objects' : null;
	return fanned ? 'list' : 'value';
}

const pathSyntax = z.string().regex(/^(brief\.)?[a-zA-Z]+(\[\d*\]|\.[a-zA-Z0-9]+)*$/, 'a brief path is like mainAction.label, sections[0] or items[].title');

/** A path to a value or a list of values (a list of objects needs `[].field`). */
const valuePath = pathSyntax.refine((p) => ['value', 'list'].includes(pathShape(p) ?? ''), 'the brief has no text at this path (a list of objects needs [].field)');

/** A path to a list, whose length bounds a count. */
const listPath = pathSyntax.refine((p) => ['list', 'objects'].includes(pathShape(p) ?? ''), 'the brief has no list at this path');

/** A count's bound: a number, or the length of a list in the person's brief. */
const bound = z.union([z.number().int().min(0), z.object({ brief: listPath }).strict()]);

/**
 * A check that applies only to some briefs: with `contains`, when a value at the path is that
 * value (a list contains it); with `equals`, when the value is it; with neither, when the path has
 * any value. A check whose condition does not hold passes, with the detail `skipped`.
 */
const When = z
	.object({ brief: pathSyntax.refine((p) => pathShape(p) !== null, 'the brief has nothing at this path'), contains: z.string().optional(), equals: z.string().optional() })
	.strict();

const base = { id, when: When.optional() };

export const Check = z.discriminatedUnion('kind', [
	z.object({ ...base, kind: z.literal('exists'), selector }),
	z.object({ ...base, kind: z.literal('count'), selector, min: bound.optional(), max: bound.optional() }),
	z.object({ ...base, kind: z.literal('text'), selector, matches: z.string() }),
	z.object({ ...base, kind: z.literal('attr'), selector, name: z.string().min(1), matches: z.string().optional() }),
	z.object({
		...base,
		kind: z.literal('style'),
		selector,
		prop: z.string().min(1),
		equals: z.string().optional(),
		matches: z.string().optional()
	}),
	z.object({ ...base, kind: z.literal('contrast'), selector, min: z.number().min(1).max(21) }),
	z.object({ ...base, kind: z.literal('label') }),
	z.object({ ...base, kind: z.literal('lang'), equals: z.string().min(2) }),
	z.object({ ...base, kind: z.literal('noTag'), tags: z.array(z.string().min(1)).min(1) }),
	/**
	 * The text of some `selector` element contains the brief's value at `field`. A list (`sections`,
	 * `items[].title`) needs every one of its values, each in some element, or `min` of them.
	 */
	z.object({ ...base, kind: z.literal('field'), selector, field: valuePath, min: z.number().int().min(1).optional() })
]);
export type Check = z.infer<typeof Check>;

export type CheckResult = { id: string; ok: boolean; detail?: string };

/** What the sandbox is given about the brief: only the paths the step's checks name, resolved. */
export type Facts = { values: Record<string, string[]>; counts: Record<string, number> };
