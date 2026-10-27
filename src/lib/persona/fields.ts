/**
 * The persona's fields, without the schema library: the types, the templates per kind, and the
 * list of fields a person can replace with their own (spec §3.2, «вписать свои данные»).
 * Every template is fictional: the city is «Заречье», names are invented, and every number is
 * zeros or shaped 00-00-00, so nothing can be mistaken for a real person or registry entry.
 */
import type { Brief, Persona } from './brief.schema.ts';
import expert from './default.ru.json';
import others from './templates.ru.json';

export type { Brief, Persona };
export type Kind = Brief['kind'];

export const defaultPersona = expert as Persona;

export const TEMPLATES: Record<Kind, Persona> = { expert: defaultPersona, ...(others as Record<Exclude<Kind, 'expert'>, Persona>) };

export const KINDS: Kind[] = ['expert', 'portfolio', 'shop', 'venue', 'community', 'event', 'saas', 'custom'];

/** The simple fields the settings page offers to replace, in order. */
export const EDITABLE: { key: keyof Persona; multiline?: boolean }[] = [
	{ key: 'name' },
	{ key: 'profession' },
	{ key: 'city' },
	{ key: 'phone' },
	{ key: 'email' },
	{ key: 'title' },
	{ key: 'who', multiline: true },
	{ key: 'forWhom', multiline: true },
	{ key: 'bio', multiline: true }
];
