/**
 * The default persona of each edition (spec §3.2): the expert's brief and biography. Apart from
 * the other templates so that home, which shows it in the prologue's example, does not carry
 * them all in its first-route bundle.
 */
import { getLocale, type Locale } from '#lib/i18n/index.ts';
import type { Persona } from './brief.schema.ts';
import ru from './default.ru.json';
import en from './default.en.json';

const byLocale: Record<Locale, Persona> = { ru: ru as Persona, en: en as Persona };

export const defaultPersonaFor = (l: Locale = getLocale()): Persona => byLocale[l];

/** The Russian edition's, as before there were editions. */
export const defaultPersona: Persona = byLocale.ru;
