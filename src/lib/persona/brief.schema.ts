/**
 * The project brief (spec §3.1b): the structure every project shares, so that every practice
 * check can be written against fields and pass for anyone's project. The persona (§3.2) is the
 * expert's brief plus a biography.
 *
 * Zod lives here, apart from `fields.ts` and `render.ts`, so that rendering a practice page
 * does not bring the schema library into the lesson's bundle.
 */
import { z } from 'zod';

const s = z.string();

export const Kind = z.enum(['expert', 'portfolio', 'shop', 'venue', 'community', 'event', 'saas', 'custom']);
export const ActionKind = z.enum(['call', 'form', 'buy', 'book', 'signup', 'read']);

export const Brief = z.object({
	kind: Kind,
	title: s,
	who: s,
	forWhom: s,
	mainAction: z.object({ label: s, kind: ActionKind }),
	sections: z.array(s),
	items: z.array(z.object({ title: s, text: s, price: s.optional() })),
	people: z.array(z.object({ name: s, role: s, bio: s.optional() })),
	proofs: z.array(z.object({ title: s, text: s.optional(), image: s.optional() })),
	contacts: z.object({ phone: s.optional(), email: s.optional(), address: s.optional(), city: s.optional() }),
	languages: z.array(z.enum(['ru', 'en'])).min(1),
	tone: z.enum(['formal', 'warm', 'bold', 'calm'])
});
export type Brief = z.infer<typeof Brief>;

/**
 * The flat card fields that templates (`{{name}}`) and `field` checks read. They are the same
 * for every kind of project: `name` is the person's or the project's name, `profession` is what
 * it does, in a line.
 */
export const Card = z.object({
	name: s,
	profession: s,
	city: s,
	phone: s,
	email: s,
	bio: s,
	services: z.array(s)
});

export const Persona = Brief.extend(Card.shape).extend({
	education: z.array(z.object({ year: z.number().int(), text: s })),
	career: z.array(z.object({ from: z.number().int(), to: z.number().int().optional(), text: s })),
	documents: z.array(z.object({ title: s, image: s.optional() }))
});
export type Persona = z.infer<typeof Persona>;
