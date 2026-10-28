/**
 * UI strings, in two editions: Russian (`ru.json`, the source) and English (`en.json`). Every
 * visible string in a component comes from a catalogue here, never from the component.
 *
 * **The locale is the page's.** The root layout's load names it from the URL (`/learn/…` is
 * Russian, `/learn/en/…` English) and calls `setLocale` before anything renders, on the server
 * while prerendering and in the browser on every navigation. `t` reads it. A module-level value
 * rather than a context because `t` is called from plain modules too (the checks DSL's labels,
 * the guide's errors), and it is safe on the server because a page's render is synchronous and
 * prerendering renders one page at a time. Code that runs outside a render (a server load, the
 * Open Graph cards, llms.txt) passes the locale explicitly: `t(key, vars, 'en')`.
 *
 * **English is loaded only by English pages.** Russian is bundled; `loadCatalogue('en')` imports
 * the English file as a chunk of its own, which the layout's load awaits, so a Russian visit pays
 * nothing for the second edition.
 *
 * **The two catalogues have the same keys, checked at compile time** (`KeysMatch` below fails
 * `npm run check` and names the keys), and at test time by tests/unit/i18n.test.ts.
 */
import ru from './ru.json';

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';
export const isLocale = (s: unknown): s is Locale => s === 'ru' || s === 'en';

type Ru = typeof ru;
type En = typeof import('./en.json');
export type Key = keyof Ru;

/** `true` when both catalogues have exactly the same keys; otherwise the keys that differ. */
type KeysMatch<A, B> = [Exclude<keyof A, keyof B>, Exclude<keyof B, keyof A>] extends [never, never]
	? true
	: { missingInEnglish: Exclude<keyof A, keyof B>; missingInRussian: Exclude<keyof B, keyof A> };
// A type error here names the keys one catalogue has and the other lacks.
export const keysMatch: KeysMatch<Ru, En> = true;

const catalogues: Partial<Record<Locale, Record<string, string>>> = { ru };

let current: Locale = DEFAULT_LOCALE;

export function setLocale(l: Locale): void {
	current = l;
}

export function getLocale(): Locale {
	return current;
}

/** Makes a catalogue available. Russian always is; English is fetched on first use. */
export async function loadCatalogue(l: Locale): Promise<void> {
	if (catalogues[l]) return;
	if (l === 'en') catalogues.en = (await import('./en.json')).default;
}

/** For tests and build-time code that has the catalogue already. */
export function registerCatalogue(l: Locale, dict: Record<string, string>): void {
	catalogues[l] = dict;
}

function dict(l: Locale): Record<string, string> {
	const d = catalogues[l];
	if (!d) throw new Error(`i18n: the ${l} catalogue is not loaded (loadCatalogue('${l}'))`);
	return d;
}

export function t(key: string, vars: Record<string, string | number> = {}, l: Locale = current): string {
	const s = dict(l)[key];
	if (s === undefined) throw new Error(`i18n: missing key ${key}`);
	return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function has(key: string, l: Locale = current): boolean {
	return key in dict(l);
}

/** Russian plural forms: one (1, 21), few (2–4, 22–24), many (5–20, 11–14, 25…). */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
	const m10 = Math.abs(n) % 10,
		m100 = Math.abs(n) % 100;
	if (m10 === 1 && m100 !== 11) return one;
	if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
	return many;
}

/**
 * A plural from a catalogue entry of forms joined by «|»: three in Russian (`день|дня|дней`),
 * two in English (`day|days`). pl(5, 'day.forms') → «дней», or «days».
 */
export function pl(n: number, key: string, l: Locale = current): string {
	const forms = t(key, {}, l).split('|');
	if (forms.length === 3) return plural(n, forms as [string, string, string]);
	return Math.abs(n) === 1 ? forms[0] : (forms[1] ?? forms[0]);
}

/** A number as the locale writes it: «1 234,5» or «1,234.5». */
export const number = (n: number, l: Locale = current) => n.toLocaleString(l === 'ru' ? 'ru-RU' : 'en-GB');

/** A date as the locale writes it: «28.10.2026» or «28 Oct 2026». */
export const date = (d: Date, l: Locale = current) =>
	l === 'ru' ? d.toLocaleDateString('ru-RU') : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * One value per locale, for strings that live outside the catalogues: a live diagram's own words
 * (content/diagrams/), the guide's system prompt. Falls back to Russian, the source edition.
 */
export function pick<T>(byLocale: { ru: T; en?: T }, l: Locale = current): T {
	return byLocale[l] ?? byLocale.ru;
}

/**
 * A title set mid-sentence, after a colon or in a list: «Теперь вы знаете: структура
 * HTML-документа, теги», «You now know: the structure of an HTML document». A common noun loses
 * its capital; an acronym (HTML, ИИ), a name (Flexbox, WordPress, Google) and a proper noun keep
 * theirs. Russian lowers only a Cyrillic capital, so a Latin name is always kept. English lowers
 * a first word written as an ordinary capitalised word, unless it is a name in `PROPER_EN`.
 */
const PROPER = new Set(['Яндекс', 'Искин', 'Эхо', 'Рунет', 'Россия', 'Тильда']);
const PROPER_EN = new Set([
	'Echo', 'Iskin', 'Runet', 'Russia', 'Russian', 'English', 'Google', 'Yandex', 'Tilda', 'Kubernetes', 'Docker',
	'Dockerfile', 'Markdown', 'Flexbox', 'Grid', 'Jamstack', 'Ogilvy', 'Cialdini', 'Freytag', 'Duarte', 'Harmon',
	'Kishōtenketsu', 'Strapi', 'Jekyll', 'Postgres', 'Material', 'Apple', 'Telegram', 'Netscape', 'Mosaic', 'Figma',
	'Lighthouse', 'Pixar', 'Hook', 'See', 'Before'
]);
export function midSentence(title: string, l: Locale = current): string {
	const [a, b] = title;
	if (!a || !b) return title;
	const first = title.split(/[\s,.:;!?»)]/)[0];
	if (l === 'en') {
		if (!/^[A-Z][a-z’'-]*$/.test(first) || first.length < 2 || PROPER_EN.has(first)) return title;
		return a.toLowerCase() + title.slice(1);
	}
	if (!/[А-ЯЁ]/.test(a) || !/[а-яё]/.test(b)) return title;
	if (PROPER.has(first)) return title;
	return a.toLowerCase() + title.slice(1);
}
