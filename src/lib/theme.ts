/**
 * The two NoeticEcho themes. Ink is the instrument at night; Paper is the reading room.
 * The choice is a per-viewer convenience, so it lives in localStorage (read before paint by
 * the inline script in app.html), not in the IndexedDB progress store.
 */
export type Theme = 'ink' | 'paper';

export const THEME_KEY = 'learn.theme';

export function resolveTheme(stored: string | null, prefersLight: boolean): Theme {
	if (stored === 'ink' || stored === 'paper') return stored;
	return prefersLight ? 'paper' : 'ink';
}

function stored(): string | null {
	try {
		return localStorage.getItem(THEME_KEY);
	} catch {
		return null;
	}
}

export function getTheme(): Theme {
	const light =
		typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches;
	return resolveTheme(stored(), light);
}

export function setTheme(t: Theme): void {
	try {
		localStorage.setItem(THEME_KEY, t);
	} catch {
		/* private mode: the choice lasts for this page only */
	}
	document.documentElement.dataset.theme = t;
}

export const theme = { get: getTheme, set: setTheme };
