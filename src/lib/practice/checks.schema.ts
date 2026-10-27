/**
 * The checks DSL's shape (spec §4.4). A practice step declares what the person's page must do;
 * `checks.ts` evaluates it inside the sandbox.
 *
 * This file holds the Zod schema and the types inferred from it. `checks.ts` imports only the
 * types, so its evaluation path has no runtime import and can be serialised into the sandbox
 * with `toString()`.
 */
import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'a check id is lowercase, digits and dashes');
const selector = z.string().min(1);

export const Check = z.discriminatedUnion('kind', [
	z.object({ id, kind: z.literal('exists'), selector }),
	z.object({
		id,
		kind: z.literal('count'),
		selector,
		min: z.number().int().min(0).optional(),
		max: z.number().int().min(0).optional()
	}),
	z.object({ id, kind: z.literal('text'), selector, matches: z.string() }),
	z.object({ id, kind: z.literal('attr'), selector, name: z.string().min(1), matches: z.string().optional() }),
	z.object({
		id,
		kind: z.literal('style'),
		selector,
		prop: z.string().min(1),
		equals: z.string().optional(),
		matches: z.string().optional()
	}),
	z.object({ id, kind: z.literal('contrast'), selector, min: z.number().min(1).max(21) }),
	z.object({ id, kind: z.literal('label') }),
	z.object({ id, kind: z.literal('lang'), equals: z.string().min(2) }),
	z.object({ id, kind: z.literal('noTag'), tags: z.array(z.string().min(1)).min(1) }),
	z.object({ id, kind: z.literal('field'), selector, field: z.string().min(1) })
]);
export type Check = z.infer<typeof Check>;

export type CheckResult = { id: string; ok: boolean; detail?: string };
