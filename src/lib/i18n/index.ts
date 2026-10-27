/**
 * UI strings. Every visible string in a component comes from a catalogue here, so that English
 * can follow as a second JSON file without touching a component (spec §4.2).
 */
import ru from './ru.json';

const dict: Record<string, string> = ru;

export function t(key: string, vars: Record<string, string | number> = {}): string {
	const s = dict[key];
	if (s === undefined) throw new Error(`i18n: missing key ${key}`);
	return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Russian plural forms: one (1, 21), few (2–4, 22–24), many (5–20, 11–14, 25…). */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
	const m10 = Math.abs(n) % 10,
		m100 = Math.abs(n) % 100;
	if (m10 === 1 && m100 !== 11) return one;
	if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
	return many;
}

export function has(key: string): boolean {
	return key in dict;
}

/** A plural from a catalogue entry of three forms joined by «|»: pl(5, 'day.forms') → «дней». */
export function pl(n: number, key: string): string {
	return plural(n, t(key).split('|') as [string, string, string]);
}
