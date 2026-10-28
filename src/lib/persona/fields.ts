/**
 * The persona's fields, without the schema library: the types, the templates per kind in each
 * edition, and the list of fields a person can replace with their own (spec §3.2, «вписать свои
 * данные»). Every template is fictional: the town is «Заречье» in Russian and Riverbend in
 * English, names are invented, and every number is zeros or shaped 00-00-00, so nothing can be
 * mistaken for a real person or registry entry.
 *
 * **The templates are the edition's, the person's brief is theirs.** An English page fills an
 * empty field from the English template and a Russian page from the Russian one; what the person
 * wrote is shown as they wrote it, in either edition, and is never translated.
 */
import { getLocale, type Locale } from '#lib/i18n/index.ts';
import type { Brief, Persona } from './brief.schema.ts';
import { defaultPersona, defaultPersonaFor } from './defaults.ts';
import othersRu from './templates.ru.json';
import othersEn from './templates.en.json';

export type { Brief, Persona };
export type Kind = Brief['kind'];
export { defaultPersona, defaultPersonaFor };

const others: Record<Locale, Record<Exclude<Kind, 'expert'>, Persona>> = {
	ru: othersRu as Record<Exclude<Kind, 'expert'>, Persona>,
	en: othersEn as Record<Exclude<Kind, 'expert'>, Persona>
};

/** Every kind's template in an edition: the page's own by default. */
export const templatesFor = (l: Locale = getLocale()): Record<Kind, Persona> => ({ expert: defaultPersonaFor(l), ...others[l] });

/** The Russian templates, as before there were editions. */
export const TEMPLATES: Record<Kind, Persona> = templatesFor('ru');

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
